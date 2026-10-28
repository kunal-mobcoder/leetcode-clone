import { z } from "zod";

export const runCodeSchema = z.object({
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

    customInput: z
        .string()
        .optional(),
});

export type RunCodeInput = z.infer<typeof runCodeSchema>;
