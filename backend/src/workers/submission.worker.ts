import redisClient from "../config/redis.js";
import { dequeueSubmission } from "../queues/submission.queue.js";


async function startSubmissionWorker() {
    console.log("Submission worker started");

    while (true) {
        try {
            const submissionId = await dequeueSubmission();

            if (!submissionId) {
                await new Promise(
                    (resolve) =>
                        setTimeout(resolve, 1000)
                );
                continue;
            }

            console.log("Processing submission:", submissionId);

        } catch (error) {
            console.error("Submission worker error:", error);

            await new Promise(
                (resolve) =>
                    setTimeout(resolve, 1000)
            );
        }
    }
}


async function startWorker() {
    try {
        await import("dotenv/config");

        if (!redisClient.isOpen) {
            await redisClient.connect()
        }

        await startSubmissionWorker()

    } catch (error) {
        console.error("Failed to start submission worker:", error);

        process.exit(1);
    }
}

startWorker();