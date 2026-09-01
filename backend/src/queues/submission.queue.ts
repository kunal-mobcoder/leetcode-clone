import redisClient from "../config/redis.js";

const SUBMISSION_QUEUE = "submission_queue";

/**
 * Add a submission ID to the judge queue.
 */
export async function enqueueSubmission(submissionId: string): Promise<void> {
    await redisClient.rPush(SUBMISSION_QUEUE, submissionId);
}


/**
 * Remove the next submission ID from the queue.
 */
export async function dequeueSubmission(): Promise<string | null> {
    return redisClient.lPop(SUBMISSION_QUEUE);
}


/**
 * Get the number of submissions currently waiting in the queue.
 */
export async function getSubmissionQueueLength(): Promise<number> {
    return redisClient.lLen(SUBMISSION_QUEUE);
}