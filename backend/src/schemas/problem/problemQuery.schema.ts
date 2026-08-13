import * as z from "zod";

const createProblemSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    difficulty: z.enum([
        "easy", "medium", "hard"
    ]),
    constraints: z.array(
        z.string()
    ),
    examples: z.array(
        z.object({
            input: z.string(),
            output: z.string(),
            explaination: z.string().optional()
        })
    ),
    tags: z.array(
        z.string()
    )
})