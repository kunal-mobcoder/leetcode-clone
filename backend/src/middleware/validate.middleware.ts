import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

function validateBody(schema: ZodType) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
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

export default validateBody;