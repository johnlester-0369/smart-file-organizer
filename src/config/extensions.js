import path from 'node:path';
import os   from 'node:os';

// Map file extensions to Windows 11 shell folder names under %USERPROFILE%.
// os.homedir() resolves to C:\Users\<username> on Windows, matching the exact
// paths that Explorer exposes (Documents, Pictures, Music, Videos).
// Centralised here so adding a new extension or folder requires touching only
// this file — the mover, watcher, and app modules stay unchanged.
export const EXTENSION_MAP = {
  // Documents — all common productivity, text, and e-reader formats that
  // Windows 11 natively associates with the Documents shell folder.
  '.pdf':  'Documents',
  '.doc':  'Documents',
  '.docx': 'Documents',
  '.xls':  'Documents',
  '.xlsx': 'Documents',
  '.ppt':  'Documents',
  '.pptx': 'Documents',
  '.txt':  'Documents',
  '.rtf':  'Documents',
  '.odt':  'Documents',
  '.ods':  'Documents',
  '.odp':  'Documents',
  '.csv':  'Documents',
  '.md':   'Documents',
  '.epub': 'Documents',

  // Pictures — raster, vector, camera-raw, and Apple mobile formats.
  // Camera raws (.cr2 Canon, .nef Nikon, .arw Sony) grouped here so
  // photo-editing apps that index the Pictures folder pick them up automatically.
  '.jpg':  'Pictures',
  '.jpeg': 'Pictures',
  '.png':  'Pictures',
  '.gif':  'Pictures',
  '.bmp':  'Pictures',
  '.webp': 'Pictures',
  '.svg':  'Pictures',
  '.tiff': 'Pictures',
  '.tif':  'Pictures',
  '.ico':  'Pictures',
  '.heic': 'Pictures',
  '.heif': 'Pictures',
  '.raw':  'Pictures',
  '.cr2':  'Pictures',
  '.nef':  'Pictures',
  '.arw':  'Pictures',

  // Music — covers every common lossy, lossless, and container format so that
  // Windows Media Player and Groove Music (which index the Music shell folder)
  // detect new files without the user manually pointing them at Downloads.
  '.mp3':  'Music',
  '.wav':  'Music',
  '.flac': 'Music',
  '.aac':  'Music',
  '.ogg':  'Music',
  '.wma':  'Music',
  '.m4a':  'Music',
  '.aiff': 'Music',
  '.opus': 'Music',

  // Videos — streaming containers, editing formats, and device-native formats.
  // .3gp retained for mobile-recorded clips; .flv for legacy web downloads.
  '.mp4':  'Videos',
  '.avi':  'Videos',
  '.mkv':  'Videos',
  '.mov':  'Videos',
  '.wmv':  'Videos',
  '.flv':  'Videos',
  '.webm': 'Videos',
  '.m4v':  'Videos',
  '.mpg':  'Videos',
  '.mpeg': 'Videos',
  '.3gp':  'Videos',
};

export const HOME_DIR = os.homedir();

// Downloads is the default browser/app drop zone on Windows 11 — watching it
// means files are sorted the moment a download completes, with no user action.
export const WATCH_DIR = path.join(HOME_DIR, 'Downloads');