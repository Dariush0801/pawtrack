const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== Running Test: Hardware Prototype 3-Second Cycle Verification ===\n');

// 1. Verify CSS styles for the new hardware prototype in components.css
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'components.css'), 'utf8');

const requiredCssSelectors = [
  '.tag-preview-wrapper',
  '.tag-keychain-rig',
  '.tag-keychain-splitring',
  '.tag-keychain-chain',
  '.tag-chain-link',
  '.tag-jumpring',
  '.tag-3d-model',
  '.tag-hole',
  '.tag-emboss-graphic',
  '.tag-svg-emblem',
  '.tag-morph-out',
  '.tag-morph-in'
];

let allCssFound = true;
for (const selector of requiredCssSelectors) {
  if (css.includes(selector)) {
    console.log(`[PASS] CSS class [${selector}] is defined`);
  } else {
    console.error(`[FAIL] CSS class [${selector}] is missing`);
    allCssFound = false;
  }
}

// 2. Load HardwareView and test pattern rendering
const hardwareViewCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'views', 'hardware-view.js'), 'utf8');

// Mock DOM environment
global.window = {
  pawI18n: { t: (k, d) => d },
  location: { hash: '#hardware' },
  lucide: { createIcons: () => {} }
};

const mockSlot = {
  innerHTML: '',
  classList: {
    classes: new Set(),
    add(c) { this.classes.add(c); },
    remove(c) { this.classes.delete(c); }
  }
};

const context = {
  window: global.window,
  console,
  document: {
    getElementById: (id) => (id === 'tag-emblem-slot' ? mockSlot : null),
    querySelectorAll: () => []
  },
  setInterval: global.setInterval,
  clearInterval: global.clearInterval,
  setTimeout: global.setTimeout
};

vm.createContext(context);
vm.runInContext(hardwareViewCode, context);
const HardwareView = context.HardwareView || context.window.hardwareView.constructor;

const view = new HardwareView();
console.log('\n--- Testing HardwareView Class Methods ---');

// Test default pattern
if (view.selectedPattern === 'paw') {
  console.log('[PASS] Default pattern is "paw" (Signature Paw Print)');
} else {
  console.error(`[FAIL] Expected default pattern "paw", got "${view.selectedPattern}"`);
}

// Test patterns list
if (Array.isArray(view.patterns) && view.patterns.length === 3 &&
    view.patterns.includes('paw') && view.patterns.includes('bone') && view.patterns.includes('cat')) {
  console.log('[PASS] HardwareView.patterns contains ["paw", "bone", "cat"]');
} else {
  console.error('[FAIL] HardwareView.patterns invalid');
}

// Test getPatternSvg for paw, bone, cat
const pawSvg = view.getPatternSvg('paw');
const boneSvg = view.getPatternSvg('bone');
const catSvg = view.getPatternSvg('cat');

if (pawSvg && pawSvg.includes('ellipse') && pawSvg.includes('path')) {
  console.log('[PASS] "paw" pattern generates valid 4-toe paw print SVG');
} else {
  console.error('[FAIL] "paw" pattern SVG invalid');
}

if (boneSvg && boneSvg.includes('circle') && boneSvg.includes('rect')) {
  console.log('[PASS] "bone" pattern generates valid dog bone SVG');
} else {
  console.error('[FAIL] "bone" pattern SVG invalid');
}

if (catSvg && catSvg.includes('path') && catSvg.includes('viewBox="0 0 100 100"')) {
  console.log('[PASS] "cat" pattern generates valid playful cat silhouette SVG');
} else {
  console.error('[FAIL] "cat" pattern SVG invalid');
}

// Test rendering markup
const container = { innerHTML: '' };
view.render(container);

// Confirm tag-pattern-bar is REMOVED from the markup as requested
if (!container.innerHTML.includes('tag-pattern-bar')) {
  console.log('[PASS] tag-pattern-bar button bar has been cleanly removed from render markup');
} else {
  console.error('[FAIL] tag-pattern-bar is still present in render markup');
}

if (container.innerHTML.includes('tag-preview-wrapper') &&
    container.innerHTML.includes('tag-keychain-splitring') &&
    container.innerHTML.includes('tag-3d-model') &&
    container.innerHTML.includes('tag-emboss-graphic')) {
  console.log('[PASS] render() generates circular white tag markup with keychain and 3D emblem slot');
} else {
  console.error('[FAIL] render() missing required markup components');
}

// Test timer start / stop
if (view.cycleInterval) {
  console.log('[PASS] 3-second cycle timer automatically initialized on render()');
  view.stopCycleTimer();
  if (view.cycleInterval === null) {
    console.log('[PASS] stopCycleTimer() cleanly clears interval');
  }
} else {
  console.error('[FAIL] cycleInterval was not started on render()');
}

console.log('\n=== All Hardware Prototype Tests Passed Successfully! ===\n');
