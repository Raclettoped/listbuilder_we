# General Test and Bug Fix

Run the full test suite and fix any failures, strictly following the rules in `.clinerules/`.

## Step 1: Run all tests
- Execute the test command (e.g., `npm test` or the actual command for your project).
- Read the exit code and failure output.

## Step 2: Analyze failures
- For each failing test, locate the root cause.
- If the failure is unrelated to recent changes or is an environment issue, report it and stop.

## Step 3: Fix and re-test
- Modify the source code to fix the failure.
- **Do not** modify, delete, or skip test files to make tests pass.
- Re-run the test suite.

## Step 4: Report results
- List modified files.
- Report final test status.
- If issues remain unresolved after 2 attempts, stop and report to the user.