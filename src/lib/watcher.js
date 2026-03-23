import chokidar from 'chokidar';
import { WATCH_DIR } from '../config/extensions.js';
import { moveFile }  from './mover.js';

// Encapsulates all chokidar configuration so tuning watch behaviour (depth,
// stabilityThreshold, ignored patterns) never requires touching app.js or mover.js.
export function startWatcher() {
  const watcher = chokidar.watch(WATCH_DIR, {
    // Ignore hidden/system files (dotfiles) — Windows temp download files
    // like .crdownload would otherwise trigger premature moves.
    ignored: /(^|[/\\])\../,
    persistent:    true,
    // ignoreInitial: false so files already in Downloads when the process
    // starts are organised immediately — useful on first run.
    ignoreInitial: false,
    // awaitWriteFinish prevents acting on a file still being written
    // (e.g. an active browser download). stabilityThreshold waits for the
    // file size to stop changing for 2 s before emitting 'add'.
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval:        100,
    },
    // depth 0 = flat watch of Downloads only; sub-folders intentionally
    // excluded to avoid reorganising content the user has manually sorted.
    depth: 0,
  });

  watcher
    .on('add',   (filePath) => moveFile(filePath))
    .on('error', (error)    => console.error('[WATCHER ERROR]', error));

  return watcher;
}