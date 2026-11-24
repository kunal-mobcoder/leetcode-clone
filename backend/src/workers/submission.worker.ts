/**
 * Submission Judge Worker
 *
 * This process is started alongside the API server via
 * `npm run dev` (concurrently) or as its own container in
 * production. It consumes jobs from the BullMQ "submission"
 * queue with a concurrency of 3 so up to 3 Docker containers
 * can run code in parallel without blocking each other.
 */

import "dotenv/config";

import { Worker, type Job } from "bullmq";

import connectToDB from "../config/dbConnect.js";
import { bullmqConnection } from "../config/bullmq.js";
import { SUBMISSION_QUEUE_NAME } from "../queues/submission.queue.js";
import { judgeSubmission } from "../services/judge.service.js";
import { sweepOrphanedContainers } from "../services/codeExecutor.service.js";
import * as submissionRepository from "../repositories/submission.repository.js";


// ---------------------------------------------------------------------------
// Job payload type
// ---------------------------------------------------------------------------

interface SubmissionJobData {
    submissionId: string;
}


// ---------------------------------------------------------------------------
// Processor function — called by BullMQ for each job
// ---------------------------------------------------------------------------

async function processSubmission(job: Job<SubmissionJobData>): Promise<void> {
    const { submissionId } = job.data;

    console.log(`[worker] Processing submission ${submissionId} (attempt ${job.attemptsMade + 1})`);

    // Mark as running so the frontend can show a spinner
    const runningSubmission = await submissionRepository.updateSubmissionStatus(
        submissionId,
        "running"
    );

    if (!runningSubmission) {
        // Submission was deleted before the worker picked it up — skip silently
        console.warn(`[worker] Submission ${submissionId} not found; skipping`);
        return;
    }

    const result = await judgeSubmission(submissionId);

    if (!result) {
        throw new Error(`judgeSubmission returned null for ${submissionId}`);
    }

    console.log(`[worker] Submission ${submissionId} finished → ${result.status}`);
}


// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function startWorker() {
    try {
        await connectToDB();
        console.log("[worker] Connected to MongoDB");
    } catch (err) {
        console.error("[worker] Failed to connect to MongoDB:", err);
        process.exit(1);
    }

    const worker = new Worker<SubmissionJobData>(
        SUBMISSION_QUEUE_NAME,
        processSubmission,
        {
            connection: bullmqConnection,
            // Allow up to 3 submissions to be judged concurrently
            concurrency: 3,
        }
    );

    // ---------------------------------------------------------------------------
    // Worker event listeners
    // ---------------------------------------------------------------------------

    worker.on("active", (job) => {
        console.log(`[worker] Job active: ${job.id} (submission ${job.data.submissionId})`);
    });

    worker.on("completed", (job) => {
        console.log(`[worker] Job completed: ${job.id} (submission ${job.data.submissionId})`);
    });

    worker.on("failed", async (job, err) => {
        const submissionId = job?.data?.submissionId;
        console.error(`[worker] Job failed: ${job?.id} (submission ${submissionId})`, err);

        // On final failure mark submission as system_error
        if (submissionId && job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
            try {
                await submissionRepository.updateSubmissionResult(submissionId, {
                    status: "system_error",
                });
                console.log(`[worker] Submission ${submissionId} marked as system_error`);
            } catch (updateErr) {
                console.error(
                    `[worker] Failed to update submission ${submissionId} to system_error:`,
                    updateErr
                );
            }
        }
    });

    worker.on("error", (err) => {
        console.error("[worker] Worker error:", err);
    });

    // ---------------------------------------------------------------------------
    // Graceful shutdown
    // ---------------------------------------------------------------------------

    async function shutdown(signal: string) {
        console.log(`[worker] Received ${signal}. Shutting down gracefully…`);
        await worker.close();
        process.exit(0);
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // ---------------------------------------------------------------------------
    // Periodic orphan container sweep (every 60 s)
    // ---------------------------------------------------------------------------

    const SWEEP_INTERVAL_MS = 60_000;
    const sweepTimer = setInterval(async () => {
        try {
            const removed = await sweepOrphanedContainers(120);
            if (removed > 0) {
                console.log(`[worker] Orphan sweep removed ${removed} stale judge container(s)`);
            }
        } catch (err) {
            console.error("[worker] Orphan sweep error:", err);
        }
    }, SWEEP_INTERVAL_MS);

    // Don't let the timer prevent Node from exiting
    sweepTimer.unref();

    console.log(
        `[worker] Submission worker started (concurrency=3, queue="${SUBMISSION_QUEUE_NAME}")`
    );
}

startWorker();
