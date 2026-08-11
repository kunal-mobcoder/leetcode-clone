import mongoose from "mongoose";


export interface SubmissionSchema {
    userId: string;
    problemId: string;
    code: string;
    language: String;
    status: String;
    runtime: Number;
    memory: Number;
    failedTestCases: String;
}


const SubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    ProblemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: [true, 'Problem reference is required']
    },
    code: {
        type: String,
        required: [true, 'Submitted code is required']
    },
    language: {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp'],
        required: [true, 'Email is required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compile Error'],
        default: 'Pending'
    },
    runtime: {
        type: Number,
        default: 0     // Measured in milliseconds (ms)
    },
    memory: {
        type: Number,
        default: 0     // Measured in kilobytes (KB) or megabytes (MB)
    },
    failedTestCases: {
        // Stores input/output details ONLY if the status is 'Wrong Answer'
        input: String,
        expectedOutput: String,
        actualOutput: String
    }
}, { timestamps: true })


const SubmissionModel = mongoose.model<SubmissionSchema>("Submission", SubmissionSchema)


export default SubmissionSchema