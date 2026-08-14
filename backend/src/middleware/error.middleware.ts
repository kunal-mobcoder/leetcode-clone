import type { NextFunction, Request, Response, } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";


export function errorMiddleware(error: unknown, req: Request, res: Response, next: NextFunction) {
    console.error(error);

    // Our own application errors
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
        });
    }

    // Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {

        const errors = Object.values(error.errors).map(validationError => ({
            field: validationError.path,
            message: validationError.message,
        })
        );

        return res.status(400).json({
            message: "Database validation failed",
            errors,
        });
    }

    // MongoDB duplicate key error
    if (error instanceof Error && "code" in error && error.code === 11000) {
        return res.status(409).json({
            message: "Duplicate resource",
        });
    }

    // Unknown error
    return res.status(500).json({
        message: "Internal Server Error",
    });
}