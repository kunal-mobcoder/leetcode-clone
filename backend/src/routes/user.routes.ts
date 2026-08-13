import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";


const router = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        user: req.user,
    });
});


/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.get("/admin-test", authenticate, authorizeRoles("admin"), (req, res) => {
    return res.status(200).json({
        message: "You are an admin",
        user: req.user,
    });
})


export default router