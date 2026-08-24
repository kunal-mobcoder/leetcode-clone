import mongoose, { Schema } from "mongoose";


/**
 * Supported programming languages for submissions.
 */
export type SubmissionLanguage =
    | "javascript"
    | "python"
    | "java"
    | "cpp";


/**
 * Lifecycle/status of a submission.
 *
 * pending
 *    ↓
 * running
 *    ↓
 * ┌───────────────────────────────┐
 * │ accepted                      │
 * │ wrong_answer                  │
 * │ time_limit_exceeded           │
 * │ runtime_error                 │
 * │ compile_error                 │
 * │ system_error                  │
 * └───────────────────────────────┘
 */
export type SubmissionStatus =
    | "pending"
    | "running"
    | "accepted"
    | "wrong_answer"
    | "time_limit_exceeded"
    | "runtime_error"
    | "compile_error"
    | "system_error";


/**
 * Information about the test case that caused
 * a submission to fail.
 *
 * This is stored internally.
 *
 * Hidden test-case information must never be
 * exposed directly to normal users.
 */
export interface FailedTestCase {
    input: string;
    expectedOutput: string;
    actualOutput: string;
}


/**
 * TypeScript representation of a Submission document.
 */
export interface Submission {
    userId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    code: string;
    language: SubmissionLanguage;
    status: SubmissionStatus;
    runtime: number;
    memory: number;
    failedTestCase?: FailedTestCase;

    createdAt: Date;
    updatedAt: Date;
}


/**
 * Schema for storing information about a failed test case.
 *
 * `_id: false` because a failed test case does not need
 * its own MongoDB document ID.
 */
const FailedTestCaseSchema =
    new Schema<FailedTestCase>(
        {
            input: {
                type: String,
                required: [
                    true,
                    "Test case input is required",
                ],
            },

            expectedOutput: {
                type: String,
                required: [
                    true,
                    "Expected output is required",
                ],
            },

            actualOutput: {
                type: String,
                required: [
                    true,
                    "Actual output is required",
                ],
            },
        },
        {
            _id: false,
        }
    );


/**
 * Mongoose schema for Submission.
 */
const SubmissionSchema =
    new Schema<Submission>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: [
                    true,
                    "User reference is required",
                ],
            },

            problemId: {
                type: Schema.Types.ObjectId,
                ref: "Problem",
                required: [
                    true,
                    "Problem reference is required",
                ],
            },

            code: {
                type: String,
                required: [
                    true,
                    "Submitted code is required",
                ],
            },

            language: {
                type: String,

                enum: {
                    values: [
                        "javascript",
                        "python",
                        "java",
                        "cpp",
                    ],

                    message:
                        "Unsupported programming language",
                },

                required: [
                    true,
                    "Programming language is required",
                ],
            },

            status: {
                type: String,

                enum: {
                    values: [
                        "pending",
                        "running",
                        "accepted",
                        "wrong_answer",
                        "time_limit_exceeded",
                        "runtime_error",
                        "compile_error",
                        "system_error",
                    ],

                    message:
                        "Invalid submission status",
                },

                default: "pending",

                required: true,
            },

            runtime: {
                type: Number,

                default: 0,

                min: [
                    0,
                    "Runtime cannot be negative",
                ],
            },

            memory: {
                type: Number,

                default: 0,

                min: [
                    0,
                    "Memory usage cannot be negative",
                ],
            },

            failedTestCase: {
                type: FailedTestCaseSchema,

                default: undefined,
            },
        },

        {
            timestamps: true,
        }
    );


/**
 * Retrieve a user's submissions ordered by
 * newest first.
 */
SubmissionSchema.index({
    userId: 1,
    createdAt: -1,
});


/**
 * Retrieve submissions belonging to a problem
 * ordered by newest first.
 */
SubmissionSchema.index({
    problemId: 1,
    createdAt: -1,
});


/**
 * Create Submission model.
 */
const SubmissionModel =
    mongoose.model<Submission>(
        "Submission",
        SubmissionSchema
    );


export default SubmissionModel;