import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { getUserProfileController } from "../controllers/user.controller.js";

const router = Router();

/**
 * @route GET /api/users/me
 * @description Get basic current authenticated user payload
 * @access Authenticated
 */
router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        user: req.user,
    });
});

/**
 * @route GET /api/users/profile
 * @description Get full user profile, solved stats breakdown, recent submissions & activity calendar
 * @access Authenticated
 */
router.get("/profile", authenticate, getUserProfileController);

/**
 * @route GET /api/users/admin-test
 * @description Test admin role authorization
 * @access Admin only
 */
router.get("/admin-test", authenticate, authorizeRoles("admin"), (req, res) => {
    return res.status(200).json({
        message: "You are an admin",
        user: req.user,
    });
});

export default router;
