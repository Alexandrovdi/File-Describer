const en = {
  // Settings
  'settings.target-folder': 'Target folder',
  'settings.target-folder-desc': 'Folder to watch for new files',
  'settings.target-folder-extra': 'Plugin reacts to any files added to the target folder except md',
  'settings.notes-subfolder': 'Notes subfolder',
  'settings.notes-subfolder-desc': 'Subfolder inside target folder for description notes (empty = same folder)',
  'settings.file-types': 'File types to track',
  'settings.file-types-desc': 'Comma-separated list of file extensions (without dots)',
  'settings.date-format': 'Date format',
  'settings.date-format-desc': 'Moment.js pattern for Status date (e.g. YYYY-MM-DD, DD.MM.YYYY)',
  'settings.time-format': 'Time format',
  'settings.time-format-desc': 'Moment.js pattern for Status time (e.g. HH:mm). Leave empty to omit time.',
  'settings.placeholder.target-folder': 'Files storage',
  'settings.placeholder.notes-subfolder': '_notes',
  'settings.placeholder.file-types': 'pdf,docx,txt',
  'settings.placeholder.date-format': 'YYYY-MM-DD',
  'settings.placeholder.time-format': '(empty)',

  // Commands
  'command.show-undescribed': 'Show undescribed files',

  // Ribbon
  'ribbon.tooltip': 'File Describer',

  // Describe modal
  'describe.title': 'Describe: {fileName}',
  'describe.file': 'File',
  'describe.open-explorer': 'Open in system explorer',
  'describe.description': 'Description',
  'describe.description-desc': 'What is this file about?',
  'describe.description-placeholder': 'Quarterly financial report for Q2 2026...',
  'describe.tags': 'Tags',
  'describe.tags-desc': 'Comma-separated tags (e.g. report, finance, contract)',
  'describe.tags-placeholder': 'report, finance, contract',
  'describe.create-note': 'Create note',
  'describe.skip': 'Skip',

  // Undescribed files modal
  'undescribed.title': 'File Describer',
  'undescribed.empty': 'No pending files.',
  'undescribed.tab-new': 'New files ({count})',
  'undescribed.tab-deleted': 'Deleted files ({count})',
  'undescribed.empty-new': 'No new files. All files have descriptions.',
  'undescribed.empty-deleted': 'No deleted files awaiting review.',
  'undescribed.save': 'Save',
  'undescribed.saving': 'Saving...',
  'undescribed.fill-later': 'Fill later',
  'undescribed.col-file': 'File',
  'undescribed.col-description': 'Description',
  'undescribed.col-tags': 'Tags',
  'undescribed.placeholder-desc': 'Enter description...',
  'undescribed.placeholder-tags': 'tag1, tag2, ...',
  'undescribed.file-deleted': '? File deleted!',
  'undescribed.orphan-label': 'Keep or delete description note?',
  'undescribed.orphan-keep': 'Keep',
  'undescribed.orphan-delete': 'Delete',
  'undescribed.skip-btn': 'Skip',
  'undescribed.skipped-btn': 'Skipped',

  // Scan reasons
  'reason.no-description': 'No description note',
  'reason.file-deleted': 'Original file deleted',

  // Notices
  'notice.link-updated': 'File link updated for {path}',
  'notice.all-described': 'All files have descriptions',

  // Status frontmatter
  'status.deleted': 'file {name} - deleted {date}{time}',
} as const;

export default en;
export type TranslationKey = keyof typeof en;
