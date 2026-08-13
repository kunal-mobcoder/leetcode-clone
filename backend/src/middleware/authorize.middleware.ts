import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../models/user.model.js";


export function authorizeRoles(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication Required"
            })
        }

        const hasRequiredRole = req.user.roles.some((role) => allowedRoles.includes(role))

        if (!hasRequiredRole) {
            return res.status(403).json({
                message: "Forbidden",
            })
        }

        next();
    }
}