import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { wrapCodeWithHarness } from "./codeHarness.service.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExecutionResult =
    | { type: "success"; output: string; runtime: number }
    | { type: "timeout"; output: string; runtime: number }
    | { type: "runtime_error"; output: string; runtime: number }
    | { type: "compile_error"; output: string; runtime: number }
    | { type: "memory_limit_exceeded"; output: string; runtime: number }
    | { type: "system_error"; output: string; runtime: number };

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

// ---------------------------------------------------------------------------
// Sandbox Configuration
// ---------------------------------------------------------------------------

/**
 * Production sandbox policy.
 *
 * In production (`NODE_ENV=production`) or when `USE_DOCKER=true`,
 * code MUST run inside a hardened Docker container. If Docker is
 * unavailable the execution fails with `system_error` — we NEVER
 * fall back to running arbitrary user code on the bare host.
 *
 * In development (`NODE_ENV` !== `production` && `USE_DOCKER` !== `false`),
 * Docker is preferred but local execution is allowed as a convenience
 * fallback when the Docker daemon is not running.
 */

const SANDBOX_CONFIG = {
    /** Hard memory cap (container + swap identical = no swap) */
    memoryLimit: "128m",
    /** Max CPU cores the container may use */
    cpuLimit: "0.5",
    /** Max number of PIDs to prevent fork bombs */
    pidsLimit: "32",
    /** Seconds Docker waits before SIGKILL after SIGTERM on stop */
    stopTimeout: "3",
    /** Max output size from container stdout (1 MB) */
    maxOutputBytes: 1024 * 1024,
    /** Label applied to every judge container for identification */
    containerLabelKey: "app",
    containerLabelValue: "leetcode-judge",
} as const;

const LANGUAGE_CONFIG = {
    javascript: {
        image: "node:22-alpine",
        sourceFile: "main.js",
        command: "node /code/main.js",
        localBinary: "node",
        localArgs: (filePath: string) => [filePath],
        /** JS/Python don't write executables to /tmp, so noexec is safe */
        needsTmpExec: false,
    },
    python: {
        image: "python:3.13-alpine",
        sourceFile: "main.py",
        command: "python /code/main.py",
        localBinary: "python3",
        localArgs: (filePath: string) => [filePath],
        needsTmpExec: false,
    },
    java: {
        image: "eclipse-temurin:21-jdk",
        sourceFile: "Main.java",
        command:
            "mkdir -p /tmp/classes && javac -d /tmp/classes /code/Main.java && java -cp /tmp/classes Main",
        localBinary: "sh",
        localArgs: (filePath: string) => [
            "-c",
            `javac -d /tmp ${filePath} && java -cp /tmp Main`,
        ],
        /** Java needs to write & execute compiled .class files in /tmp */
        needsTmpExec: true,
    },
    cpp: {
        image: "gcc:14",
        sourceFile: "main.cpp",
        command: "g++ /code/main.cpp -O2 -o /tmp/main && /tmp/main",
        localBinary: "sh",
        localArgs: (filePath: string) => [
            "-c",
            `g++ ${filePath} -O2 -o /tmp/main && /tmp/main`,
        ],
        /** C++ needs to write & execute compiled binary in /tmp */
        needsTmpExec: true,
    },
} as const;

// ---------------------------------------------------------------------------
// Low-level process runner
// ---------------------------------------------------------------------------

