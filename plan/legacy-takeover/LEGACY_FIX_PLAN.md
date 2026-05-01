# Legacy Fix Plan — game6-under-the-sun

Generated: 2026-05-01
Scope: Make the game playable end-to-end with all core systems functional

---

## Goal

Fix the 12 bugs identified in BUG_INVENTORY.md so that a player can:
1. Select any of 6 families and have core actions work (FISH produces fish, skills don't crash)
2. Travel between 7 locations via accessible travel UI
3. Experience resource pressure (food can run out → consequences)
4. Progress through 8 chapters with meaningful triggers
5. Reach 1 of 5 endings

## Strategy: 3 Execution Workers

### Worker 1: Core Mechanics Fix (CRITICAL + HIGH blockers)
**Read**: `js/engine/actions.js`, `js/engine/actionRegistry.js`, `js/main.js`, `js/engine/gameLoop.js`, `js/engine/locationUI.js`
**Write**: `js/engine/actions.js`, `js/engine/actionRegistry.js`, `js/main.js`
**Budget**: ~80 lines changed

Fixes:
- BUG-001: FISH delta 0 → 3 (1 line)
- BUG-002: skills.get() → bracket access in actionRegistry (1 line change)
- BUG-003: MILL_GRAIN produce field grain → flour or adjust deltas (2 lines)
- BUG-005: Add starvation check in advanceTime (~15 lines)
- BUG-006: Add TRAVEL button + wire to LocationUI (~20 lines)
- BUG-007: Move ActionRegistry creation to selectFamily (~5 lines moved)
- BUG-012: Add AP check before action execution (~10 lines)

### Worker 2: GameEngine Integration
**Read**: `js/engine/gameLoop.js`, `js/main.js`, `js/engine/chapterEngine.js`, `js/data/chapters.js`
**Write**: `js/main.js`
**Budget**: ~60 lines changed

Fixes:
- BUG-004: Replace inline advanceTime with GameEngine instance, migrate missing features
- BUG-008: Add condition-based chapter triggers (tax event for Ch.2, etc.)

### Worker 3: Polish & Test Infrastructure
**Read**: `package.json`, `js/engine/sabbath.js`, `js/engine/actionRegistry.js`
**Write**: `package.json`, `js/engine/actionRegistry.js`
**Budget**: ~15 lines changed

Fixes:
- BUG-010: Fix npm test command
- BUG-011: Cross-reference sabbath restrictions in action filtering

## Stop Conditions

1. **All 23 existing tests pass** (8 mobile + 15 gameplay)
2. **New smoke test**: Select fisherman family → FISH action → resource increases
3. **New smoke test**: Select any family → Travel button visible → can navigate to new location
4. **New smoke test**: Deplete grain → starvation warning appears
5. **No new JS console errors** on page load through one full day cycle
6. **Mobile tests pass** (44px touch targets, no horizontal overflow, no keyboard dependency)

## NOT in Scope

- Content gap (BUG-009): Adding more NPCs/quests/dialogues is content authoring, not bug fixing
- Visual/audio polish
- Performance optimization beyond the ActionRegistry fix
- New gameplay features beyond what design doc specifies
- Save/load system (not in current codebase)

## Risk

See RISK_REGISTER.md for blockers and escalation paths.
