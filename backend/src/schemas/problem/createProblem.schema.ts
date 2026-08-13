import { z } from "zod";

export const createProblemSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(150, "Title cannot exceed 150 characters"),

    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .max(150, "Slug cannot exceed 150 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain only lowercase letters, numbers and hyphens"
        ),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),

    difficulty: z.enum([
        "easy",
        "medium",
        "hard",
    ]),

    tags: z
        .array(z.string().min(1))
        .default([]),

    constraints: z
        .array(z.string().min(1))
        .default([]),

    examples: z
        .array(
            z.object({
                input: z.string(),
                output: z.string(),
                explanation: z.string().optional(),
            })
        )
        .default([]),
});

export type CreateProblemInput = z.infer<typeof createProblemSchema>;
// Zod gives us runtime validation, while z.infer gives us the TypeScript type.