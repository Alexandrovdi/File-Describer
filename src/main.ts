import { Plugin, TFile, TFolder, Notice, normalizePath, moment, type App } from 'obsidian';
import { FileDescriberSettings, FileDescriberSettingTab, DEFAULT_SETTINGS } from './settings';
import { NoteCreator } from './note-creator';
import { UndescribedFilesModal, UndescribedFile } from './describe-modal';
import { t, tpl } from './i18n';

function processFrontMatterSafe(noteFile: TFile, app: App, callback: (fm: Record<string, unknown>) => void): Promise<void> {
    return app.fileManager.processFrontMatter(noteFile, callback as (fm: unknown) => void);
}

export default class FileDescriberPlugin extends Plugin {
    settings!: FileDescriberSettings;
    noteCreator!: NoteCreator;
    private badgeEl!: HTMLElement;
    private scanDebounceTimer: number | null = null;
    private isModalOpen = false;

    async onload(): Promise<void> {
        await this.loadSettings();
        this.noteCreator = new NoteCreator(this.app);

        this.addSettingTab(new FileDescriberSettingTab(this.app, this));

        this.addCommand({
            id: 'show-undescribed-files',
            name: t('command.show-undescribed'),
            callback: () => {
                void this.showUndescribedFiles();
            },
        });

        const ribbonIcon = this.addRibbonIcon('file-text', t('ribbon.tooltip'), () => {
            void this.showUndescribedFiles();
        });
        ribbonIcon.addClass('fd-ribbon-relative');
        this.badgeEl = ribbonIcon.createEl('div', { cls: 'ribbon-badge' });
        this.badgeEl.setText('!');
        this.badgeEl.addClass('fd-badge-hidden');

        this.app.workspace.onLayoutReady(async () => {
            const inTarget = (path: string) => path.startsWith(this.settings.targetFolder + '/');

            this.registerEvent(
                this.app.vault.on('create', (abstractFile) => {
                    if (!(abstractFile instanceof TFile)) return;
                    if (abstractFile.extension === 'md') return;
                    if (!inTarget(abstractFile.path)) return;
                    this.triggerScan();
                }),
            );

            this.registerEvent(
                this.app.vault.on('delete', async (abstractFile) => {
                    if (!inTarget(abstractFile.path)) return;
                    if (abstractFile instanceof TFile && abstractFile.extension !== 'md') {
                        await this.markNoteAsDeleted(abstractFile);
                    }
                    this.triggerScan();
                }),
            );

            this.registerEvent(
                this.app.vault.on('rename', (abstractFile, oldPath) => {
                    if (!(abstractFile instanceof TFile)) return;
                    if (abstractFile.extension === 'md') return;
                    if (!inTarget(abstractFile.path) && !inTarget(oldPath)) return;
                    if (inTarget(abstractFile.path) && inTarget(oldPath)) {
                        void this.updateFileLink(abstractFile, oldPath);
                    }
                    this.triggerScan();
                }),
            );

            const undescribed = await this.scanForUndescribed();
            this.updateBadge(undescribed.length);
        });
    }

    triggerScan(): void {
        if (this.scanDebounceTimer !== null) {
            window.clearTimeout(this.scanDebounceTimer);
        }
        this.scanDebounceTimer = window.setTimeout(async () => {
            this.scanDebounceTimer = null;
            const all = await this.scanForUndescribed();
            this.updateBadge(all.length);
        }, 500);
    }

    async markNoteAsDeleted(file: TFile): Promise<void> {
        const noteFile = await this.noteCreator.findNoteFile(
            this.settings.targetFolder, this.settings.notesSubfolder, file,
        );
        if (!(noteFile instanceof TFile)) return;

        const cache = this.app.metadataCache.getFileCache(noteFile);
        if (!cache?.frontmatter) return;
        if (cache.frontmatter['Status']) return;

        const now = (moment as unknown as () => { format: (f: string) => string })();
        const datePart = now.format(this.settings.dateFormat);
        const timePart = this.settings.timeFormat ? ' ' + now.format(this.settings.timeFormat) : '';

        await processFrontMatterSafe(noteFile, this.app, (fm) => {
            fm['Status'] = tpl('status.deleted', { name: file.name, date: datePart, time: timePart });
            fm['File'] = '';
        });
    }

    collectAllFiles(folder: TFolder): TFile[] {
        let result: TFile[] = [];
        for (const child of folder.children) {
            if (child instanceof TFile && child.extension !== 'md') {
                result.push(child);
            } else if (child instanceof TFolder) {
                result = result.concat(this.collectAllFiles(child));
            }
        }
        return result;
    }

    collectAllMdFiles(folder: TFolder): TFile[] {
        let result: TFile[] = [];
        for (const child of folder.children) {
            if (child instanceof TFile && child.extension === 'md') {
                result.push(child);
            } else if (child instanceof TFolder) {
                result = result.concat(this.collectAllMdFiles(child));
            }
        }
        return result;
    }

