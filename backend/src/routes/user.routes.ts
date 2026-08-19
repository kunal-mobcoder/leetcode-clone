import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";


const router = Router();


// User routes
// Base URL: /api/users

/**
 * @route   GET /api/users/me
 * @desc    Get the currently authenticated user's information
 * @access  Private
 *
 * Requires a valid access token.
 */
router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        user: req.user,
    });
});


/**
 * @route   GET /api/users/admin-test
 * @desc    Test an admin-only protected route
 * @access  Private - Admin only
 *
 * Requires:
 * 1. A valid access token
 * 2. The "admin" role
 */
router.get("/admin-test", authenticate, authorizeRoles("admin"), (req, res) => {
    return res.status(200).json({
        message: "You are an admin",
        user: req.user,
    });
});


export default router;