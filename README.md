# Smart File Organizer

> Your Downloads folder, sorted automatically — the moment each file lands.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js ≥ 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![chokidar](https://img.shields.io/badge/chokidar-v5-orange)](https://github.com/paulmillr/chokidar)

---

## The Problem

Every file you download lands in one folder. After a week, that folder looks like this:

```
Downloads/
├── Q3_Report_FINAL_v3.pdf
├── IMG_20241103_084512.jpg
├── invoice_nov_2024.pdf
├── vacation_clip.mp4
├── my_song_mix.flac
└── photo_edit_raw.cr2
```

You sort it manually. Then it fills up again.

**Smart File Organizer runs silently in the background and sorts every file the instant a download completes** — no manual action, no configuration, no GUI.

---

## Quick Start

Get from clone to running in under 60 seconds:

```bash
git clone https://github.com/johnlester-0369/smart-file-organizer.git
cd smart-file-organizer
npm install
npm start
```

**Expected output:**

```
[WATCHING] C:\Users\John\Downloads
[RULES]
  .pdf  →  Documents
  .jpg  →  Pictures
  .mp3  →  Music
  .mp4  →  Videos
  ... (full rule table)
```

Drop any supported file into Downloads. It moves itself.

```
[MOVED]  report.pdf  →  Documents
[MOVED]  photo.heic  →  Pictures
```

Leave the process running in the background. That's it.

---

## How It Works

```
Downloads/
├── report.pdf    →  C:\Users\<you>\Documents\report.pdf
├── photo.heic    →  C:\Users\<you>\Pictures\photo.heic
├── album.flac    →  C:\Users\<you>\Music\album.flac
└── clip.mp4      →  C:\Users\<you>\Videos\clip.mp4
```

Three components, each with a single responsibility:

**1. Watcher** (`src/lib/watcher.js`)
Uses [chokidar](https://github.com/paulmillr/chokidar) to monitor `%USERPROFILE%\Downloads` at depth 0 — flat watch only, so sub-folders you've manually organised are never touched. A 2-second stability threshold means active browser downloads (`.crdownload`, partial writes) are never moved mid-file.

**2. Mover** (`src/lib/mover.js`)
Looks up the file extension in `EXTENSION_MAP`, resolves the destination path via `os.homedir()`, and calls `fs.rename` — an atomic same-volume move on NTFS. No copy+delete, no data risk.

**3. Extension rules** (`src/config/extensions.js`)
The single source of truth for all routing decisions. Adding a new extension requires changing exactly one file and zero lines elsewhere.

---

## Requirements

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 (native ESM + chokidar v5) |
| OS | Windows 11 (shell folder paths are Windows-specific) |

> **macOS / Linux:** `os.homedir()` resolves correctly on all platforms, but the destination folder names (`Documents`, `Pictures`, `Music`, `Videos`) match Windows 11 shell folder conventions.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/johnlester-0369/smart-file-organizer.git
cd smart-file-organizer

# Install the single runtime dependency (chokidar)
npm install
```

---

## Usage

```bash
npm start
```

The process will:

1. Verify `%USERPROFILE%\Downloads` exists — exits with a clear error if the path is not found.
2. Print the active watch directory and the full extension → folder rule table.
3. Begin watching. Every new file dropped into Downloads is sorted automatically.

Files with extensions not in `EXTENSION_MAP` are left untouched in Downloads — installers, `.zip` archives, and unknown types are never moved.

---

## Supported Extensions

### Documents
`.pdf` `.doc` `.docx` `.xls` `.xlsx` `.ppt` `.pptx` `.txt` `.rtf` `.odt` `.ods` `.odp` `.csv` `.md` `.epub`

### Pictures
`.jpg` `.jpeg` `.png` `.gif` `.bmp` `.webp` `.svg` `.tiff` `.tif` `.ico` `.heic` `.heif` `.raw` `.cr2` `.nef` `.arw`

### Music
`.mp3` `.wav` `.flac` `.aac` `.ogg` `.wma` `.m4a` `.aiff` `.opus`

### Videos
`.mp4` `.avi` `.mkv` `.mov` `.wmv` `.flv` `.webm` `.m4v` `.mpg` `.mpeg` `.3gp`

---

## Configuration — Adding or Changing Rules

Open `src/config/extensions.js` and add one line to the relevant section:

```js
'.xyz': 'Documents',   // or Pictures / Music / Videos
```

No other files need to change. The watcher and mover read from `EXTENSION_MAP` at runtime — the ruleset is hot-swappable by restarting the process.

**To add a new destination folder** (e.g. `Archives`):

```js
// In EXTENSION_MAP:
'.zip': 'Archives',
'.7z':  'Archives',
'.tar': 'Archives',
```

The mover uses `fs.mkdirSync(destDir, { recursive: true })` — the destination folder is created automatically on first use if it doesn't exist.

---

## Project Structure

```
smart-file-organizer/
├── src/
│   ├── app.js                  # Entry point — startup guard, logging, watcher bootstrap
│   ├── config/
│   │   └── extensions.js       # EXTENSION_MAP, HOME_DIR, WATCH_DIR — single source of truth
│   └── lib/
│       ├── mover.js            # Extension lookup + atomic fs.rename move
│       └── watcher.js          # Chokidar config, depth/stabilisation settings, event wiring
└── package.json
```

---

## License

[ISC](https://opensource.org/licenses/ISC) — free to use, modify, and distribute.