import mongoose, { Schema } from "mongoose";


export type ProblemDifficulty =
    | "easy"
    | "medium"
    | "hard";


export type ProblemStatus =
    | "draft"
    | "published"
    | "archived";


export interface ProblemExample {
    input: string;
    output: string;
    explanation?: string;
}


export interface Problem {
    title: string;
    slug: string;
    description: string;
    difficulty: ProblemDifficulty;
    constraints: string[];
    examples: ProblemExample[];
    tags: string[];
    status: ProblemStatus;
    createdBy: mongoose.Types.ObjectId;
}


const ProblemExampleSchema = new Schema<ProblemExample>({
    input: {
        type: String,
        required: [true, "Example input is required",],
    },

    output: {
        type: String,
        required: [true, "Example output is required",],
    },

    explanation: {
        type: String,
    },
},
    {
        _id: false,
    }
);


const ProblemSchema = new Schema<Problem>({
    title: {
        type: String,
        required: [true, "Problem title is required",],
        trim: true,
    },

    slug: {
        type: String,
        required: [true, "Problem slug is required",],
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
    },

    description: {
        type: String,
        required: [true, "Problem description is required",],
    },

    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard",],
        required: [true, "Problem difficulty is required",],
        index: true,
    },

    constraints: {
        type: [String],
        default: [],
    },

    examples: {
        type: [ProblemExampleSchema,],
        default: [],
    },

    tags: {
        type: [String],
        default: [],
        index: true,
    },

    status: {
        type: String,
        enum: ["draft", "published", "archived",],
        default: "draft",
        index: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
},
    {
        timestamps: true,
    }
);


const ProblemModel = mongoose.model<Problem>("Problem", ProblemSchema);


export default ProblemModel;