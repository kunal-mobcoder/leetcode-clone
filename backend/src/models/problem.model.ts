import mongoose from "mongoose";


export type ProblemDifficulty =
    | "easy"
    | "medium"
    | "hard";

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
    isPublished: boolean;
}


const ProblemExampleSchema = new mongoose.Schema<ProblemExample>({
    input: {
        type: String,
        required: true,
    },

    output: {
        type: String,
        required: true,
    },

    explanation: {
        type: String,
    },
},
    {
        _id: false,
    }
);


const ProblemSchema = new mongoose.Schema<Problem>({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    description: {
        type: String,
        required: true,
    },

    difficulty: {
        type: String,
        enum: [
            "easy",
            "medium",
            "hard",
        ],
        required: true,
        index: true,
    },

    constraints: {
        type: [String],
        default: [],
    },

    examples: {
        type: [ProblemExampleSchema],
        default: [],
    },

    tags: {
        type: [String],
        default: [],
        index: true,
    },

    isPublished: {
        type: Boolean,
        default: false,
        index: true,
    },
},
    {
        timestamps: true,
    }
);


const ProblemModel = mongoose.model<Problem>("Problem", ProblemSchema)

export default ProblemModel