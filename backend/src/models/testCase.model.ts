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
        },

        input: {
            type: String,
            required: [true, "Test case input is required"],
        },

        expectedOutput: {
            type: String,
            required: [true, "Expected output is required"],
        },

        isHidden: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


/**
 * Used when fetching all test cases belonging to a problem.
 */
TestCaseSchema.index({
    problemId: 1,
});


/**
 * Used when the judge fetches hidden/public test cases
 * for a particular problem.
 *
 * This also avoids scanning all test cases belonging
 * to the problem when filtering by visibility.
 */
TestCaseSchema.index({
    problemId: 1,
    isHidden: 1,
});


/**
 * Create Mongoose model.
 */
const TestCaseModel = mongoose.model<TestCase>("TestCase", TestCaseSchema);


export default TestCaseModel;