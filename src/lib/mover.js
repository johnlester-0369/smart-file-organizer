import fs   from 'node:fs';
import path from 'node:path';
import { EXTENSION_MAP, HOME_DIR } from '../config/extensions.js';

// Returns the destination shell-folder name for a given extension,
// or null when the extension is not in the ruleset (file left untouched).
export function getDestinationFolder(ext) {
  return EXTENSION_MAP[ext.toLowerCase()] ?? null;
}

export function moveFile(filePath) {
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