# Bug Inventory — game6-under-the-sun

Generated: 2026-05-01
Source: Manual code review of 62 files (~11,127 lines)

---

## CRITICAL — Blocks core gameplay

### BUG-001: FISH action produces zero fish
- **File**: `js/engine/actions.js:89`
- **Evidence**: `produces: [{ layer: 'survival', field: 'fish', delta: 0 }]`
- **Impact**: Fisherman family's primary action does nothing. Player selects FISH, spends stamina/AP, gains zero resources. Makes the fisherman family (1 of 6 starting families) unplayable.
- **Reproducible**: Always — hardcoded delta:0
- **Owner**: actions.js (data fix)
- **Fix**: Change `delta: 0` to `delta: 3` (or appropriate yield). Also verify FARM, OLIVE_HARVEST, GRAPE_HARVEST produce non-zero values.

### BUG-002: skills.get() polyfill scope limited to one member
- **File**: `js/main.js:323-325`
- **Evidence**: Polyfill `obj.get = function(key) { return this[key]; }` is applied to the first family member object only, inside `selectFamily()`. Other members' skill objects remain plain objects without `.get()`.
- **Impact**: When `actionRegistry.js:getAvailableActions()` calls `context.member.skills.get(skill)` for any member other than the first, it throws `TypeError: skills.get is not a function`. This silently blocks skill-gated actions for most family members.
- **Reproducible**: Always for members 2+ when actions have `requiredSkills`
- **Owner**: main.js (should polyfill all members, or change actionRegistry to use bracket access)
- **Fix**: Either polyfill ALL members' skills in selectFamily(), or change actionRegistry.js line 44 from `.get(skill)` to `[skill]` (bracket access works on plain objects).

---

## HIGH — Major gameplay broken

### BUG-003: MILL_GRAIN is net-zero (produces what it consumes)
- **File**: `js/engine/actions.js` — MILL_GRAIN action
- **Evidence**: `produces: [{ layer: 'survival', field: 'grain', delta: 2 }]`, `consumes: [{ layer: 'survival', field: 'grain', delta: 2 }]`
- **Impact**: Player wastes a time slot and stamina to mill grain, gains nothing. Likely intended to convert raw grain → flour (different resource), but both use the same field name.
- **Reproducible**: Always
- **Owner**: actions.js (data fix)
- **Fix**: Either change produce field to 'flour' (if flour resource exists), or change delta ratios so net is positive.

### BUG-004: GameEngine class unused — parallel logic in main.js
- **File**: `js/engine/gameLoop.js` (507 lines) vs `js/main.js:400-500`
- **Evidence**: `gameLoop.js` exports `GameEngine` constructor with advanceTimeSlot, advanceDay, processDailySettlement, food consumption, stamina recovery. But `main.js` never instantiates it — instead it has its own inline advanceTime logic that duplicates some but not all features (missing: NPC attitude drift, location movement, tool degradation per use).
- **Impact**: (1) ~500 lines of dead code. (2) Main.js's inline logic is incomplete — tool degradation, NPC drift, and location movement defined in GameEngine never execute. (3) Future changes must be synchronized in two places.
- **Reproducible**: Always (design issue)
- **Owner**: main.js (should use GameEngine) or gameLoop.js (should be removed if main.js is canonical)
- **Fix**: Replace main.js inline advanceTime logic with GameEngine instance, OR delete gameLoop.js and migrate any missing features into main.js.

### BUG-005: No resource depletion game-over
- **File**: `js/main.js` (missing check)
- **Evidence**: Resources (grain, fish, oil, water) can go negative via `applyActionEffects()`. No code checks if survival resources are ≤ 0 for N consecutive days. The design doc mentions endings triggered by debt/poverty but no starvation check exists.
- **Impact**: Game can continue indefinitely with all survival resources at -999. No pressure mechanic, no consequence for neglecting food production.
- **Reproducible**: Always once resources deplete
- **Owner**: main.js (daily settlement phase)
- **Fix**: Add starvation check in advanceTime — if survival grain+fish < 0 for 3+ consecutive days, trigger health degradation → game-over.