    async scanForUndescribed(): Promise<UndescribedFile[]> {
        const targetFolder = this.settings.targetFolder;
        const folder = this.app.vault.getAbstractFileByPath(targetFolder);
        if (!folder || !(folder instanceof TFolder)) return [];

        const files = this.collectAllFiles(folder);

        const undescribed: UndescribedFile[] = [];
        for (const file of files) {
            const exists = await this.noteCreator.noteExists(targetFolder, this.settings.notesSubfolder, file);
            if (!exists) {
                undescribed.push({ file, type: 'new', reason: t('reason.no-description') });
            }
        }

        const notesFolderPath = this.noteCreator.getNoteFolderPath(targetFolder, this.settings.notesSubfolder);
        const notesFolder = this.app.vault.getAbstractFileByPath(notesFolderPath);
        if (notesFolder instanceof TFolder) {
            const noteFiles = this.collectAllMdFiles(notesFolder);
            for (const noteFile of noteFiles) {
                const cache = this.app.metadataCache.getFileCache(noteFile);
                const fm = cache?.frontmatter;
                if (!fm) continue;

                const linkedFilename = fm['filename'] as string | undefined;
                if (!linkedFilename) continue;

                const linkedPath = normalizePath(`${targetFolder}/${linkedFilename}`);
                let linkedFile = this.app.vault.getAbstractFileByPath(linkedPath);

                if (!linkedFile) {
                    const found = files.find(f => f.name === linkedFilename);
                    linkedFile = found ?? null;
                }

                if (!linkedFile) {
                    if (fm['Reviewed']) continue;
                    if (!fm['Status']) continue;
                    const tags = Array.isArray(fm['tags'])
                        ? fm['tags'].join(', ')
                        : typeof fm['tags'] === 'string'
                            ? fm['tags']
                            : '';
                    undescribed.push({
                        file: noteFile,
                        type: 'orphaned',
                        missingFileName: linkedFilename,
                        existingDescription: (fm['File Description'] as string) || '',
                        existingTags: tags,
                        reason: t('reason.file-deleted'),
                    });
                } else {
                    if (fm['Status']) {
                        const relPath = linkedFile.path.startsWith(targetFolder + '/')
                            ? linkedFile.path.slice(targetFolder.length + 1)
                            : linkedFile.name;
                        await processFrontMatterSafe(noteFile, this.app, (fm2) => {
                            delete fm2['Status'];
                            delete fm2['Reviewed'];
                            fm2['File'] = `[[${relPath}]]`;
                        });
                    }
                }
            }
        }

        return undescribed;
    }

    async scanAndUpdateBadge(): Promise<void> {
        const undescribed = await this.scanForUndescribed();
        this.updateBadge(undescribed.length);
    }

    updateBadge(count: number): void {
        if (count > 0) {
            this.badgeEl.setText('!');
            this.badgeEl.removeClass('fd-badge-hidden');
            this.badgeEl.addClass('fd-badge-visible');
            this.badgeEl.style.display = 'flex';
        } else {
            this.badgeEl.removeClass('fd-badge-visible');
            this.badgeEl.addClass('fd-badge-hidden');
            this.badgeEl.style.display = 'none';
        }
    }

    async updateFileLink(file: TFile, oldPath: string): Promise<void> {
        const oldFileName = oldPath.split('/').pop() || file.name;
        const noteFolderPath = this.noteCreator.getNoteFolderPath(
            this.settings.targetFolder, this.settings.notesSubfolder,
        );

        const oldKey = this.noteCreator.getNoteKeyFromPath(oldPath, oldFileName, this.settings.targetFolder);
        let notePath = normalizePath(`${noteFolderPath}/${oldKey}.md`);
        let noteFile = this.app.vault.getAbstractFileByPath(notePath);
        if (!(noteFile instanceof TFile)) {
            const simpleName = this.noteCreator.getNoteName(oldFileName);
            if (oldKey !== simpleName) {
                notePath = normalizePath(`${noteFolderPath}/${simpleName}.md`);
                noteFile = this.app.vault.getAbstractFileByPath(notePath);
            }
        }
        if (!(noteFile instanceof TFile)) return;

        const cache = this.app.metadataCache.getFileCache(noteFile);
        if (!cache?.frontmatter) return;
        if (cache.frontmatter['Status']) return;

        const folderPrefix = this.settings.targetFolder.replace(/\/+$/, '') + '/';
        const relPath = file.path.startsWith(folderPrefix)
            ? file.path.slice(folderPrefix.length)
            : file.name;

        const content = await this.app.vault.read(noteFile);
        const newFilename = oldFileName !== file.name ? file.name : null;
        let updated;
        if (newFilename) {
            updated = content
                .replace(/^File:.*$/m, `File: "[[${relPath}]]"`)
                .replace(/^filename:.*$/m, `filename: ${newFilename}`);
        } else {
            updated = content.replace(/^File:.*$/m, `File: "[[${relPath}]]"`);
        }
        await this.app.vault.modify(noteFile, updated);

        const newKey = this.noteCreator.getNoteKey(file, this.settings.targetFolder);
        if (newKey !== oldKey) {
            const newNotePath = normalizePath(`${noteFolderPath}/${newKey}.md`);
            const existingNote = this.app.vault.getAbstractFileByPath(newNotePath);
            if (!existingNote) {
                await this.app.vault.rename(noteFile, newNotePath);
            }
        }

        new Notice(tpl('notice.link-updated', { path: relPath }));
    }

    openUndescribedTable(undescribed: UndescribedFile[]): void {
        if (this.isModalOpen) return;
        this.isModalOpen = true;

        const modal = new UndescribedFilesModal(
            this.app,
            undescribed,
            this.noteCreator,
            this.settings.targetFolder,
            this.settings.notesSubfolder,
            this.settings.dateFormat,
            this.settings.timeFormat,
            () => {
                this.isModalOpen = false;
                window.setTimeout(() => void this.scanAndUpdateBadge(), 100);
            },
        );
        modal.open();
    }

    async showUndescribedFiles(): Promise<void> {
        const all = await this.scanForUndescribed();
        this.updateBadge(all.length);

        if (all.length === 0) {
            new Notice(t('notice.all-described'));
            return;
        }

        this.openUndescribedTable(all);
    }

    async loadSettings(): Promise<void> {
        const data: unknown = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }
}
