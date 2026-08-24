import { z } from "zod";


export const updateTestCaseSchema = z.object({

    input: z
        .string()
        .min(1, "Test case input is required")
        .optional(),

    expectedOutput: z
        .string()
        .min(1, "Expected output is required")
        .optional(),

    isHidden: z
        .boolean()
        .optional(),

}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required",
    }
);


export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;