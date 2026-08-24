import { z } from "zod";


export const createSubmissionSchema = z.object({
    problemId: z
        .string()
        .min(1, "Problem ID is required"),

    code: z
        .string()
        .min(1, "Code is required")
        .max(100_000, "Code cannot exceed 100KB"),

    language: z.enum([
        "javascript",
        "python",
        "java",
        "cpp",
    ]),
});


export type CreateSubmissionInput =
    z.infer<typeof createSubmissionSchema>;