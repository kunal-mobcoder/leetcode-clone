import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectToDB from "../config/dbConnect.js";
import UserModel from "../models/user.model.js";
import ProblemModel from "../models/problem.model.js";
import TestCaseModel from "../models/testCase.model.js";

async function seed() {
    console.log("Connecting to database...");
    await connectToDB();

    console.log("Checking admin user...");
    let admin = await UserModel.findOne({ email: "admin@leetcode.local" });
    if (!admin) {
        const hashedPassword = await bcrypt.hash("adminpassword123", 12);
        admin = await UserModel.create({
            username: "admin",
            email: "admin@leetcode.local",
            password: hashedPassword,
            roles: ["user", "admin"],
        });
        console.log("Admin user created (admin@leetcode.local / adminpassword123)");
    } else {
        console.log("Admin user already exists");
    }

    const adminId = admin._id;

    const problemsData = [
        {
            title: "Two Sum",
            slug: "two-sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
            difficulty: "easy" as const,
            tags: ["array", "hash-table"],
            hints: [
                "A brute force approach would search all pairs, which takes O(n^2). Can you do it in O(n)?",
                "Can a hash map help you store values you've seen and check for (target - num) in O(1) time?",
            ],
            constraints: [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9",
                "-10^9 <= target <= 10^9",
                "Only one valid answer exists.",
            ],
            examples: [
                {
                    input: "[2,7,11,15]\n9",
                    output: "[0,1]",
                    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
                },
                {
                    input: "[3,2,4]\n6",
                    output: "[1,2]",
                    explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
                },
            ],
            starterCode: {
                javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
                python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in lookup:
                return [lookup[complement], i]
            lookup[num] = i
        return []`,
            },
            entryFunctionName: "twoSum",
            status: "published" as const,
            testCases: [
                { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]", isHidden: false },
                { input: "[3,2,4]\n6", expectedOutput: "[1,2]", isHidden: false },
                { input: "[3,3]\n6", expectedOutput: "[0,1]", isHidden: false },
                { input: "[1,5,8,12,19]\n20", expectedOutput: "[0,4]", isHidden: true },
                { input: "[-1,-2,-3,-4,-5]\n-8", expectedOutput: "[2,4]", isHidden: true },
            ],
        },
        {
            title: "Valid Palindrome",
            slug: "valid-palindrome",
            description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nAlphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
            difficulty: "easy" as const,
            tags: ["two-pointers", "string"],
            hints: [
                "Consider using two pointers: one at the beginning and one at the end.",
                "Skip non-alphanumeric characters and compare the remaining characters in lowercase.",
            ],
            constraints: [
                "1 <= s.length <= 2 * 10^5",
                "s consists only of printable ASCII characters.",
            ],
            examples: [
                {
                    input: '"A man, a plan, a canal: Panama"',
                    output: "true",
                    explanation: '"amanaplanacanalpanama" is a palindrome.',
                },
                {
                    input: '"race a car"',
                    output: "false",
                    explanation: '"raceacar" is not a palindrome.',
                },
            ],
            starterCode: {
                javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`,
                python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        cleaned = ''.join(c.lower() for c in s if c.isalnum())
        return cleaned == cleaned[::-1]`,
            },
            entryFunctionName: "isPalindrome",
            status: "published" as const,
            testCases: [
                { input: '"A man, a plan, a canal: Panama"', expectedOutput: "true", isHidden: false },
                { input: '"race a car"', expectedOutput: "false", isHidden: false },
                { input: '" "', expectedOutput: "true", isHidden: false },
                { input: '"ab_a"', expectedOutput: "true", isHidden: true },
                { input: '"0P"', expectedOutput: "false", isHidden: true },
            ],
        },
        {
            title: "Valid Parentheses",
            slug: "valid-parentheses",
            description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
            difficulty: "easy" as const,
            tags: ["string", "stack"],
            hints: [
                "An opening bracket must be closed by the same type of bracket in the correct order.",
                "What data structure operates in Last-In-First-Out (LIFO) order to match the most recent opening bracket?",
            ],
            constraints: [
                "1 <= s.length <= 10^4",
                "s consists of parentheses only '()[]{}'.",
            ],
            examples: [
                { input: '"()"', output: "true" },
                { input: '"()[]{}"', output: "true" },
                { input: '"(]"', output: "false" },
            ],
            starterCode: {
                javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        }
    }
    return stack.length === 0;
}`,
                python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack`,
            },
            entryFunctionName: "isValid",
            status: "published" as const,
            testCases: [
                { input: '"()"', expectedOutput: "true", isHidden: false },
                { input: '"()[]{}"', expectedOutput: "true", isHidden: false },
                { input: '"(]"', expectedOutput: "false", isHidden: false },
                { input: '"([])"', expectedOutput: "true", isHidden: true },
                { input: '"([)]"', expectedOutput: "false", isHidden: true },
            ],
        },
        {
            title: "Reverse Integer",
            slug: "reverse-integer",
            description: "Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return 0.\n\nAssume the environment does not allow you to store 64-bit integers.",
            difficulty: "medium" as const,
            tags: ["math"],
            hints: [
                "Think about how you can pop the last digit off using modulo (% 10) and push it onto the reversed number (* 10 + digit).",
                "Be careful with 32-bit signed integer overflow (between -2^31 and 2^31 - 1).",
            ],
            constraints: [
                "-2^31 <= x <= 2^31 - 1",
            ],
            examples: [
                { input: "123", output: "321" },
                { input: "-123", output: "-321" },
                { input: "120", output: "21" },
            ],
            starterCode: {
                javascript: `/**
 * @param {number} x
 * @return {number}
 */
function reverse(x) {
    const sign = x < 0 ? -1 : 1;
    const reversed = parseInt(Math.abs(x).toString().split('').reverse().join('')) * sign;
    if (reversed < -Math.pow(2, 31) || reversed > Math.pow(2, 31) - 1) {
        return 0;
    }
    return reversed;
}`,
                python: `class Solution:
    def reverse(self, x: int) -> int:
        sign = -1 if x < 0 else 1
        rev = int(str(abs(x))[::-1]) * sign
        if rev < -2**31 or rev > 2**31 - 1:
            return 0
        return rev`,
            },
            entryFunctionName: "reverse",
            status: "published" as const,
            testCases: [
                { input: "123", expectedOutput: "321", isHidden: false },
                { input: "-123", expectedOutput: "-321", isHidden: false },
                { input: "120", expectedOutput: "21", isHidden: false },
                { input: "1534236469", expectedOutput: "0", isHidden: true },
            ],
        },
    ];

    for (const prob of problemsData) {
        const { testCases, ...problemFields } = prob;
        let existing = await ProblemModel.findOne({ slug: prob.slug });
        if (!existing) {
            existing = await ProblemModel.create({
                ...problemFields,
                createdBy: adminId,
            });
            console.log(`Created problem: ${prob.title} (${prob.slug})`);
        } else {
            await ProblemModel.updateOne({ _id: existing._id }, { ...problemFields });
            console.log(`Updated problem: ${prob.title} (${prob.slug})`);
        }

        // Upsert test cases
        await TestCaseModel.deleteMany({ problemId: existing._id });
        for (const tc of testCases) {
            await TestCaseModel.create({
                problemId: existing._id,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden,
            });
        }
        console.log(`Seeded ${testCases.length} test cases for ${prob.title}`);
    }

    console.log("Seeding complete!");
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