function runProcess(
    binary: string,
    args: string[],
    input: string,
    timeoutMs: number
): Promise<SpawnResult> {
    return new Promise((resolve, reject) => {
        const child = spawn(binary, args, {
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";
        let timedOut = false;

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
            if (Buffer.byteLength(stdout, "utf8") > SANDBOX_CONFIG.maxOutputBytes) {
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

// ---------------------------------------------------------------------------
// Docker daemon reachability check (cached for 30 s)
// ---------------------------------------------------------------------------

let _dockerAvailable: boolean | null = null;
let _dockerCheckedAt = 0;
const DOCKER_CHECK_TTL_MS = 30_000;

async function isDockerAvailable(): Promise<boolean> {
    const now = Date.now();
    if (_dockerAvailable !== null && now - _dockerCheckedAt < DOCKER_CHECK_TTL_MS) {
        return _dockerAvailable;
    }
    try {
        const result = await runProcess("docker", ["info", "--format", "{{.ID}}"], "", 5000);
        _dockerAvailable = result.exitCode === 0;
    } catch {
        _dockerAvailable = false;
    }
    _dockerCheckedAt = now;
    return _dockerAvailable;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isProductionEnv(): boolean {
    return process.env.NODE_ENV === "production";
}

function isDockerForced(): boolean {
    return process.env.USE_DOCKER === "true";
}

function isDockerDisabled(): boolean {
    return process.env.USE_DOCKER === "false";
}

/** Generate a unique, identifiable container name */
function makeContainerName(): string {
    const shortId = randomUUID().slice(0, 8);
    return `judge-${shortId}`;
}

/**
 * Detect Docker OOM kill.
 * When cgroups OOM-kill a process inside a container, the
 * container exits with code 137 (128 + SIGKILL=9).
 */
function isOOMKill(exitCode: number | null, stderr: string): boolean {
    return exitCode === 137 || stderr.includes("OOMKilled");
}

function isDaemonUnreachable(stderr: string): boolean {
    return (
        stderr.includes("Cannot connect to the Docker daemon") ||
        stderr.includes("docker daemon is not running") ||
        stderr.includes("Is the docker daemon running")
    );
}

// ---------------------------------------------------------------------------
// Core Docker execution
// ---------------------------------------------------------------------------

async function executeInDocker(
    config: (typeof LANGUAGE_CONFIG)[SupportedLanguage],
    tempDirectory: string,
    input: string,
    timeoutMs: number
): Promise<{ result: SpawnResult; containerName: string }> {
    const containerName = makeContainerName();

    // Java/C++ must write & execute compiled binaries in /tmp;
    // JS/Python only need writable /tmp (noexec is safe for them)
    const tmpfsOpts = config.needsTmpExec
        ? "/tmp:rw,nosuid,size=64m"
        : "/tmp:rw,nosuid,noexec,size=64m";

    const dockerArgs = [
        "run",

        // ── Lifecycle ───────────────────────────────────────────────
        "--rm",                                      // auto-remove on exit
        "--name", containerName,                     // unique name for cleanup
        "--stop-timeout", SANDBOX_CONFIG.stopTimeout, // fast SIGKILL after stop
        "-i",                                        // pipe stdin

        // ── Network isolation ───────────────────────────────────────
        "--network", "none",                         // no outbound/inbound network

        // ── Resource caps ───────────────────────────────────────────
        "--cpus", SANDBOX_CONFIG.cpuLimit,            // CPU throttle
        "--memory", SANDBOX_CONFIG.memoryLimit,       // hard memory cap
        "--memory-swap", SANDBOX_CONFIG.memoryLimit,  // disable swap (same as mem)
        "--pids-limit", SANDBOX_CONFIG.pidsLimit,     // prevent fork bombs

        // ── Privilege hardening ─────────────────────────────────────
        "--cap-drop", "ALL",                          // drop every Linux capability
        "--security-opt", "no-new-privileges",        // prevent privilege escalation
        "--read-only",                                // read-only root filesystem

        // ── Writable temp area ──────────────────────────────────────
        "--tmpfs", tmpfsOpts,

        // ── Label for orphan identification ─────────────────────────
        "--label", `${SANDBOX_CONFIG.containerLabelKey}=${SANDBOX_CONFIG.containerLabelValue}`,

        // ── Mount user code read-only ───────────────────────────────
        "-v", `${tempDirectory}:/code:ro`,

        // ── Image & command ─────────────────────────────────────────
        config.image,
        "sh",
        "-c",
        config.command,
    ];

    const result = await runProcess("docker", dockerArgs, input, timeoutMs);

    if (isDaemonUnreachable(result.stderr)) {
        // Invalidate the cached availability so the next check re-probes
        _dockerAvailable = null;
        throw new Error("Docker daemon not reachable");
    }

    return { result, containerName };
}

// ---------------------------------------------------------------------------
// Force-remove container (best effort, used on timeout / crash)
// ---------------------------------------------------------------------------

async function forceRemoveContainer(containerName: string): Promise<void> {
    try {
        await runProcess("docker", ["rm", "-f", containerName], "", 5000);
    } catch {
        // Ignore — the container may already be removed by --rm
    }
}

// ---------------------------------------------------------------------------
// Orphan container sweep
// ---------------------------------------------------------------------------

/**
 * Finds and removes judge containers that have been running for more
 * than `maxAgeSeconds`. Call this periodically (e.g. every 60 s from
 * the worker) to prevent leaked containers from accumulating.
 */
export async function sweepOrphanedContainers(maxAgeSeconds = 120): Promise<number> {
    try {
        const listResult = await runProcess(
            "docker",
            [
                "ps",
                "-q",
                "--filter", `label=${SANDBOX_CONFIG.containerLabelKey}=${SANDBOX_CONFIG.containerLabelValue}`,
                "--filter", `status=running`,
            ],
            "",
            5000
        );

        if (listResult.exitCode !== 0 || !listResult.stdout.trim()) {
            return 0;
        }

        const containerIds = listResult.stdout.trim().split(/\s+/);
        let removedCount = 0;

        for (const cid of containerIds) {
            // Inspect creation time
            const inspectResult = await runProcess(
                "docker",
                ["inspect", "--format", "{{.State.StartedAt}}", cid],
                "",
                3000
            );

            if (inspectResult.exitCode === 0) {
                const startedAt = new Date(inspectResult.stdout.trim()).getTime();
                const ageSeconds = (Date.now() - startedAt) / 1000;

                if (ageSeconds > maxAgeSeconds) {
                    console.warn(
                        `[sandbox] Removing orphaned judge container ${cid} (age: ${Math.round(ageSeconds)}s)`
                    );
                    await forceRemoveContainer(cid);
                    removedCount++;
                }
            }
        }

        return removedCount;
    } catch {
        return 0;
    }
}

// ---------------------------------------------------------------------------
// Main execution entry point
// ---------------------------------------------------------------------------

export async function executeCode(options: ExecuteCodeOptions): Promise<ExecutionResult> {
    const { code, language, input, timeoutMs = 3000, entryFunctionName } = options;
    const config = LANGUAGE_CONFIG[language];
    const tempDirectory = await mkdtemp(path.join(tmpdir(), "leetcode-judge-"));
    const sourcePath = path.join(tempDirectory, config.sourceFile);

    // Wrap user code with the driver test harness
    const finalCode = wrapCodeWithHarness({
        code,
        language,
        entryFunctionName,
    });

    try {
        await writeFile(sourcePath, finalCode, "utf8");
        const startTime = process.hrtime.bigint();

        // ── Determine execution mode ────────────────────────────────
        const dockerDisabled = isDockerDisabled();
        const isProduction = isProductionEnv();
        const dockerForced = isDockerForced();
        const mustUseDocker = isProduction || dockerForced;

        let result: SpawnResult | null = null;
        let containerName: string | undefined;
        let ranInDocker = false;

        // ── Try Docker execution first (unless explicitly disabled) ─
        if (!dockerDisabled) {
            const dockerReady = await isDockerAvailable();

            if (!dockerReady && mustUseDocker) {
                // PRODUCTION: Docker is mandatory — fail hard, don't run on host
                const endTime = process.hrtime.bigint();
                const runtime = Number(endTime - startTime) / 1_000_000;
                console.error(
                    "[sandbox] CRITICAL: Docker is required in production but the daemon is not reachable"
                );
                return {
                    type: "system_error",
                    output: "Code execution environment is unavailable. Please try again later.",
                    runtime,
                };
            }

            if (dockerReady) {
                try {
                    const dockerExec = await executeInDocker(config, tempDirectory, input, timeoutMs);
                    result = dockerExec.result;
                    containerName = dockerExec.containerName;
                    ranInDocker = true;
                } catch (dockerErr) {
                    if (mustUseDocker) {
                        const endTime = process.hrtime.bigint();
                        const runtime = Number(endTime - startTime) / 1_000_000;
                        console.error("[sandbox] Docker execution failed in production:", dockerErr);
                        return {
                            type: "system_error",
                            output: "Code execution environment error. Please try again later.",
                            runtime,
                        };
                    }
                    // Dev mode: fall through to local execution
                    console.warn("[sandbox] Docker execution failed, falling back to local:", dockerErr);
                    ranInDocker = false;
                }
            }
        }

        // ── Dev-only local fallback ─────────────────────────────────
        if (!ranInDocker || !result) {
            if (mustUseDocker) {
                // Should not reach here, but guard anyway
                const endTime = process.hrtime.bigint();
                const runtime = Number(endTime - startTime) / 1_000_000;
                return {
                    type: "system_error",
                    output: "Sandboxed execution is required but unavailable.",
                    runtime,
                };
            }

            console.warn(
                "[sandbox] Running user code locally (dev mode only — NEVER in production)"
            );

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

        // ── Handle timeout ──────────────────────────────────────────
        if (result.timedOut) {
            // Force-remove the container if it's still alive after timeout
            if (containerName) {
                forceRemoveContainer(containerName).catch(() => {});
            }
            return {
                type: "timeout",
                output: result.stderr || "Execution timed out",
                runtime,
            };
        }

        // ── Handle OOM kill (exit code 137) ─────────────────────────
        if (ranInDocker && isOOMKill(result.exitCode, result.stderr)) {
            return {
                type: "memory_limit_exceeded",
                output: `Memory Limit Exceeded (limit: ${SANDBOX_CONFIG.memoryLimit})`,
                runtime,
            };
        }

        // ── Success ─────────────────────────────────────────────────
        if (result.exitCode === 0) {
            return {
                type: "success",
                output: result.stdout,
                runtime,
            };
        }

        // ── Compile errors (Java / C++) ─────────────────────────────
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

        // ── Runtime error ───────────────────────────────────────────
        return {
            type: "runtime_error",
            output,
            runtime,
        };
    } finally {
        await rm(tempDirectory, { recursive: true, force: true });
    }
}
