import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType, } from "zod";


export function validateBody<T>(schema: ZodType<T>): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {

        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors,
            });
        }

        req.body = result.data;
        next();
    };
}


export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {

        const result = schema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid query parameters",
                errors: result.error.flatten().fieldErrors,
            });
        }

        // Don't assign T to req.query because Express defines
        // req.query as ParsedQs.

        req.validatedQuery = result.data;
        next();
    };
}