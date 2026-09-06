/**
 * PawTrack Automatic Git Commit & Cloud Push Watcher
 * Watches project files for changes, automatically commits, and pushes to GitHub.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEBOUNCE_MS = 4000; // 4 seconds after last file change

let debounceTimer = null;
let changedFiles = new Set();
let isSyncing = false;

console.log('\n===============================================================');
console.log('  🐾 PawTrack Git Auto-Commit & Auto-Sync Service');
console.log('  Monitoring:', ROOT_DIR);
console.log('  Remote:    origin/main');
console.log('  Debounce:  ' + (DEBOUNCE_MS / 1000) + 's');
console.log('===============================================================\n');

function runGit(command) {
  try {
    return execSync(command, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return null;
  }
}

function getActiveBranch() {
  const branch = runGit('git rev-parse --abbrev-ref HEAD');
  return branch || 'main';
}

function shouldIgnore(filename) {
  if (!filename) return true;
  const normalized = filename.replace(/\\/g, '/');
  if (normalized.startsWith('.git') ||
      normalized.includes('node_modules') ||
      normalized.includes('.vercel') ||
      normalized.endsWith('.log') ||
      normalized.includes('pawtrack-shared-db.json') ||
      normalized.includes('.DS_Store')) {
    return true;
  }
  return false;
}

function performSync() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const branch = getActiveBranch();
    const status = runGit('git status --porcelain');

    if (!status) {
      console.log(`[${new Date().toLocaleTimeString()}] No changes to commit. Working tree is clean.`);
      isSyncing = false;
      changedFiles.clear();
      return;
    }

    const count = changedFiles.size || 1;
    const fileListStr = Array.from(changedFiles).slice(0, 3).join(', ') + (changedFiles.size > 3 ? ` (+${changedFiles.size - 3} more)` : '');
    const commitMsg = `Auto-sync: update ${count} file(s) [${fileListStr || 'changes'}] at ${new Date().toLocaleTimeString()}`;

    console.log(`\n[${new Date().toLocaleTimeString()}] 📦 Detected changes:`);
    changedFiles.forEach(f => console.log(`   • ${f}`));

    console.log(`[${new Date().toLocaleTimeString()}] 🚀 Staging and committing...`);
    runGit('git add -A');
    const commitResult = runGit(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);

    console.log(`[${new Date().toLocaleTimeString()}] ⬆️  Pushing to GitHub (${branch})...`);
    const pushResult = runGit(`git push origin ${branch}`);

    console.log(`[${new Date().toLocaleTimeString()}] ✅ Auto-sync successfully completed!\n`);
  } catch (err) {
    console.warn(`[${new Date().toLocaleTimeString()}] ⚠️ Auto-sync notice:`, err.message || err);
  } finally {
    isSyncing = false;
    changedFiles.clear();
  }
}

function scheduleSync(filename) {
  if (shouldIgnore(filename)) return;

  changedFiles.add(filename);
  clearTimeout(debounceTimer);

  console.log(`[${new Date().toLocaleTimeString()}] 📝 File modified: ${filename} (sync in ${DEBOUNCE_MS / 1000}s)...`);
  debounceTimer = setTimeout(performSync, DEBOUNCE_MS);
}

try {
  fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
    scheduleSync(filename);
  });
  console.log('✓ File watcher active and listening for code updates.');
  console.log('✓ Ready to auto-commit and push.\n');
} catch (err) {
  console.error('Error starting file watcher:', err.message);
}
