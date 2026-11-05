# Testing Requirements

## Core Principle
- Before claiming a bug is fixed, you must provide evidence that the test passes.
- Do not use "should be fixed" or "logic looks correct" as a conclusion.

## Test Commands
- Run all tests: npm test (or the actual command for your project)
- Run a single test file: npm test -- <filename>

## Testing Process (After Bug Fix)
1. Write a minimal test that can reproduce the bug, or manually reproduce it and record the steps.
2. Confirm the test fails before the fix (Red).
3. Modify the code.
4. Re-run the test, confirm it passes (Green).
5. Run the full test suite to confirm no other features are broken.

## When the Project Has No Tests
- If the bug involves calculation logic (such as point costs), you must first write a minimal unit test for that calculation function.
- Test file location: `src/**/*.test.js` or `__tests__/`.