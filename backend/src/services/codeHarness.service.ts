import type { SubmissionLanguage } from "../models/submission.model.js";

interface WrapCodeOptions {
    code: string;
    language: SubmissionLanguage;
    entryFunctionName?: string;
}

export function wrapCodeWithHarness(options: WrapCodeOptions): string {
    const { code, language, entryFunctionName } = options;

    if (language === "javascript") {
        // If code already handles stdin/stdout manually, do not double-wrap
        if (
            code.includes("readFileSync") ||
            code.includes("process.stdin") ||
            code.includes("readline")
        ) {
            return code;
        }

        return `
// --- User Code ---
${code}

// --- Driver Test Harness ---
const fs = require("fs");

(function _runHarness() {
    try {
        const rawInput = fs.readFileSync(0, "utf-8").trim();
        if (!rawInput) return;

        // Split by lines to gather function arguments
        const lines = rawInput.split(/\\r?\\n/).filter(line => line.length > 0);
        const parsedArgs = lines.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return line;
            }
        });

        // Determine target function
        let targetFn = null;
        ${entryFunctionName ? `if (typeof ${entryFunctionName} === "function") { targetFn = ${entryFunctionName}; }` : ""}

        if (!targetFn) {
            // Find any user function defined globally
            const reserved = new Set(["_runHarness", "require", "console", "process", "Buffer", "clearTimeout", "setTimeout", "setInterval", "clearInterval"]);
            for (const key of Object.getOwnPropertyNames(global)) {
                if (!reserved.has(key) && typeof global[key] === "function") {
                    targetFn = global[key];
                    break;
                }
            }
        }

        if (targetFn) {
            const result = targetFn(...parsedArgs);
            if (result !== undefined) {
                if (typeof result === "object" && result !== null) {
                    console.log(JSON.stringify(result));
                } else {
                    console.log(result);
                }
            }
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
`;
    }

    if (language === "python") {
        if (code.includes("sys.stdin") || code.includes("input(")) {
            return code;
        }

        return `
import sys
import json

# --- User Code ---
${code}

# --- Driver Test Harness ---
def _run_harness():
    try:
        raw_lines = [line.strip() for line in sys.stdin.readlines() if line.strip()]
        if not raw_lines:
            return

        parsed_args = []
        for line in raw_lines:
            try:
                parsed_args.append(json.loads(line))
            except Exception:
                parsed_args.append(line)

        result = None
        # Check if Solution class exists
        if "Solution" in globals():
            sol = Solution()
            ${entryFunctionName ? `
            if hasattr(sol, "${entryFunctionName}") and callable(getattr(sol, "${entryFunctionName}")):
                result = getattr(sol, "${entryFunctionName}")(*parsed_args)
            ` : `
            methods = [m for m in dir(sol) if not m.startswith("_") and callable(getattr(sol, m))]
            if methods:
                result = getattr(sol, methods[0])(*parsed_args)
            `}
        else:
            # Check for standalone function
            user_funcs = [v for k, v in globals().items() if callable(v) and not k.startswith("_") and k != "_run_harness"]
            if user_funcs:
                result = user_funcs[-1](*parsed_args)

        if result is not None:
            if isinstance(result, (list, dict, bool)):
                print(json.dumps(result, separators=(',', ':')))
            else:
                print(result)
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)

if __name__ == "__main__":
    _run_harness()
`;
    }

    // Java / C++ return as-is or user provided template
    return code;
}
