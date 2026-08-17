import { z } from "zod";

export const problemQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

    difficulty: z
        .enum(["easy", "medium", "hard"])
        .optional(),

    tag: z
        .string()
        .trim()
        .min(1)
        .optional(),

    search: z
        .string()
        .trim()
        .min(1)
        .optional(),

    sort: z
        .enum([
            "title",
            "difficulty",
            "createdAt",
        ])
        .default("createdAt"),

    order: z
        .enum(["asc", "desc"])
        .default("desc"),
});

export type ProblemQueryInput = z.infer<typeof problemQuerySchema>;