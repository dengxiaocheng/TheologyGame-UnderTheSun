# Execution Breakdown — game6-under-the-sun

Generated: 2026-05-01
Format: Ordered worker packets ready for dispatch

---

## Worker 1: `game6-core-mechanics`

**Priority**: P0 (blocks all other workers)
**Estimated delta**: ~80 net lines changed across 3 files

### Read Scope
- `js/engine/actions.js` (655 lines)
- `js/engine/actionRegistry.js` (73 lines)
- `js/main.js` (585 lines)
- `js/models/resources.js`
- `js/engine/actionPoints.js`

### Write Scope
- `js/engine/actions.js` — Fix FISH delta, fix MILL_GRAIN deltas
- `js/engine/actionRegistry.js` — Change skills.get() to bracket access; add AP check
- `js/main.js` — Add starvation check; add Travel button; move ActionRegistry init; add AP gating

### Tasks (ordered)

1. **BUG-001: Fix FISH action** [actions.js]
   - Line ~89: Change `delta: 0` to `delta: 3` in FISH produces array
   - Verify FARM, OLIVE_HARVEST, GRAPE_HARVEST also have non-zero deltas

2. **BUG-002: Fix skills access** [actionRegistry.js]
   - Line ~44: Change `context.member.skills.get(skill)` to `context.member.skills[skill]`
   - Remove polyfill code from main.js:323-325 (no longer needed)

3. **BUG-003: Fix MILL_GRAIN** [actions.js]
   - Change produces field from 'grain' to 'flour' (add flour to resource model if needed)
   - OR change produce delta to +3, keep consume at -2 (net +1)

4. **BUG-006: Add Travel button** [main.js]
   - In `renderActionButtons()`, add a persistent "Travel" button after action list
   - Wire onclick to `Game.Engine.LocationUI.showTravelOptions()`
   - Ensure LocationUI is initialized (it already is in init)

5. **BUG-005: Starvation check** [main.js]
   - In `advanceTime()`, after resource changes, check if grain+fish < 0
   - Track consecutive days of deficit (store in game state)
   - At 3+ days: show warning dialog
   - At 7+ days: health degradation on all members
   - At 14+ days: game-over (trigger worst ending)

6. **BUG-007: Singleton ActionRegistry** [main.js]
   - Move `new ActionRegistry(allActions)` from `renderActionButtons()` to `selectFamily()`
   - Store as `this.registry` or global, reference in render

7. **BUG-012: AP enforcement** [main.js]
   - Before executing action, check `member.stamina >= action.staminaCost` AND `availableAP >= action.apCost`
   - Grey out or hide actions that exceed AP budget

### Acceptance Tests
- [ ] Fisherman family: FISH action increases fish resource by 3
- [ ] Select craftsman family: action buttons appear without TypeError
- [ ] All 6 families: action buttons render without console errors
- [ ] Travel button visible on game screen, opens location picker on tap
- [ ] Deplete grain to 0 → advance 3 days → warning dialog appears
- [ ] Actions grey out when stamina/AP insufficient
- [ ] `node test.mjs`: all 23 tests pass

### File Budget
| File | Action | Est. Lines |
|------|--------|-----------|
| `js/engine/actions.js` | Edit | ~3 lines changed |
| `js/engine/actionRegistry.js` | Edit | ~2 lines changed |
| `js/main.js` | Edit | ~75 lines changed |
| **Total** | | **~80 net lines** |

---

## Worker 2: `game6-engine-integration`

**Priority**: P1 (runs after Worker 1)
**Estimated delta**: ~60 net lines changed across 2 files
**Depends on**: Worker 1 (main.js changes must merge cleanly)

### Read Scope
- `js/engine/gameLoop.js` (507 lines)
- `js/main.js` (post-Worker-1 version)
- `js/engine/chapterEngine.js`
- `js/data/chapters.js`
- `js/engine/sabbath.js`
- `js/engine/toolDegradation.js`
- `js/engine/npcSchedule.js`

### Write Scope
- `js/main.js` — Replace inline advanceTime with GameEngine; add chapter condition triggers

### Tasks (ordered)

1. **BUG-004: Integrate GameEngine** [main.js]
   - Read gameLoop.js GameEngine constructor and methods
   - In main.js init, create `GameEngine` instance after all engines initialized
   - Replace inline `advanceTime()` logic with `gameEngine.advanceTimeSlot()` call
   - Ensure gameEngine has access to all required sub-engines (schedule, market, attitude, tool, rumor)
   - Remove duplicated code from main.js
   - If GameEngine methods are missing features that main.js has (e.g., quest triggers), add them to GameEngine

2. **BUG-008: Condition-based chapter triggers** [main.js or chapterEngine.js]
   - Read chapters.js for chapter definitions
   - Add trigger conditions: Ch.2 on first tax event, Ch.3 on first sabbath violation, Ch.5 on betrothal/marriage event
   - Keep day-count as fallback (minimum day threshold)
   - Wire into the chapter advancement check in main.js

### Acceptance Tests
- [ ] Game starts, plays through 5 time slots without console errors
- [ ] Day advances correctly (day counter increments)
- [ ] Food consumption happens (grain decreases per day)
- [ ] Stamina recovery happens overnight
- [ ] Tool degradation triggers on relevant actions
- [ ] Chapter 1 starts immediately; Chapter 2 triggers on tax event OR day 30
- [ ] `node test.mjs`: all 23 tests pass

### File Budget
| File | Action | Est. Lines |
|------|--------|-----------|
| `js/main.js` | Edit | ~60 lines changed |
| **Total** | | **~60 net lines** |

---

## Worker 3: `game6-polish-infra`

**Priority**: P2 (runs after Worker 2)
**Estimated delta**: ~15 net lines changed across 2 files
**Depends on**: Worker 2 (all gameplay tests must pass first)

### Read Scope
- `package.json`
- `js/engine/sabbath.js`
- `js/engine/actionRegistry.js`
- `js/data/families.js` (verify Sabbath-relevant actions)

### Write Scope
- `package.json` — Fix test command
- `js/engine/actionRegistry.js` — Enhance Sabbath filtering

### Tasks (ordered)

1. **BUG-010: Fix npm test** [package.json]
   - Change `"test": "echo ..."` to `"test": "node test.mjs"`

2. **BUG-011: Sabbath action filter** [actionRegistry.js]
   - Read sabbath.js for full restriction list (cooking, travel, commerce, etc.)
   - In `getAvailableActions`, expand Sabbath filtering beyond `forbiddenOnSabbath` flag
   - Add category-based blocks: COMMERCE actions blocked, TRAVEL blocked, COOKING blocked
   - Keep permitted actions: rest, worship, synagogue attendance

### Acceptance Tests
- [ ] `npm test` runs Playwright tests (23 pass)
- [ ] On Sabbath day, commerce/travel/cooking actions hidden
- [ ] On Sabbath day, rest/worship actions available
- [ ] `node test.mjs`: all 23 tests pass

### File Budget
| File | Action | Est. Lines |
|------|--------|-----------|
| `package.json` | Edit | ~1 line changed |
| `js/engine/actionRegistry.js` | Edit | ~14 lines changed |
| **Total** | | **~15 net lines** |

---

## Merge Strategy

Workers run sequentially: W1 → W2 → W3.
Each worker must pass all 23 existing tests before committing.
Worker 2 must re-read main.js after Worker 1's changes.
Worker 3 must verify Workers 1+2 didn't break Sabbath logic.

Total estimated change: **~155 net lines** across 4 files.
Well within 500-line budget.
