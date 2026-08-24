import mongoose from "mongoose";

import * as testCaseRepository
    from "../repositories/testCase.repository.js";

import * as problemRepository
    from "../repositories/problem.repository.js";

import type {
    TestCase,
} from "../models/testCase.model.js";

import { AppError } from "../utils/AppError.js";


/**
 * Create a new test case for a problem.
 *
 * Business rules:
 *
 * - Problem ID must be valid.
 * - Problem must exist.
 * - Archived problems cannot receive test cases.
 */
export async function createTestCaseService(
    problemId: string,
    data: Omit<TestCase, "problemId">
) {

    /**
     * Validate problem ID.
     */
    if (!mongoose.isValidObjectId(problemId)) {
        throw new AppError(
            "Invalid problem ID",
            400
        );
    }


    /**
     * Make sure the problem exists.
     */
    const problem =
        await problemRepository.findProblemById(
            problemId
        );


    if (!problem) {
        throw new AppError(
            "Problem not found",
            404
        );
    }


    /**
     * Archived problems should not be modified.
     */
    if (problem.status === "archived") {
        throw new AppError(
            "Archived problems cannot have test cases",
            400
        );
    }


    /**
     * Attach the problem ID to the test case.
     */
    const testCaseData = {
        ...data,
        problemId:
            new mongoose.Types.ObjectId(problemId),
    };


    return testCaseRepository.createTestCase(
        testCaseData
    );
}


/**
 * Get all test cases belonging to a problem.
 *
 * This function is intended for admin/internal use.
 *
 * It returns both public and hidden test cases.
 */
export async function getTestCasesByProblemService(
    problemId: string
) {

    /**
     * Validate problem ID.
     */
    if (!mongoose.isValidObjectId(problemId)) {
        throw new AppError(
            "Invalid problem ID",
            400
        );
    }


    /**
     * Make sure the problem exists.
     */
    const problem =
        await problemRepository.findProblemById(
            problemId
        );


    if (!problem) {
        throw new AppError(
            "Problem not found",
            404
        );
    }


    return testCaseRepository
        .findTestCasesByProblemId(
            problemId
        );
}


/**
 * Get only public test cases for a problem.
 *
 * These test cases are safe to expose to users.
 */
export async function getPublicTestCasesByProblemService(
    problemId: string
) {

    /**
     * Validate problem ID.
     */
    if (!mongoose.isValidObjectId(problemId)) {
        throw new AppError(
            "Invalid problem ID",
            400
        );
    }


    /**
     * Make sure the problem exists.
     */
    const problem =
        await problemRepository.findProblemById(
            problemId
        );


    if (!problem) {
        throw new AppError(
            "Problem not found",
            404
        );
    }


    return testCaseRepository
        .findPublicTestCasesByProblemId(
            problemId
        );
}


/**
 * Update a test case.
 *
 * Important:
 *
 * The test case must belong to the problem
 * specified in the URL.
 */
export async function updateTestCaseService(
    problemId: string,
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

    /**
     * Validate problem ID.
     */
    if (!mongoose.isValidObjectId(problemId)) {
        throw new AppError(
            "Invalid problem ID",
            400
        );
    }


    /**
     * Validate test case ID.
     */
    if (!mongoose.isValidObjectId(testCaseId)) {
        throw new AppError(
            "Invalid test case ID",
            400
        );
    }


    /**
     * Make sure the problem exists.
     */
    const problem =
        await problemRepository.findProblemById(
            problemId
        );


    if (!problem) {
        throw new AppError(
            "Problem not found",
            404
        );
    }


    /**
     * Archived problems cannot be modified.
     */
    if (problem.status === "archived") {
        throw new AppError(
            "Archived problems cannot be updated",
            400
        );
    }


    /**
     * Find the test case.
     */
    const testCase =
        await testCaseRepository.findTestCaseById(
            testCaseId
        );


    if (!testCase) {
        throw new AppError(
            "Test case not found",
            404
        );
    }


    /**
     * Make sure this test case belongs
     * to the problem from the URL.
     *
     * This prevents:
     *
     * /problems/A/test-cases/test-case-from-B
     *
     * from modifying a test case belonging to B.
     */
    if (
        testCase.problemId.toString()
        !== problemId
    ) {
        throw new AppError(
            "Test case does not belong to this problem",
            400
        );
    }


    /**
     * Update the test case.
     */
    return testCaseRepository.updateTestCase(
        testCaseId,
        data
    );
}


/**
 * Delete a test case.
 *
 * The test case must belong to the problem
 * specified in the URL.
 */
export async function deleteTestCaseService(
    problemId: string,
    testCaseId: string
) {

    /**
     * Validate problem ID.
     */
    if (!mongoose.isValidObjectId(problemId)) {
        throw new AppError(
            "Invalid problem ID",
            400
        );
    }


    /**
     * Validate test case ID.
     */
    if (!mongoose.isValidObjectId(testCaseId)) {
        throw new AppError(
            "Invalid test case ID",
            400
        );
    }


    /**
     * Make sure the problem exists.
     */
    const problem =
        await problemRepository.findProblemById(
            problemId
        );


    if (!problem) {
        throw new AppError(
            "Problem not found",
            404
        );
    }


    /**
     * Archived problems cannot be modified.
     */
    if (problem.status === "archived") {
        throw new AppError(
            "Archived problems cannot have test cases deleted",
            400
        );
    }


    /**
     * Find the test case.
     */
    const testCase =
        await testCaseRepository.findTestCaseById(
            testCaseId
        );


    if (!testCase) {
        throw new AppError(
            "Test case not found",
            404
        );
    }


    /**
     * Make sure the test case belongs
     * to the requested problem.
     */
    if (
        testCase.problemId.toString()
        !== problemId
    ) {
        throw new AppError(
            "Test case does not belong to this problem",
            400
        );
    }


    /**
     * Delete the test case.
     */
    await testCaseRepository.deleteTestCase(
        testCaseId
    );
}