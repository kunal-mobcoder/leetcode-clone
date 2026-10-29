import { Queue } from "bullmq";
import { bullmqConnection } from "../config/bullmq.js";

export const SUBMISSION_QUEUE_NAME = "submission";

/**
 * BullMQ queue for code submissions.
 *
 * Jobs are added with their submissionId as the job name so
 * they are easy to identify in the BullMQ dashboard / logs.
 */
export const submissionQueue = new Queue(SUBMISSION_QUEUE_NAME, {
    connection: bullmqConnection,
    defaultJobOptions: {
        // Retry up to 2 times on unexpected worker crashes
        attempts: 2,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        // Keep completed/failed job records for observability
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 200 },
    },
});

/**
 * Enqueue a submission for judging.
 * The job payload only contains the submissionId so the
 * worker can fetch the full document from MongoDB (avoids
 * storing potentially large code strings in Redis).
 */
export async function enqueueSubmission(submissionId: string): Promise<void> {
    await submissionQueue.add(submissionId, { submissionId });
}
