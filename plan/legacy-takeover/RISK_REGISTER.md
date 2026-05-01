# Risk Register — game6-under-the-sun

Generated: 2026-05-01

---

## STOP — Escalate to Manager

### RISK-001: Worker 2 may break game loop significantly
- **Severity**: HIGH
- **Probability**: MEDIUM
- **Description**: BUG-004 requires replacing main.js's inline advanceTime (~100 lines of interwoven logic) with GameEngine. The two code paths differ in subtle ways (main.js has quest triggers, chapter checks; GameEngine has NPC drift, tool degradation). Merging them incorrectly could break time advancement, food consumption, or quest triggering.
- **Mitigation**: Worker 2 must read BOTH code paths side-by-side and create a diff of features before merging. If the diff is >30 behavioral differences, escalate to manager — may need to keep both paths and share state rather than replace.
- **Trigger for escalation**: After reading both paths, if >5 behavioral differences found that affect gameplay loops.

### RISK-002: No Playwright in execution environment
- **Severity**: MEDIUM
- **Probability**: HIGH
- **Description**: The test suite (`test.mjs`) requires Playwright with a browser binary. The orchestrator environment may not have Chromium installed. If tests can't run, workers can't verify changes.
- **Mitigation**: Workers should verify `npx playwright install chromium` works before making changes. If not, use manual console.log verification + load the HTML in a headless check.
- **Trigger for escalation**: If `node test.mjs` fails with "browser not installed" error.

---

## WARN — Proceed with Caution

### RISK-003: Action delta values are design decisions
- **Severity**: MEDIUM
- **Probability**: LOW
- **Description**: BUG-001 fix (FISH delta 0→3) and BUG-003 fix (MILL_GRAIN) are game balance changes. The values chosen affect game difficulty. Current spec doesn't define target yields. A value too high makes the game trivially easy; too low makes it grindy.
- **Mitigation**: Use conservative values: FISH=3 (feeds ~1 person/day), MILL_GRAIN net +1 flour. Document reasoning in code comments. Flag for playtest tuning later.

### RISK-004: GameEngine and main.js have diverged
- **Severity**: MEDIUM
- **Probability**: CONFIRMED
- **Description**: GameEngine (gameLoop.js) was written during orchestrator Phase 3 but main.js was written in Phase 1 and updated in Phase 2-4 independently. They may reference different state shapes (e.g., gameLoop.js might expect `state.resources.get()` while main.js uses `state.resources.survival.grain`).
- **Mitigation**: Worker 2 must trace all property access patterns in GameEngine before assuming it can replace main.js logic. Create a compatibility checklist.

### RISK-005: Content gap may make game feel incomplete
- **Severity**: LOW
- **Probability**: CONFIRMED
- **Description**: Design spec calls for ~120 NPCs, ~80 quests, ~1500 dialogues. Current: ~70 NPCs, ~18 quests, ~30 dialogues. This is not a bug but a completeness gap. Fixing mechanics won't address the "empty world" feel.
- **Mitigation**: Out of scope for this fix cycle. Recommend separate content-authoring worker packet if gameplay loop is confirmed working.
- **Decision needed**: Manager — should content gap be addressed in a follow-up round?

---

## INFO — No Action Needed

### RISK-006: Test coverage is thin
- **Description**: Only 23 tests exist. No integration test for full day cycle, no test for quest triggering, no test for chapter progression, no test for resource depletion. Fixes may introduce regressions not caught by existing tests.
- **Mitigation**: Workers should manually verify each fix in browser. Consider adding targeted tests for each bug fixed.

### RISK-007: IIFE global namespace pattern
- **Description**: All modules use `window.Game.*` global namespace via IIFEs. No module system. Workers must be careful about load order (defined in index.html script tags). Adding new files requires adding script tags in correct position.
- **Mitigation**: Not a risk per se — just a constraint. Workers must update index.html if adding new JS files.
