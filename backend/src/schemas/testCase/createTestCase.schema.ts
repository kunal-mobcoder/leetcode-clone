import { z } from "zod";


export const createTestCaseSchema = z.object({

    input: z
        .string()
        .min(1, "Test case input is required"),

    expectedOutput: z
        .string()
        .min(1, "Expected output is required"),

    isHidden: z
        .boolean()
        .default(true),

});


export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;