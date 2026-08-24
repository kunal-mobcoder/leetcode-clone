import mongoose from "mongoose";

import TestCaseModel from "../models/testCase.model.js";

import type {
    TestCase,
} from "../models/testCase.model.js";


/**
 * Create a new test case.
 */
export async function createTestCase(
    data: Omit<TestCase, "_id">
) {

    return TestCaseModel.create(data);
}


/**
 * Find a test case by its ID.
 *
 * Returns null when the ID is invalid
 * or the test case does not exist.
 */
export async function findTestCaseById(
    testCaseId: string
) {

    if (!mongoose.isValidObjectId(testCaseId)) {
        return null;
    }

    return TestCaseModel.findById(
        testCaseId
    );
}


/**
 * Find all test cases belonging to a problem.
 *
 * Used internally by the judge.
 *
 * Returns both public and hidden test cases.
 */
export async function findTestCasesByProblemId(
    problemId: string
) {

    if (!mongoose.isValidObjectId(problemId)) {
        return [];
    }

    return TestCaseModel
        .find({
            problemId: new mongoose.Types.ObjectId(
                problemId
            ),
        })
        .sort({
            createdAt: 1,
        });
}


/**
 * Find only public test cases.
 *
 * These test cases can be exposed to users.
 */
export async function findPublicTestCasesByProblemId(
    problemId: string
) {

    if (!mongoose.isValidObjectId(problemId)) {
        return [];
    }

    return TestCaseModel
        .find({
            problemId: new mongoose.Types.ObjectId(
                problemId
            ),
            isHidden: false,
        })
        .sort({
            createdAt: 1,
        });
}


/**
 * Find only hidden test cases.
 *
 * These are used internally by the judge.
 */
export async function findHiddenTestCasesByProblemId(
    problemId: string
) {

    if (!mongoose.isValidObjectId(problemId)) {
        return [];
    }

    return TestCaseModel
        .find({
            problemId: new mongoose.Types.ObjectId(
                problemId
            ),
            isHidden: true,
        })
        .sort({
            createdAt: 1,
        });
}


/**
 * Update a test case.
 */
export async function updateTestCase(
    testCaseId: string,
    data: Partial<
        Pick<
            TestCase,
            "input" |
            "expectedOutput" |
            "isHidden"
        >
    >
) {

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
export async function deleteTestCase(
    testCaseId: string
) {

    if (!mongoose.isValidObjectId(testCaseId)) {
        return null;
    }

    return TestCaseModel.findByIdAndDelete(
        testCaseId
    );
}