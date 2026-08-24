import mongoose, { Schema } from "mongoose";


/**
 * Represents a test case used by the judge.
 *
 * `isHidden = true`
 *   → Used internally by the judge.
 *   → Never returned to normal users.
 *
 * `isHidden = false`
 *   → Can be exposed as a public test case.
 */
export interface TestCase {
    problemId: mongoose.Types.ObjectId;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}


/**
 * Mongoose schema for test cases.
 */
const TestCaseSchema = new Schema<TestCase>(
    {
        problemId: {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            required: [true, "Problem reference is required"],
            index: true,
        },

        input: {
            type: String,
            required: [true, "Test case input is required"],
            trim: true,
        },

        expectedOutput: {
            type: String,
            required: [true, "Expected output is required"],
            trim: true,
        },

        isHidden: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


/**
 * Used when fetching test cases by problem
 * and filtering by visibility.
 *
 * Example:
 *
 * { problemId: X, isHidden: true }
 */
TestCaseSchema.index({
    problemId: 1,
    isHidden: 1,
});


/**
 * Create Mongoose model.
 */
const TestCaseModel = mongoose.model<TestCase>(
    "TestCase",
    TestCaseSchema
);


export default TestCaseModel;