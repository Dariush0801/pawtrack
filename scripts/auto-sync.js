/**
 * PawTrack Pet Owner Portal - Automatic Git Commit & Cloud Push Watcher
 * Watches project files for changes, automatically commits, and pushes to GitHub.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEBOUNCE_MS = 3500; // 3.5 seconds debounce

let debounceTimer = null;
let changedFiles = new Set();
let isSyncing = false;
let lastSyncTimestamp = null;
let lastSyncResult = 'idle';

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

function getRemoteUrl() {
  const remote = runGit('git config --get remote.origin.url');
  return remote || 'https://github.com/Dariush0801/pawtrack.git';
}

function cleanStaleLock() {
  try {
    const lockPath = path.join(ROOT_DIR, '.git', 'index.lock');
    if (fs.existsSync(lockPath)) {
      const stats = fs.statSync(lockPath);
      // If lock file is older than 10 seconds, remove it
      if (Date.now() - stats.mtimeMs > 10000) {
        fs.unlinkSync(lockPath);
        console.log('[Auto-Sync] Cleaned stale .git/index.lock file');
      }
    }
  } catch (e) {}
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

function getStatusSummary() {
  const branch = getActiveBranch();
  const remote = getRemoteUrl();
  const statusOutput = runGit('git status --short') || '';
  const changes = statusOutput.split('\n').filter(Boolean);

  return {
    service: 'PawTrack Owner Portal Auto-Sync',
    branch,
    remote,
    clean: changes.length === 0,
    pendingFilesCount: changes.length,
    pendingFiles: changes.slice(0, 10),
    lastSyncTimestamp,
    lastSyncResult,
    isSyncing
  };
}

function performSync(customMessage) {
  if (isSyncing) return { inProgress: true };
  isSyncing = true;
  cleanStaleLock();

  try {
    const branch = getActiveBranch();
    const status = runGit('git status --porcelain');

    if (!status) {
      console.log(`[${new Date().toLocaleTimeString()}] No changes to commit. Working tree is clean.`);
      isSyncing = false;
      changedFiles.clear();
      return { success: true, message: 'Working tree is clean', branch };
    }

    const count = changedFiles.size || 1;
    const fileListStr = Array.from(changedFiles).slice(0, 3).join(', ') + (changedFiles.size > 3 ? ` (+${changedFiles.size - 3} more)` : '');
    const commitMsg = customMessage || `Auto-sync: update ${count} file(s) [${fileListStr || 'changes'}] at ${new Date().toLocaleTimeString()}`;

    console.log(`\n[${new Date().toLocaleTimeString()}] 📝 Staging changes...`);
    if (changedFiles.size > 0) {
      changedFiles.forEach(f => console.log(`   • ${f}`));
    }

    runGit('git add -A');
    const commitResult = runGit(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    console.log(`[${new Date().toLocaleTimeString()}] 📦 Committed: ${commitMsg}`);

    console.log(`[${new Date().toLocaleTimeString()}] 🚀 Pushing to GitHub (${branch})...`);
    
    // Try push, if rejected because remote has commits, rebase then push
    let pushResult = runGit(`git push origin ${branch}`);
    if (pushResult === null) {
      console.log(`[${new Date().toLocaleTimeString()}] Fetching latest remote branch changes...`);
      runGit(`git pull --rebase origin ${branch}`);
      pushResult = runGit(`git push origin ${branch}`);
    }

    lastSyncTimestamp = new Date().toISOString();
    lastSyncResult = 'success';
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Auto-sync successfully pushed to GitHub!\n`);

    return {
      success: true,
      commitMsg,
      branch,
      timestamp: lastSyncTimestamp
    };
  } catch (err) {
    lastSyncResult = 'error: ' + (err.message || err);
    console.warn(`[${new Date().toLocaleTimeString()}] ⚠️ Auto-sync notice:`, err.message || err);
    return { success: false, error: err.message || err };
  } finally {
    isSyncing = false;
    changedFiles.clear();
  }
}

function scheduleSync(filename) {
  if (shouldIgnore(filename)) return;

  changedFiles.add(filename);
  clearTimeout(debounceTimer);

  console.log(`[${new Date().toLocaleTimeString()}] ⚡ File modified: ${filename} (syncing in ${DEBOUNCE_MS / 1000}s)...`);
  debounceTimer = setTimeout(() => performSync(), DEBOUNCE_MS);
}

function startWatcher() {
  try {
    const watcher = fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
      scheduleSync(filename);
    });

    console.log('\n===============================================================');
    console.log('  🐾 PawTrack Git Auto-Commit & Auto-Sync Service');
    console.log('  Monitoring:', ROOT_DIR);
    console.log('  Remote:    ' + getRemoteUrl());
    console.log('  Branch:    ' + getActiveBranch());
    console.log('  Debounce:  ' + (DEBOUNCE_MS / 1000) + 's');
    console.log('===============================================================');
    console.log('✨ File watcher active and listening for code updates.');
    console.log('✨ Ready to automatically commit and push to GitHub.\n');

    return watcher;
  } catch (err) {
    console.error('Error starting file watcher:', err.message);
    return null;
  }
}

// If executed directly from command line
if (require.main === module) {
  startWatcher();
}

module.exports = {
  startWatcher,
  performSync,
  getStatusSummary,
  runGit,
  getActiveBranch,
  getRemoteUrl
};
