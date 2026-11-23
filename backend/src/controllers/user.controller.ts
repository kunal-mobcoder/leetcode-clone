import type { Request, Response, NextFunction } from "express";
import { getUserProfileService } from "../services/user.service.js";

/**
 * Get the authenticated user's profile and problem-solving metrics
 *
 * GET /api/users/profile
 */
export async function getUserProfileController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.userId;
        const profile = await getUserProfileService(userId);
        return res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
}
