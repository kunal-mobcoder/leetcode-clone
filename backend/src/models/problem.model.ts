import mongoose from "mongoose";


export interface Problem {
    title: string;
    description: string;
    examples: string;
    tags: string;
    testcases: [];
    difficulty: string;
}


const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Problem title is required']
    },
    description: {
        type: String,
        required: [true, 'Problem description is required'],
    },
    examples: {
        type: String,
    },
    tags: {
        type: String,
    },
    testcases: [
        {
            input: {
                type: String,
                required: [true, 'Test case input is required']
            },
            output: {
                type: String,
                required: [true, 'Test case expected output is required']
            },
            isPrivate: {
                type: Boolean,
                default: true   // true = hidden test case, false = sample/visible test case
            }
        }
    ],
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: [true, 'Difficulty level is required']
    }
}, { timestamps: true });



const ProblemModel = mongoose.model<Problem>("Problem", ProblemSchema)

export default ProblemSchema