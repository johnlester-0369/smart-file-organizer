import fs from 'node:fs';
import { WATCH_DIR, EXTENSION_MAP } from './config/extensions.js';
import { startWatcher } from './lib/watcher.js';

// Orchestration only — no file-system logic lives here.
// Guards, startup logging, and watcher bootstrap are kept together so the
// sequence of side-effects on startup is readable in one place.
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

  startWatcher();
}

main()