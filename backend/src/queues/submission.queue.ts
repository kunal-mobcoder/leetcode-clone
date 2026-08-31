import redisClient from "../config/redis.js";

const SUBMISSION_QUEUE = "submission_queue";


/**
 * Add a submission to the judge queue.
 *
 * The queue stores only the submission ID.
 *
 * MongoDB remains the source of truth for the submission itself.
 */
export async function enqueueSubmission(submissionId: string) {
    await redisClient.rPush(SUBMISSION_QUEUE, submissionId)
}


/**
 * Remove and return the next submission from the queue.
 */
export async function dequeueSubmission() {
    return redisClient.lPop(SUBMISSION_QUEUE)
}


/**
 * Get the current number of submissions waiting in the queue.
 */
export async function getSubmissionQueueLength() {
    return redisClient.lLen(SUBMISSION_QUEUE)
}