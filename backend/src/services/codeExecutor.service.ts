import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";


const execFileAsync = promisify(execFile);


export type ExecutionResult =
    | {
        type: "success";
        output: string;
        runtime: number;
    }
    | {
        type: "timeout";
        output: string;
        runtime: number;
    }
    | {
        type: "runtime_error";
        output: string;
        runtime: number;
    }
    | {
        type: "compile_error";
        output: string;
        runtime: number;
    };


const LANGUAGE_CONFIG = {

    javascript: {
        image: "node:22-alpine",
        sourceFile: "main.js",
        command: "node /code/main.js",
    },

    python: {
        image: "python:3.13-alpine",
        sourceFile: "main.py",
        command: "python /code/main.py",
    },

    java: {
        image: "eclipse-temurin:21-jdk",
        sourceFile: "Main.java",
        command: "javac /code/Main.java && java -cp /code Main",
    },

    cpp: {
        image: "gcc:14",
        sourceFile: "main.cpp",
        command: "g++ /code/main.cpp -O2 -o /tmp/main && /tmp/main",
    },

} as const;


export type SupportedLanguage =
    keyof typeof LANGUAGE_CONFIG;


interface ExecuteCodeOptions {
    code: string;
    language: SupportedLanguage;
    input: string;
    timeoutMs?: number;
}


export async function executeCode(
    options: ExecuteCodeOptions
): Promise<ExecutionResult> {

    const {
        code,
        language,
        input,
        timeoutMs = 2000,
    } = options;


    const config =
        LANGUAGE_CONFIG[language];


    const tempDirectory =
        await mkdtemp(
            path.join(
                tmpdir(),
                "leetcode-judge-"
            )
        );


    const sourcePath =
        path.join(
            tempDirectory,
            config.sourceFile
        );


    try {

        await writeFile(
            sourcePath,
            code,
            "utf8"
        );


        const startTime =
            process.hrtime.bigint();


        try {

            const { stdout, stderr } =
                await execFileAsync(
                    "docker",
                    [
                        "run",

                        "--rm",

                        "-i",

                        // No network access.
                        "--network",
                        "none",

                        // CPU limit.
                        "--cpus",
                        "1",

                        // Memory limit.
                        "--memory",
                        "128m",

                        // Limit number of processes.
                        "--pids-limit",
                        "64",

                        // Drop Linux capabilities.
                        "--cap-drop",
                        "ALL",

                        // Prevent privilege escalation.
                        "--security-opt",
                        "no-new-privileges",

                        // Read-only container filesystem.
                        "--read-only",

                        // Temporary writable filesystem.
                        "--tmpfs",
                        "/tmp:rw,nosuid,size=64m",

                        // Mount source code read-only.
                        "-v",
                        `${tempDirectory}:/code:ro`,

                        config.image,

                        "sh",
                        "-c",
                        config.command,
                    ],
                    {
                        input,

                        timeout: timeoutMs,

                        maxBuffer:
                            1024 * 1024,
                    }
                );


            const endTime =
                process.hrtime.bigint();


            const runtime =
                Number(
                    endTime - startTime
                ) / 1_000_000;


            return {
                type: "success",
                output: stdout,
                runtime,
            };

        } catch (error: any) {

            const endTime =
                process.hrtime.bigint();


            const runtime =
                Number(
                    endTime - startTime
                ) / 1_000_000;


            if (
                error?.killed ||
                error?.code === "ETIMEDOUT"
            ) {

                return {
                    type: "timeout",
                    output:
                        error?.stderr ||
                        "Execution timed out",
                    runtime,
                };
            }


            const output =
                (
                    error?.stderr ||
                    error?.stdout ||
                    error?.message ||
                    ""
                ).toString();


            /*
             * Java compilation and C++ compilation
             * errors are treated as compile errors.
             *
             * For JavaScript and Python, execution
             * errors are runtime errors.
             */

            if (
                language === "java" ||
                language === "cpp"
            ) {

                if (
                    output.includes("error:") ||
                    output.includes("Error:")
                ) {

                    return {
                        type: "compile_error",
                        output,
                        runtime,
                    };
                }
            }


            return {
                type: "runtime_error",
                output,
                runtime,
            };
        }

    } finally {

        await rm(
            tempDirectory,
            {
                recursive: true,
                force: true,
            }
        );
    }
}