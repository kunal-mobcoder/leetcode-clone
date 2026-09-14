import "dotenv/config";

import connectToDB from "../config/dbConnect.js";
import {
    connectToRedis,
} from "../config/redis.js";

import {
    dequeueSubmission,
} from "../queues/submission.queue.js";

import {
    judgeSubmission,
} from "../services/judge.service.js";

import * as submissionRepository from "../repositories/submission.repository.js";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function startSubmissionWorker() {
    console.log("Submission worker started");

    while (true) {
        let submissionId: string | null = null;

        try {
            submissionId = await dequeueSubmission();

            if (!submissionId) {
                await sleep(1000);
                continue;
            }

            console.log(
                "Processing submission:",
                submissionId
            );

            const runningSubmission =
                await submissionRepository.updateSubmissionStatus(
                    submissionId,
                    "running"
                );

            if (!runningSubmission) {
                console.error(
                    "Submission not found:",
                    submissionId
                );

                continue;
            }

            console.log(
                "Submission marked as running:",
                submissionId
            );

            const result = await judgeSubmission(
                submissionId
            );

            if (!result) {
                console.error(
                    "Judge did not return a submission:",
                    submissionId
                );

                continue;
            }

            console.log(
                `Submission ${submissionId} finished with status: ${result.status}`
            );
        } catch (error) {
            console.error(
                "Submission worker error:",
                error
            );

            if (submissionId) {
                try {
                    await submissionRepository.updateSubmissionResult(
                        submissionId,
                        {
                            status: "system_error",
                        }
                    );

                    console.log(
                        `Submission ${submissionId} marked as system_error`
                    );
                } catch (updateError) {
                    console.error(
                        "Failed to update submission error status:",
                        updateError
                    );
                }
            }

            await sleep(1000);
        }
    }
}

async function startWorker() {
    try {
        await connectToDB();
        await connectToRedis();

        await startSubmissionWorker();
    } catch (error) {
        console.error(
            "Failed to start submission worker:",
            error
        );

        process.exit(1);
    }
}

startWorker();