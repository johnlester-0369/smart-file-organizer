import chokidar from 'chokidar';
import fs       from 'node:fs';
import path     from 'node:path';
import os       from 'node:os';

// Map file extensions to Windows 11 shell folder names under %USERPROFILE%.
// os.homedir() resolves to C:\Users\<username> on Windows, matching the exact
// paths that Explorer exposes (Documents, Pictures, Music, Videos).
const EXTENSION_MAP = {
  '.pdf': 'Documents',
  '.jpg': 'Pictures',
  '.png': 'Pictures',
  '.mp3': 'Music',
  '.mp4': 'Videos',
};

const HOME_DIR  = os.homedir();
const WATCH_DIR = path.join(HOME_DIR, 'Downloads');

// Returns the destination shell-folder name for a given extension,
// or null when the extension is not in the ruleset (file left untouched).
function getDestinationFolder(ext) {
  return EXTENSION_MAP[ext.toLowerCase()] ?? null;
}

function moveFile(filePath) {
  const ext        = path.extname(filePath);
  const folderName = getDestinationFolder(ext);

  // Extension not covered by any rule — skip silently to avoid accidentally
  // relocating installers, ZIPs, or other files the user wants to keep in Downloads.
  if (!folderName) return;

  const destDir  = path.join(HOME_DIR, folderName);
  const fileName = path.basename(filePath);
  const destPath = path.join(destDir, fileName);

  // recursive: true makes mkdirSync idempotent — safe to call even if the
  // shell folder already exists (which it almost always will on Windows 11).
  fs.mkdirSync(destDir, { recursive: true });

  // fs.rename is atomic on the same NTFS volume; Downloads → shell folders are
  // always on the same drive on a standard Windows 11 layout, so no copy+delete.
  fs.rename(filePath, destPath, (err) => {
    if (err) {
      console.error(`[ERROR] Could not move "${fileName}" → ${folderName}:`, err.message);
      return;
    }
    console.log(`[MOVED]  ${fileName}  →  ${folderName}`);
  });
}

function main() {
  // Fail fast with a clear message if Downloads doesn't exist rather than
  // letting chokidar silently watch a non-existent path.
  if (!fs.existsSync(WATCH_DIR)) {
    console.error(`[ERROR] Watch directory not found: ${WATCH_DIR}`);
    process.exit(1);
  }

  console.log(`[WATCHING] ${WATCH_DIR}`);
  console.log('[RULES]');
  for (const [ext, folder] of Object.entries(EXTENSION_MAP)) {
    console.log(`  ${ext}  →  ${folder}`);
  }

  const watcher = chokidar.watch(WATCH_DIR, {
    // Ignore hidden/system files (dotfiles) — Windows temp download files
    // like .crdownload would otherwise trigger premature moves.
    ignored: /(^|[/\\])\../,
    persistent:    true,
    // ignoreInitial: false so files already in Downloads when the process
    // starts are organized immediately — useful on first run.
    ignoreInitial: false,
    // awaitWriteFinish prevents acting on a file that is still being written
    // (e.g. an active browser download). stabilityThreshold waits for the
    // file size to stop changing for 2 s before emitting 'add'.
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval:        100,
    },
    // depth 0 = flat watch of Downloads only; sub-folders are intentionally
    // excluded to avoid reorganizing content the user has manually sorted.
    depth: 0,
  });

  watcher
    .on('add',   (filePath) => moveFile(filePath))
    .on('error', (error)    => console.error('[WATCHER ERROR]', error));
}

main();