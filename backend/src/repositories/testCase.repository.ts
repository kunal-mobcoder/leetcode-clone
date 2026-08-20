import mongoose from "mongoose";
import TestCaseModel from "../models/testCase.model.js";
import type { TestCase } from "../models/testCase.model.js";


/**
 * Create a new test case.
 */
export async function createTestCase(data: Omit<TestCase, "_id">) {
    const testCase = await TestCaseModel.create(data);

    return testCase;
}


/**
 * Find a test case by its ID.
 */
export async function findTestCaseById(testCaseId: string) {
    if (!mongoose.isValidObjectId(testCaseId)) {
        return null;
    }

    return TestCaseModel.findById(testCaseId);
}


/**
 * Find all test cases belonging to a problem.
 *
 * The judge uses this function to retrieve both
 * public and hidden test cases.
 */
export async function findTestCasesByProblemId(problemId: string) {
    if (!mongoose.isValidObjectId(problemId)) {
        return [];
    }

    return TestCaseModel
        .find({
            problemId: new mongoose.Types.ObjectId(problemId),
        })
        .sort({
            createdAt: 1,
        });
}


/**
 * Find only public test cases for a problem.
 *
 * These can safely be exposed through an API.
 */
export async function findPublicTestCasesByProblemId(problemId: string) {
    if (!mongoose.isValidObjectId(problemId)) {
        return [];
    }

    return TestCaseModel
        .find({
            problemId: new mongoose.Types.ObjectId(problemId),
            isHidden: false,
        })
        .sort({
            createdAt: 1,
        });
}


/**
 * Find only hidden test cases for a problem.
 *
 * This should be used internally by the judge.
 */
export async function findHiddenTestCasesByProblemId(problemId: string) {
    if (!mongoose.isValidObjectId(problemId)) {
        return [];
    }

    return TestCaseModel
        .find({
            problemId: new mongoose.Types.ObjectId(problemId),
            isHidden: true,
        })
        .sort({
            createdAt: 1,
        });
}


/**
 * Update a test case.
 */
export async function updateTestCase(testCaseId: string, data: Partial<Pick<TestCase, "input" | "expectedOutput" | "isHidden">>) {
    if (!mongoose.isValidObjectId(testCaseId)) {
        return null;
    }

    return TestCaseModel.findByIdAndUpdate(
        testCaseId,
        {
            $set: data,
        },
        {
            new: true,
            runValidators: true,
        }
    );
}


/**
 * Delete a test case.
 */
export async function deleteTestCase(testCaseId: string) {
    if (!mongoose.isValidObjectId(testCaseId)) {
        return null;
    }

    return TestCaseModel.findByIdAndDelete(
        testCaseId
    );
}