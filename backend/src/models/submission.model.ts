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
 * We should NOT expose hidden test cases through
 * the API. This field is for storing the result
 * internally and selectively returning safe data.
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

    /**
     * Execution time in milliseconds.
     */
    runtime: number;

    /**
     * Memory consumed during execution in kilobytes.
     */
    memory: number;

    /**
     * Information about the first failed test case.
     *
     * This is optional because accepted submissions
     * do not have a failed test case.
     */
    failedTestCase?: FailedTestCase;
}


/**
 * Schema for storing information about a failed test case.
 */
const FailedTestCaseSchema = new Schema<FailedTestCase>(
    {
        input: {
            type: String,
            required: [true, "Test case input is required"],
        },

        expectedOutput: {
            type: String,
            required: [true, "Expected output is required"],
        },

        actualOutput: {
            type: String,
            required: [true, "Actual output is required"],
        },
    },
    {
        _id: false,
    }
);


/**
 * Mongoose schema for Submission.
 */
const SubmissionSchema = new Schema<Submission>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },

        problemId: {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            required: [true, "Problem reference is required"],
        },

        code: {
            type: String,
            required: [true, "Submitted code is required"],
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
                message: "Unsupported programming language",
            },
            required: [true, "Programming language is required"],
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
                message: "Invalid submission status",
            },
            default: "pending",
            required: true,
            index: true,
        },

        runtime: {
            type: Number,
            default: 0,
            min: [0, "Runtime cannot be negative"],
        },

        memory: {
            type: Number,
            default: 0,
            min: [0, "Memory usage cannot be negative"],
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
 * Index used when retrieving a user's submissions
 * ordered by newest first.
 *
 * Example:
 *
 * GET /api/submissions/my
 */
SubmissionSchema.index({
    userId: 1,
    createdAt: -1,
});


/**
 * Index used when retrieving submissions
 * for a particular problem.
 */
SubmissionSchema.index({
    problemId: 1,
    createdAt: -1,
});


const SubmissionModel = mongoose.model<Submission>("Submission", SubmissionSchema);


export default SubmissionModel;