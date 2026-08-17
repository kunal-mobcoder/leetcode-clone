import { z } from "zod";


export const updateProblemSchema = z.object({

    title: z
        .string()
        .min(
            3,
            "Title must be at least 3 characters"
        )
        .max(
            150,
            "Title cannot exceed 150 characters"
        )
        .optional(),


    slug: z
        .string()
        .min(
            3,
            "Slug must be at least 3 characters"
        )
        .max(
            150,
            "Slug cannot exceed 150 characters"
        )
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Invalid slug"
        )
        .optional(),


    description: z
        .string()
        .min(
            10,
            "Description must be at least 10 characters"
        )
        .optional(),


    difficulty: z
        .enum([
            "easy",
            "medium",
            "hard",
        ])
        .optional(),


    tags: z
        .array(
            z.string().min(1)
        )
        .optional(),


    constraints: z
        .array(
            z.string().min(1)
        )
        .optional(),


    examples: z
        .array(
            z.object({
                input: z.string(),
                output: z.string(),
                explanation:
                    z.string().optional(),
            })
        )
        .optional(),
})
    .strict();


export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;