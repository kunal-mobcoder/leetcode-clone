import { z } from "zod";

export const usernameValidation = z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be no more than 20 characters")
    .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username must contain only letters, numbers, and underscores"
    );

export const registerSchema = z.object({
    username: usernameValidation,

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be no more than 100 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;