### BUG-006: Location navigation inaccessible from main game
- **File**: `js/engine/locationUI.js` + `js/main.js`
- **Evidence**: `locationUI.js` defines a full travel/navigation system with 7 maps. `main.js` initializes `Game.Engine.LocationUI` but never adds a "Travel" button to the action bar. No action type for travel exists in actions.js.
- **Impact**: Player is stuck at starting location forever. 4 of 8 chapters require travel (Ch.6: Jerusalem pilgrimage, Ch.7: city exploration). Design doc's 7-map world is inaccessible.
- **Reproducible**: Always — no UI entry point
- **Owner**: main.js (renderActionButtons) + actions.js (add TRAVEL action type)
- **Fix**: Add a TRAVEL action type, wire it to LocationUI.showTravelOptions(), or add a persistent "Travel" button in the top bar.

---

## MEDIUM — Degraded experience

### BUG-007: New ActionRegistry created every render cycle
- **File**: `js/main.js:302`
- **Evidence**: `const registry = new Game.Engine.ActionRegistry(allActions);` inside `renderActionButtons()` which is called every time slot change.
- **Impact**: Performance waste — reconstructs the full action registry (36 actions) and re-registers them every render. On mobile devices this causes unnecessary GC pressure.
- **Reproducible**: Every time slot change
- **Owner**: main.js
- **Fix**: Create ActionRegistry once in selectFamily() and reuse.

### BUG-008: Chapter progression relies on day count only
- **File**: `js/engine/chapterEngine.js` + `js/data/chapters.js`
- **Evidence**: Chapter transitions appear to be day-count thresholds. Design doc says chapters are narrative-driven (e.g., "first tax bill" triggers Ch.2). If day-count only, all players get identical pacing regardless of choices.
- **Impact**: Undermines the "choices matter" RPG design. Chapter 2 "first tax bill" should trigger on actual tax event, not day 30.
- **Reproducible**: Always
- **Owner**: chapterEngine.js
- **Fix**: Add condition-based triggers alongside day thresholds.

### BUG-009: Content gap vs design spec
- **File**: Multiple data files
- **Evidence**: Design spec: ~120 NPCs, ~80 quests, ~1500 dialogues. Current: ~70 NPCs (genericVillagers.js 40 + namedNpcs.js ~30), ~18 quests (15 Phase 3 + 3 Phase 4), ~30 dialogues (6 dialogue files × ~5 lines each).
- **Impact**: Game feels sparse. NPC interactions repeat quickly. Only 18 of planned 80 quests means most gameplay loops are empty after first playthrough.
- **Reproducible**: Always
- **Owner**: Data files (npcs, quests, dialogues)
- **Fix**: Content authoring — not a bug fix but a completeness gap. Low priority for stability, high priority for playability.

---

## LOW — Minor / cosmetic

### BUG-010: No npm test command
- **File**: `package.json`
- **Evidence**: `"test": "echo \"Error: no test specified\" && exit 1"`. Actual tests are in `test.mjs` using Playwright.
- **Impact**: CI/CD can't run tests. Developers must know to run `node test.mjs` manually.
- **Fix**: Change to `"test": "node test.mjs"`.

### BUG-011: Sabbath action filtering may be incomplete
- **File**: `js/engine/actionRegistry.js`
- **Evidence**: `getAvailableActions` checks `forbiddenOnSabbath` flag. But `sabbath.js` engine has more complex Sabbath rules (preparation requirements, cooking restrictions) that aren't reflected in the action filter.
- **Impact**: Player may be able to do actions that violate Sabbath law per the game's own rules engine.
- **Fix**: Cross-reference sabbath.js restrictions with actionRegistry filtering.

### BUG-012: Action points calculated but not enforced
- **File**: `js/engine/actionPoints.js` + `js/engine/actionRegistry.js`
- **Evidence**: `actionPoints.js` calculates available AP. `actionRegistry.js` filters by stamina and time but never checks AP cost vs available AP. Actions always execute regardless of AP budget.
- **Impact**: AP system is cosmetic — has no mechanical effect on gameplay.
- **Fix**: Add AP check in `getAvailableActions()` or in main.js before executing action.

---

## Summary

| Severity | Count | Key Blockers |
|----------|-------|-------------|
| CRITICAL | 2 | FISH produces 0, skills.get() TypeError |
| HIGH | 4 | MILL net-zero, GameEngine unused, no starvation, no travel |
| MEDIUM | 3 | Registry recreation, chapter triggers, content gap |
| LOW | 3 | npm test, Sabbath filter, AP unenforced |

**Recommended fix order**: BUG-001 → BUG-002 → BUG-006 → BUG-003 → BUG-005 → BUG-004 → BUG-012 → remaining
