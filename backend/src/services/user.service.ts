import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import ProblemModel from "../models/problem.model.js";
import SubmissionModel from "../models/submission.model.js";
import { AppError } from "../utils/AppError.js";

export async function getUserProfileService(userId: string) {
    if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid user ID", 400);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await UserModel.findById(userObjectId).select("-password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    // 1. Get total published problem counts per difficulty
    const problemCounts = await ProblemModel.aggregate([
        { $match: { status: "published" } },
        {
            $group: {
                _id: "$difficulty",
                count: { $sum: 1 },
            },
        },
    ]);

    const totalProblems = {
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0,
    };

    problemCounts.forEach((item) => {
        const diff = item._id as "easy" | "medium" | "hard";
        if (diff in totalProblems) {
            totalProblems[diff] = item.count;
            totalProblems.total += item.count;
        }
    });

    // 2. Get user's distinct solved problems grouped by difficulty
    const solvedByDifficulty = await SubmissionModel.aggregate([
        { $match: { userId: userObjectId, status: "accepted" } },
        { $group: { _id: "$problemId" } },
        {
            $lookup: {
                from: "problems",
                localField: "_id",
                foreignField: "_id",
                as: "problem",
            },
        },
        { $unwind: "$problem" },
        {
            $group: {
                _id: "$problem.difficulty",
                count: { $sum: 1 },
            },
        },
    ]);

    const solvedProblems = {
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0,
    };

    solvedByDifficulty.forEach((item) => {
        const diff = item._id as "easy" | "medium" | "hard";
        if (diff in solvedProblems) {
            solvedProblems[diff] = item.count;
            solvedProblems.total += item.count;
        }
    });

    // 3. User submission statistics
    const [totalSubmissions, acceptedSubmissions] = await Promise.all([
        SubmissionModel.countDocuments({ userId: userObjectId }),
        SubmissionModel.countDocuments({ userId: userObjectId, status: "accepted" }),
    ]);

    const acceptanceRate = totalSubmissions > 0
        ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1))
        : 0;

    // 4. Recent submissions with problem details
    const recentSubmissions = await SubmissionModel.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate("problemId", "title slug difficulty");

    // 5. Submission calendar activity (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const activityByDate = await SubmissionModel.aggregate([
        {
            $match: {
                userId: userObjectId,
                createdAt: { $gte: oneYearAgo },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
            },
        },
    ]);

    const submissionCalendar: Record<string, number> = {};
    activityByDate.forEach((entry) => {
        submissionCalendar[entry._id] = entry.count;
    });

    return {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            createdAt: (user as any).createdAt,
        },
        stats: {
            solved: solvedProblems,
            totalProblems,
            totalSubmissions,
            acceptedSubmissions,
            acceptanceRate,
        },
        recentSubmissions,
        submissionCalendar,
    };
}
