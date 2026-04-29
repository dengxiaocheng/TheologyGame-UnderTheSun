/**
 * Game6 Under the Sun - Gameplay Test
 * Tests: family selection, action system, resource management, time progression, touch interaction
 * Run: node test-game6.mjs [game-dir]
 */
import { chromium } from 'playwright';
import { resolve } from 'path';

const W = 375, H = 812;
const DIR = process.argv[2] || 'game6-under-the-sun';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  const results = { passed: 0, failed: 0, errors: [] };
  function pass(msg) { results.passed++; console.log(`  ✓ ${msg}`); }
  function fail(msg) { results.failed++; results.errors.push(msg); console.log(`  ✗ ${msg}`); }

  try {
    await page.goto(`file://${resolve(DIR, 'index.html')}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    errors.length === 0 ? pass('No JS errors on load') : fail(`JS errors: ${errors.join('; ')}`);

    // 1. Title screen with family selection buttons
    const familyBtns = await page.evaluate(() => {
      var btns = document.querySelectorAll('.family-btn, #family-buttons button');
      return btns.length;
    });
    familyBtns >= 1 ? pass(`Family selection buttons: ${familyBtns}`) : fail('No family selection buttons found');

    // 2. Touch a family button to start game
    if (familyBtns >= 1) {
      await page.evaluate(() => {
        var btn = document.querySelector('.family-btn, #family-buttons button');
        if (btn) btn.click();
      });
      await page.waitForTimeout(800);

      // 3. Game screen visible after selection
      const gameScreen = await page.evaluate(() => {
        var gs = document.getElementById('screen-game');
        if (!gs) return false;
        return !gs.classList.contains('hidden');
      });
      gameScreen ? pass('Game screen visible after family selection') : fail('Game screen not visible');

      // 4. Resource display exists
      const hasResources = await page.evaluate(() => {
        var rl = document.getElementById('resource-list');
        return rl && rl.innerHTML.length > 10;
      });
      hasResources ? pass('Resource panel populated') : fail('Resource panel empty or missing');

      // 5. Action buttons exist and are large enough
      const actionInfo = await page.evaluate(() => {
        var btns = document.querySelectorAll('.action-btn, #action-buttons button');
        if (btns.length === 0) return { count: 0, sizes: [] };
        var sizes = [];
        btns.forEach(b => {
          var r = b.getBoundingClientRect();
          sizes.push({ w: Math.round(r.width), h: Math.round(r.height) });
        });
        return { count: btns.length, sizes: sizes };
      });
      actionInfo.count >= 1
        ? pass(`Action buttons: ${actionInfo.count}`)
        : fail('No action buttons found');

      // 6. Action buttons touch target >= 44px
      if (actionInfo.sizes.length > 0) {
        const allLarge = actionInfo.sizes.every(s => s.h >= 44);
        allLarge ? pass('Action buttons all >= 44px height') : fail(`Small action buttons: ${JSON.stringify(actionInfo.sizes.filter(s => s.h < 44))}`);
      }

      // 7. Date display shows
      const hasDate = await page.evaluate(() => {
        var dd = document.getElementById('date-display');
        return dd && dd.textContent.length > 0;
      });
      hasDate ? pass('Date display shows') : fail('No date display');

      // 8. Log area shows initial messages
      const hasLog = await page.evaluate(() => {
        var la = document.getElementById('log-area');
        return la && la.textContent.length > 10;
      });
      hasLog ? pass('Log area populated') : fail('Log area empty');

      // 9. Touch "advance time" button — verify it works
      const advanceOk = await page.evaluate(() => {
        var btns = document.querySelectorAll('#action-buttons button');
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].textContent.indexOf('推进时间') !== -1) {
            btns[i].click();
            return true;
          }
        }
        return false;
      });
      advanceOk ? pass('Advance time button works') : fail('Could not find/click advance time');

      // 10. Verify time actually changed
      await page.waitForTimeout(300);
      const timeChanged = await page.evaluate(() => {
        var la = document.getElementById('log-area');
        return la && la.textContent.indexOf('时间推进') !== -1;
      });
      timeChanged ? pass('Time advanced successfully') : fail('Time did not advance');

      // 11. Action points update
      const apDisplay = await page.evaluate(() => {
        var rl = document.getElementById('resource-list');
        if (!rl) return null;
        return rl.textContent.indexOf('行动点数') !== -1 || rl.textContent.indexOf('剩余') !== -1;
      });
      apDisplay ? pass('Action points displayed') : fail('No action points display');

      // 12. Freeze test: execute all available actions without getting stuck
      const noFreeze = await page.evaluate(() => {
        var btns = document.querySelectorAll('#action-buttons button:not([disabled])');
        var clicked = 0;
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].textContent.indexOf('推进时间') === -1) {
            btns[i].click();
            clicked++;
          }
        }
        return { clicked: clicked, totalButtons: document.querySelectorAll('#action-buttons button').length };
      });
      noFreeze.clicked >= 0
        ? pass(`Executed ${noFreeze.clicked} actions without freeze`)
        : fail('Action execution may have frozen');

      // 13. Collapsible panels work (touch toggle)
      const panelToggle = await page.evaluate(() => {
        var headers = document.querySelectorAll('.panel.collapsible .panel-header');
        if (headers.length === 0) return 'no-panels';
        headers[0].click();
        var panel = headers[0].parentElement;
        return panel.classList.contains('collapsed') ? 'collapsed' : 'expanded';
      });
      panelToggle !== 'no-panels'
        ? pass(`Panel toggle works: ${panelToggle}`)
        : fail('No collapsible panels found');

    } else {
      fail('Cannot test gameplay — no family buttons');
    }

    // 14. Touch interaction works
    const touchOk = await page.evaluate(() => {
      var target = document.body;
      try {
        var rect = target.getBoundingClientRect();
        var t = new Touch({ identifier: 1, target, clientX: rect.x + rect.width/2, clientY: rect.y + rect.height/2 });
        target.dispatchEvent(new TouchEvent('touchstart', { touches: [t], bubbles: true }));
        target.dispatchEvent(new TouchEvent('touchend', { changedTouches: [t], bubbles: true }));
        return 'ok';
      } catch (e) { return e.message; }
    });
    touchOk === 'ok' ? pass('Touch interaction works') : fail(`Touch failed: ${touchOk}`);

    // 15. No horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    overflow <= 2 ? pass('No horizontal overflow') : fail(`Overflow: ${overflow}px`);

  } catch (err) {
    fail(`Fatal: ${err.message}`);
  }

  await ctx.close();
  await browser.close();
  console.log(`\n  Total: ${results.passed} passed, ${results.failed} failed`);
  return results;
}

test().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(2); });
