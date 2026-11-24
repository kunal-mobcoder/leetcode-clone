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


export interface ProblemEditorial {
    intuition?: string;
    approach?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    solutionCode?: {
        javascript?: string;
        python?: string;
    };
}


export interface Problem {
    title: string;
    slug: string;
    description: string;
    difficulty: ProblemDifficulty;
    constraints: string[];
    examples: ProblemExample[];
    tags: string[];
    hints?: string[];
    editorial?: ProblemEditorial;
    starterCode?: {
        javascript?: string;
        python?: string;
        java?: string;
        cpp?: string;
    };
    entryFunctionName?: string;
    status: "draft" | "published" | "archived";
    createdBy: mongoose.Types.ObjectId;
}


const ProblemExampleSchema = new mongoose.Schema<ProblemExample>({
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


const ProblemSchema = new mongoose.Schema<Problem>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
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

        hints: {
            type: [String],
            default: [],
        },

        editorial: {
            intuition: { type: String, default: "" },
            approach: { type: String, default: "" },
            timeComplexity: { type: String, default: "" },
            spaceComplexity: { type: String, default: "" },
            solutionCode: {
                type: Map,
                of: String,
                default: {},
            },
        },

        starterCode: {
            type: Map,
            of: String,
            default: {},
        },

        entryFunctionName: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

ProblemSchema.index({
    title: "text",
    description: "text",
    tags: "text",
});


const ProblemModel = mongoose.model<Problem>("Problem", ProblemSchema);


export default ProblemModel;