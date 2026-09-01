import "dotenv/config";

import redisClient
    from "../config/redis.js";

import connectToDB
    from "../config/dbConnect.js";

import {
    dequeueSubmission,
} from "../queues/submission.queue.js";

import {
    updateSubmissionResult,
} from "../repositories/submission.repository.js";

import {
    judgeSubmission,
} from "../services/judge.service.js";


function sleep(
    milliseconds: number
) {

    return new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


async function startSubmissionWorker() {

    console.log(
        "Submission worker started"
    );


    while (true) {

        try {

            const submissionId =
                await dequeueSubmission();


            /*
             * No submission currently
             * waiting in Redis.
             */

            if (!submissionId) {

                await sleep(1000);

                continue;
            }


            console.log(
                "Processing submission:",
                submissionId
            );


            /*
             * ------------------------------------------------
             * Mark submission as running.
             * ------------------------------------------------
             */

            const runningSubmission =
                await updateSubmissionResult(
                    submissionId,
                    {
                        status: "running",
                    }
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


            /*
             * ------------------------------------------------
             * Run judge.
             * ------------------------------------------------
             */

            console.log(
                "Ready to judge submission:",
                submissionId
            );


            const result =
                await judgeSubmission(
                    submissionId
                );


            if (!result) {

                console.error(
                    "Judge returned no result:",
                    submissionId
                );

                continue;
            }


            console.log(
                "Submission judged:",
                submissionId,
                "→",
                result.status
            );


        } catch (error) {

            console.error(
                "Submission worker error:",
                error
            );


            /*
             * Don't let one broken submission
             * kill the worker.
             */

            await sleep(1000);
        }
    }
}


async function startWorker() {

    try {

        /*
         * MongoDB is required because the worker
         * reads submissions, problems and test cases.
         */

        await connectToDB();


        /*
         * Connect to Redis.
         */

        if (
            !redisClient.isOpen
        ) {

            await redisClient.connect();
        }


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