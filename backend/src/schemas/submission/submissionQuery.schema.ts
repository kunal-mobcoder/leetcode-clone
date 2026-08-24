import { z } from "zod";


/**
 * Query parameters used when retrieving
 * a user's submission history.
 */
export const submissionQuerySchema =
    z.object({

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

        /**
         * Optional problem filter.
         *
         * If provided, only submissions for
         * this problem are returned.
         */
        problemId: z
            .string()
            .min(1)
            .optional(),
    });


export type SubmissionQuery =
    z.infer<
        typeof submissionQuerySchema
    >;