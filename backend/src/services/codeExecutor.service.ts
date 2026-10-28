import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { wrapCodeWithHarness } from "./codeHarness.service.js";

export type ExecutionResult =
    | { type: "success"; output: string; runtime: number }
    | { type: "timeout"; output: string; runtime: number }
    | { type: "runtime_error"; output: string; runtime: number }
    | { type: "compile_error"; output: string; runtime: number }
    | { type: "system_error"; output: string; runtime: number };

const LANGUAGE_CONFIG = {
    javascript: {
        image: "node:22-alpine",
        sourceFile: "main.js",
        command: "node /code/main.js",
        localBinary: "node",
        localArgs: (filePath: string) => [filePath],
    },
    python: {
        image: "python:3.13-alpine",
        sourceFile: "main.py",
        command: "python /code/main.py",
        localBinary: "python3",
        localArgs: (filePath: string) => [filePath],
    },
    java: {
        image: "eclipse-temurin:21-jdk",
        sourceFile: "Main.java",
        command: "mkdir -p /tmp/classes && javac -d /tmp/classes /code/Main.java && java -cp /tmp/classes Main",
        localBinary: "sh",
        localArgs: (filePath: string) => ["-c", `javac -d /tmp ${filePath} && java -cp /tmp Main`],
    },
    cpp: {
        image: "gcc:14",
        sourceFile: "main.cpp",
        command: "g++ /code/main.cpp -O2 -o /tmp/main && /tmp/main",
        localBinary: "sh",
        localArgs: (filePath: string) => ["-c", `g++ ${filePath} -O2 -o /tmp/main && /tmp/main`],
    },
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_CONFIG;

export interface ExecuteCodeOptions {
    code: string;
    language: SupportedLanguage;
    input: string;
    timeoutMs?: number;
    entryFunctionName?: string;
}

interface SpawnResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
}

function runProcess(binary: string, args: string[], input: string, timeoutMs: number): Promise<SpawnResult> {
    return new Promise((resolve, reject) => {
        const child = spawn(binary, args, {
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";
        let timedOut = false;

        const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
            if (Buffer.byteLength(stdout, "utf8") > MAX_OUTPUT_SIZE) {
                child.kill("SIGKILL");
            }
        });

        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        child.stdin.on("error", (err) => {
            if ((err as NodeJS.ErrnoException).code !== "EPIPE") {
                console.error("Stdin error:", err);
            }
        });

        const timeout = setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
        }, timeoutMs);

        child.on("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        child.on("close", (exitCode) => {
            clearTimeout(timeout);
            resolve({ stdout, stderr, exitCode, timedOut });
        });

        if (input) {
            child.stdin.write(input);
        }
        child.stdin.end();
    });
}

export async function executeCode(options: ExecuteCodeOptions): Promise<ExecutionResult> {
    const { code, language, input, timeoutMs = 3000, entryFunctionName } = options;
    const config = LANGUAGE_CONFIG[language];
    const tempDirectory = await mkdtemp(path.join(tmpdir(), "leetcode-judge-"));
    const sourcePath = path.join(tempDirectory, config.sourceFile);

    // Wrap user code with driver harness if needed
    const finalCode = wrapCodeWithHarness({
        code,
        language,
        entryFunctionName,
    });

    try {
        await writeFile(sourcePath, finalCode, "utf8");
        const startTime = process.hrtime.bigint();

        let result: SpawnResult | null = null;
        const useDockerEnv = process.env.USE_DOCKER !== "false";

        let ranInDocker = false;
        if (useDockerEnv) {
            try {
                const dockerResult = await runProcess(
                    "docker",
                    [
                        "run",
                        "--rm",
                        "-i",
                        "--network", "none",
                        "--cpus", "1",
                        "--memory", "128m",
                        "--pids-limit", "64",
                        "--cap-drop", "ALL",
                        "--security-opt", "no-new-privileges",
                        "--read-only",
                        "--tmpfs", "/tmp:rw,nosuid,size=64m",
                        "-v", `${tempDirectory}:/code:ro`,
                        config.image,
                        "sh",
                        "-c",
                        config.command,
                    ],
                    input,
                    timeoutMs
                );

                // If docker command itself failed with daemon connection error, trigger fallback
                if (
                    dockerResult.stderr.includes("Cannot connect to the Docker daemon") ||
                    dockerResult.stderr.includes("docker daemon is not running") ||
                    dockerResult.stderr.includes("Is the docker daemon running")
                ) {
                    throw new Error("Docker daemon not reachable");
                }
                result = dockerResult;
                ranInDocker = true;
            } catch {
                // Fallback to local sandbox runner if Docker daemon is not active
                ranInDocker = false;
            }
        }

        if (!ranInDocker || !result) {
            try {
                result = await runProcess(
                    config.localBinary,
                    config.localArgs(sourcePath),
                    input,
                    timeoutMs
                );
            } catch (localErr) {
                const endTime = process.hrtime.bigint();
                const runtime = Number(endTime - startTime) / 1_000_000;
                return {
                    type: "system_error",
                    output: localErr instanceof Error ? localErr.message : "Execution failed",
                    runtime,
                };
            }
        }

        const endTime = process.hrtime.bigint();
        const runtime = Number(endTime - startTime) / 1_000_000;

        if (!result) {
            return {
                type: "system_error",
                output: "Execution failed to produce result",
                runtime,
            };
        }

        if (result.timedOut) {
            return {
                type: "timeout",
                output: result.stderr || "Execution timed out",
                runtime,
            };
        }

        if (result.exitCode === 0) {
            return {
                type: "success",
                output: result.stdout,
                runtime,
            };
        }

        const output = result.stderr || result.stdout || "Program exited with an error";

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
        await rm(tempDirectory, { recursive: true, force: true });
    }
}
