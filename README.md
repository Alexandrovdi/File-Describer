<p align="center">
  <a href="README.md">English</a> |
  <a href="README.ru.md">Русский</a>
</p>

# File Describer

An Obsidian plugin that automatically creates and manages description notes for files in a watched folder. Perfect for organizing file archives with searchable descriptions, tracking file changes, and managing file metadata.

## Features

- **Auto-creation** — when you drop a file into the target folder, a companion `.md` note is automatically created
- **Tabbed review modal** — two tabs: «Новые файлы» (new files) and «Удалённые файлы» (deleted files)
- **Delete tracking** — when a file is deleted, its companion note gets an automatic status update
- **Rename detection** — companion note's `File` field follows the renamed file
- **Orphaned note handling** — for deleted files, you can keep the note (mark as reviewed) or delete it
- **Badge indicator** — a red `!` badge on the ribbon icon when pending items exist
- **Recursive scanning** — watches subfolders recursively

## How it works

1. Place a file in the configured target folder (default: `Файлы хранения/`)
2. The plugin creates a companion `.md` note in `_заметки/` with frontmatter containing `File Description`, `File` (wikilink), `date_added`, `filetype`, and `filename`
3. Click the ribbon icon (or run command) to open the review modal
4. In the «Новые файлы» tab, add descriptions and click "✓" to save
5. When a file is deleted, the note automatically gets `Status: "файл <name> - удален <date>"` — review in the «Удалённые файлы» tab

## Installation

### From Obsidian Community Browser

Search for "File Describer" in Settings → Community plugins → Browse.

### Via BRAT

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Add `https://github.com/Alexandrovdi/File-Describer` to the list of beta plugins
3. Click "Add Plugin"

### Manual

1. Download the latest release from [GitHub Releases](https://github.com/Alexandrovdi/File-Describer/releases)
2. Extract `main.js`, `manifest.json`, and `styles.css` to `VaultFolder/.obsidian/plugins/file-describer/`
3. Enable the plugin in Settings → Community plugins

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Target folder | Folder to watch for files | `Файлы хранения/` |
| Notes subfolder | Subfolder for companion notes | `_заметки/` |
| Date format | Moment.js format for dates | `YYYY-MM-DD` |
| Time format | Moment.js format for time | `HH:mm` |

## Development

```bash
git clone https://github.com/Alexandrovdi/File-Describer.git
cd File-Describer
npm install
npm run build    # builds main.js
npm run dev      # watch mode
```

## License

MIT
