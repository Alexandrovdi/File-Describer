import type { TranslationKey } from './en';

const ru: Partial<Record<TranslationKey, string>> = {
  // Settings
  'settings.target-folder': 'Target folder',
  'settings.target-folder-desc': 'Folder to watch for new files',
  'settings.target-folder-extra': 'Плагин реагирует на любые файлы добавленные в назначенную папку кроме md',
  'settings.notes-subfolder': 'Notes subfolder',
  'settings.notes-subfolder-desc': 'Subfolder inside target folder for description notes (empty = same folder)',
  'settings.file-types': 'File types to track',
  'settings.file-types-desc': 'Comma-separated list of file extensions (without dots)',
  'settings.date-format': 'Date format',
  'settings.date-format-desc': 'Moment.js pattern for Status date (e.g. YYYY-MM-DD, DD.MM.YYYY)',
  'settings.time-format': 'Time format',
  'settings.time-format-desc': 'Moment.js pattern for Status time (e.g. HH:mm). Leave empty to omit time.',
  'settings.placeholder.target-folder': 'Файлы хранения',
  'settings.placeholder.notes-subfolder': '_заметки',
  'settings.placeholder.file-types': 'pdf,docx,txt',
  'settings.placeholder.date-format': 'YYYY-MM-DD',
  'settings.placeholder.time-format': '(empty)',

  // Commands
  'command.show-undescribed': 'Показать неописанные файлы',

  // Ribbon
  'ribbon.tooltip': 'File Describer',

  // Describe modal
  'describe.title': 'Описание: {fileName}',
  'describe.file': 'Файл',
  'describe.open-explorer': 'Открыть в проводнике',
  'describe.description': 'Описание',
  'describe.description-desc': 'О чём этот файл?',
  'describe.description-placeholder': 'Ежеквартальный финансовый отчёт за Q2 2026...',
  'describe.tags': 'Теги',
  'describe.tags-desc': 'Теги через запятую (например: отчёт, финансы, договор)',
  'describe.tags-placeholder': 'отчёт, финансы, договор',
  'describe.create-note': 'Создать заметку',
  'describe.skip': 'Пропустить',

  // Undescribed files modal
  'undescribed.title': 'File Describer',
  'undescribed.empty': 'Нет ожидающих файлов.',
  'undescribed.tab-new': 'Новые файлы ({count})',
  'undescribed.tab-deleted': 'Удалённые файлы ({count})',
  'undescribed.empty-new': 'Новых файлов нет. Для всех файлов созданы описания.',
  'undescribed.empty-deleted': 'Нет удалённых файлов на проверке.',
  'undescribed.save': 'Сохранить',
  'undescribed.saving': 'Сохранение...',
  'undescribed.fill-later': 'Заполнить позже',
  'undescribed.col-file': 'Файл',
  'undescribed.col-description': 'Описание',
  'undescribed.col-tags': 'Теги',
  'undescribed.placeholder-desc': 'Введите описание...',
  'undescribed.placeholder-tags': 'тег1, тег2, ...',
  'undescribed.file-deleted': '? Файл удалён!',
  'undescribed.orphan-label': 'Оставить или удалить файл описания?',
  'undescribed.orphan-keep': 'Оставить',
  'undescribed.orphan-delete': 'Удалить',
  'undescribed.skip-btn': 'Пропустить',
  'undescribed.skipped-btn': 'Пропущено',

  // Scan reasons
  'reason.no-description': 'Нет заметки описания',
  'reason.file-deleted': 'Исходный файл удалён',

  // Notices
  'notice.link-updated': 'Ссылка на файл обновлена для {path}',
  'notice.all-described': 'Все файлы имеют описания',

  // Status frontmatter
  'status.deleted': 'файл {name} - удален {date}{time}',
};

export default ru;
