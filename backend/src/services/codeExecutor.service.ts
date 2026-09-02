import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm, } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";


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
    }
    | {
        type: "system_error";
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
        command: "mkdir -p /tmp/classes && javac -d /tmp/classes /code/Main.java && java -cp /tmp/classes Main",
    },

    cpp: {
        image: "gcc:14",
        sourceFile: "main.cpp",
        command: "g++ /code/main.cpp -O2 -o /tmp/main && /tmp/main",
    },

} as const;


export type SupportedLanguage = keyof typeof LANGUAGE_CONFIG;


interface ExecuteCodeOptions {
    code: string;
    language: SupportedLanguage;
    input: string;
    timeoutMs?: number;
}


interface SpawnResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
}


function runDocker(args: string[], input: string, timeoutMs: number): Promise<SpawnResult> {
    return new Promise(
        (resolve, reject) => {
            const child = spawn(
                "docker",
                args,
                {
                    stdio: ["pipe", "pipe", "pipe",],
                }
            );

            let stdout = "";
            let stderr = "";
            let timedOut = false;

            child.stdout.on("data", (chunk) => {
                stdout += chunk.toString();
            });

            child.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
            });

            const timeout = setTimeout(() => {
                timedOut = true;
                child.kill("SIGKILL");
            },
                timeoutMs
            );

            child.on("error", (error) => {
                clearTimeout(timeout);
                reject(error);
            });

            child.on("close", (exitCode) => {
                clearTimeout(timeout);
                resolve({ stdout, stderr, exitCode, timedOut });
            });

            child.stdin.write(input);
            child.stdin.end();
        }
    );
}


export async function executeCode(options: ExecuteCodeOptions): Promise<ExecutionResult> {
    const { code, language, input, timeoutMs = 2000, } = options;

    const config = LANGUAGE_CONFIG[language];

    const tempDirectory = await mkdtemp(path.join(tmpdir(), "leetcode-judge-"));

    const sourcePath = path.join(tempDirectory, config.sourceFile);

    try {
        await writeFile(sourcePath, code, "utf8");

        const startTime = process.hrtime.bigint();

        let result: SpawnResult;
        try {
            result = await runDocker(
                [
                    "run",
                    "--rm",
                    "-i",

                    // No network access
                    "--network",
                    "none",

                    // CPU limit
                    "--cpus",
                    "1",

                    // Memory limit
                    "--memory",
                    "128m",

                    // Process limit
                    "--pids-limit",
                    "64",

                    // Remove Linux capabilities
                    "--cap-drop",
                    "ALL",

                    // Prevent privilege escalation
                    "--security-opt",
                    "no-new-privileges",

                    // Read-only filesystem
                    "--read-only",

                    // Writable temporary filesystem
                    "--tmpfs",
                    "/tmp:rw,nosuid,size=64m",

                    // User code is read-only
                    "-v",
                    `${tempDirectory}:/code:ro`,

                    // Image
                    config.image,

                    // Shell
                    "sh",
                    "-c",

                    // Command
                    config.command,
                ],
                input,
                timeoutMs
            );

        } catch (error) {
            const endTime = process.hrtime.bigint();

            const runtime = Number(endTime - startTime) / 1_000_000;

            return {
                type: "system_error",
                output: error instanceof Error ? error.message : "Docker execution failed",
                runtime,
            };

        }

        const endTime = process.hrtime.bigint();

        const runtime = Number(endTime - startTime) / 1_000_000;

        // Timeout
        if (result.timedOut) {
            return {
                type: "timeout",
                output: result.stderr || "Execution timed out",
                runtime,
            };

        }

        // Successful execution
        if (result.exitCode === 0) {
            return {
                type: "success",
                output: result.stdout,
                runtime,
            };

        }

        // Non-zero exit code
        const output = result.stderr || result.stdout || "Program exited with an error";


        //  For now Java/C++ compilation errors are detected using compiler output, we will improve this by separating compilation from execution later.
        if (language === "java" || language === "cpp") {
            if (output.includes("error:") || output.includes("Error:")) {
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