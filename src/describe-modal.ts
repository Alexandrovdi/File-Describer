import { App, Modal, Setting, TFile } from 'obsidian';
import { NoteCreator, FileMetadata } from './note-creator';
import { t, tpl } from './i18n';

export class DescribeModal extends Modal {
    private file: TFile;
    private noteCreator: NoteCreator;
    private targetFolder: string;
    private notesSubfolder: string;
    private description = '';
    private tags = '';
    private onSubmit: () => void;

    constructor(
        app: App,
        file: TFile,
        noteCreator: NoteCreator,
        targetFolder: string,
        notesSubfolder: string,
        onSubmit: () => void,
    ) {
        super(app);
        this.file = file;
        this.noteCreator = noteCreator;
        this.targetFolder = targetFolder;
        this.notesSubfolder = notesSubfolder;
        this.onSubmit = onSubmit;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: tpl('describe.title', { fileName: this.file.name }) });

        new Setting(contentEl)
            .setName(t('describe.file'))
            .setDesc(this.file.path)
            .addButton(btn => btn
                .setButtonText(t('describe.open-explorer'))
                .onClick(() => {
                    (this.app as unknown as { showInFolder: (path: string) => void }).showInFolder(this.file.path);
                }));

        new Setting(contentEl)
            .setName(t('describe.description'))
            .setDesc(t('describe.description-desc'))
            .addTextArea(text => {
                text.setPlaceholder(t('describe.description-placeholder'))
                    .setValue(this.description)
                    .onChange(value => { this.description = value; });
                text.inputEl.addClass('fd-full-width');
                return text;
            });

        new Setting(contentEl)
            .setName(t('describe.tags'))
            .setDesc(t('describe.tags-desc'))
            .addText(text => text
                .setPlaceholder(t('describe.tags-placeholder'))
                .setValue(this.tags)
                .onChange(value => { this.tags = value; }));

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText(t('describe.create-note'))
                .setCta()
                .onClick(async () => {
                    if (!this.description.trim()) {
                        return;
                    }
                    const tagsArray = this.tags
                        .split(',')
                        .map(t => t.trim())
                        .filter(t => t.length > 0);

                    const dateStr = new Date().toISOString().split('T')[0] ?? '';

                    const metadata: FileMetadata = {
                        filename: this.file.name,
                        filetype: this.file.extension,
                        date_added: dateStr,
                        tags: tagsArray,
                        description: this.description.trim(),
                    };

                    await this.noteCreator.createNote(
                        this.targetFolder,
                        this.notesSubfolder,
                        this.file,
                        metadata,
                    );

                    this.close();
                    this.onSubmit();
                }))
            .addButton(btn => btn
                .setButtonText(t('describe.skip'))
                .onClick(() => {
                    this.close();
                }));

        const textarea = contentEl.querySelector('textarea');
        if (textarea) {
            textarea.focus();
        }
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

export interface UndescribedFile {
    file: TFile;
    type: 'new' | 'orphaned';
    missingFileName?: string;
    existingDescription?: string;
    existingTags?: string;
    reason: string;
}

interface TableRow {
    file: TFile;
    type: 'new' | 'orphaned';
    missingFileName?: string;
    description: string;
    tags: string;
    skipped: boolean;
    markedForDelete: boolean;
    descEl: HTMLTextAreaElement;
    tagsEl: HTMLInputElement;
    rowEl: HTMLDivElement;
}

export class UndescribedFilesModal extends Modal {
    private files: UndescribedFile[];
    private noteCreator: NoteCreator;
    private targetFolder: string;
    private notesSubfolder: string;
    private dateFormat: string;
    private timeFormat: string;
    private onCloseCallback: () => void;
    private rows: TableRow[] = [];

    constructor(
        app: App,
        files: UndescribedFile[],
        noteCreator: NoteCreator,
        targetFolder: string,
        notesSubfolder: string,
        dateFormat: string,
        timeFormat: string,
        onCloseCallback?: () => void,
    ) {
        super(app);
        this.files = files;
        this.noteCreator = noteCreator;
        this.targetFolder = targetFolder;
        this.notesSubfolder = notesSubfolder;
        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;
        this.onCloseCallback = onCloseCallback || (() => {});
        this.titleEl.setText(t('undescribed.title'));
        this.modalEl.addClass('fd-modal-size');
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        const newFiles = this.files.filter(f => f.type === 'new');
        const orphanedFiles = this.files.filter(f => f.type === 'orphaned');

        if (this.files.length === 0) {
            contentEl.createEl('p', { text: t('undescribed.empty') });
            return;
        }

        const tabBar = contentEl.createEl('div', { cls: 'fd-tabs' });

        const newTab = tabBar.createEl('button', { cls: 'fd-tab', text: tpl('undescribed.tab-new', { count: newFiles.length }) });
        newTab.dataset.tab = 'new';

        const deletedTab = tabBar.createEl('button', { cls: 'fd-tab', text: tpl('undescribed.tab-deleted', { count: orphanedFiles.length }) });
        deletedTab.dataset.tab = 'deleted';

        const newPanel = contentEl.createEl('div', { cls: 'fd-tab-content' });
        newPanel.dataset.tab = 'new';

        if (newFiles.length > 0) {
            this.buildTable(newPanel, newFiles, 'new');
        } else {
            newPanel.createEl('p', { text: t('undescribed.empty-new'), cls: 'fd-empty' });
        }

        const deletedPanel = contentEl.createEl('div', { cls: 'fd-tab-content' });
        deletedPanel.dataset.tab = 'deleted';

        if (orphanedFiles.length > 0) {
            this.buildTable(deletedPanel, orphanedFiles, 'orphaned');
        } else {
            deletedPanel.createEl('p', { text: t('undescribed.empty-deleted'), cls: 'fd-empty' });
        }

        const switchTab = (tabId: string) => {
            tabBar.querySelectorAll('.fd-tab').forEach(t => t.classList.remove('fd-tab-active'));
            const activeTab = tabBar.querySelector(`.fd-tab[data-tab="${tabId}"]`);
            if (activeTab) activeTab.classList.add('fd-tab-active');
            contentEl.querySelectorAll('.fd-tab-content').forEach(p => p.classList.remove('fd-tab-content-active'));
            const panel = contentEl.querySelector(`.fd-tab-content[data-tab="${tabId}"]`);
            if (panel) panel.classList.add('fd-tab-content-active');
        };

        newTab.onclick = () => switchTab('new');
        deletedTab.onclick = () => switchTab('deleted');

        if (newFiles.length > 0) {
            switchTab('new');
        } else {
            switchTab('deleted');
        }

        const footerEl = contentEl.createEl('div', { cls: 'fd-footer' });

        const saveBtn = footerEl.createEl('button', { text: t('undescribed.save'), cls: 'mod-cta' });
        saveBtn.addClass('fd-save-btn-mr');
        saveBtn.onclick = async () => {
            saveBtn.disabled = true;
            saveBtn.textContent = t('undescribed.saving');
            await this.saveAll();
            this.close();
        };

        const laterBtn = footerEl.createEl('button', { text: t('undescribed.fill-later') });
        laterBtn.onclick = () => {
            this.close();
        };
    }

    private buildTable(container: HTMLElement, items: UndescribedFile[], type: 'new' | 'orphaned'): void {
        const tableEl = container.createEl('div', { cls: 'fd-table' });

        const header = tableEl.createEl('div', { cls: 'fd-header' });
        header.createEl('div', { cls: 'fd-col-name', text: t('undescribed.col-file') });
        header.createEl('div', { cls: 'fd-col-desc', text: t('undescribed.col-description') });
        header.createEl('div', { cls: 'fd-col-tags', text: t('undescribed.col-tags') });
        header.createEl('div', { cls: 'fd-col-action', text: '' });

        for (let i = 0; i < items.length; i++) {
            const item = items[i]!;
            const rowEl = tableEl.createEl('div', { cls: 'fd-row' });

            const nameEl = rowEl.createEl('div', { cls: 'fd-col-name' });

            if (type === 'orphaned') {
                nameEl.createEl('span', { text: item.missingFileName || '' });
                nameEl.createEl('br');
                nameEl.createEl('span', { text: t('undescribed.file-deleted'), cls: 'fd-warning' });
            } else {
                nameEl.createEl('span', { text: item.file.name });
                nameEl.createEl('br');
                const relPath = item.file.parent?.path === this.targetFolder
                    ? ''
                    : item.file.parent?.path.replace(this.targetFolder + '/', '') || '';
                if (relPath) {
                    nameEl.createEl('small', { text: relPath });
                }
            }

            const descEl = rowEl.createEl('div', { cls: 'fd-col-desc' });
            const textarea = descEl.createEl('textarea', {
                attr: { placeholder: t('undescribed.placeholder-desc') },
                cls: 'fd-full-width fd-textarea-min',
            });
            if (item.existingDescription) {
                textarea.value = item.existingDescription;
            }

            const tagsEl = rowEl.createEl('div', { cls: 'fd-col-tags' });
            const tagInput = tagsEl.createEl('input', {
                attr: { type: 'text', placeholder: t('undescribed.placeholder-tags') },
                cls: 'fd-full-width',
            });
            if (item.existingTags) {
                tagInput.value = item.existingTags;
            }

            const actionEl = rowEl.createEl('div', { cls: 'fd-col-action' });

            if (type === 'orphaned') {
                const radioName = `orphan-${i}`;

                actionEl.createEl('div', { text: t('undescribed.orphan-label'), cls: 'fd-action-label' });

                const keepRadio = actionEl.createEl('input', { attr: { type: 'radio', name: radioName } });
                keepRadio.checked = true;
                actionEl.createEl('label', { text: t('undescribed.orphan-keep') });
                actionEl.createEl('br');

                const delRadio = actionEl.createEl('input', { attr: { type: 'radio', name: radioName } });
                actionEl.createEl('label', { text: t('undescribed.orphan-delete') });

                const rowState: TableRow = {
                    file: item.file,
                    type: 'orphaned',
                    missingFileName: item.missingFileName,
                    description: item.existingDescription || '',
                    tags: item.existingTags || '',
                    skipped: false,
                    markedForDelete: false,
                    descEl: textarea,
                    tagsEl: tagInput,
                    rowEl: rowEl,
                };

                keepRadio.onchange = () => {
                    if (keepRadio.checked) {
                        rowState.markedForDelete = false;
                        rowEl.removeClass('fd-row-dimmed');
                    }
                };

                delRadio.onchange = () => {
                    if (delRadio.checked) {
                        rowState.markedForDelete = true;
                        rowEl.addClass('fd-row-dimmed');
                    }
                };

                this.rows.push(rowState);
            } else {
                const skipBtn = actionEl.createEl('button', { text: t('undescribed.skip-btn'), cls: 'fd-btn-wide' });

                const rowState: TableRow = {
                    file: item.file,
                    type: 'new',
                    description: '',
                    tags: '',
                    skipped: false,
                    markedForDelete: false,
                    descEl: textarea,
                    tagsEl: tagInput,
                    rowEl: rowEl,
                };

                skipBtn.onclick = () => {
                    rowState.skipped = !rowState.skipped;
                    skipBtn.textContent = rowState.skipped ? t('undescribed.skipped-btn') : t('undescribed.skip-btn');
                    skipBtn.className = rowState.skipped ? 'fd-skipped-btn' : '';
                    if (rowState.skipped) {
                        rowEl.addClass('fd-row-dimmed');
                    } else {
                        rowEl.removeClass('fd-row-dimmed');
                    }
                };

                this.rows.push(rowState);
            }
        }
    }

    async saveAll(): Promise<void> {
        const dateStr = new Date().toISOString().split('T')[0] ?? '';

        for (const row of this.rows) {
            if (row.type === 'orphaned') {
                if (row.markedForDelete) {
                    await this.app.fileManager.trashFile(row.file);
                } else {
                    await this.app.fileManager.processFrontMatter(row.file, (fm) => {
                        const f = fm as Record<string, unknown>;
                        f['Reviewed'] = true;
                    });
                }
            } else {
                if (row.skipped) continue;

                const desc = row.descEl.value.trim();
                if (!desc) continue;

                const tagsArray = row.tagsEl.value
                    .split(',')
                    .map(t => t.trim())
                    .filter(t => t.length > 0);

                const metadata: FileMetadata = {
                    filename: row.file.name,
                    filetype: row.file.extension,
                    date_added: dateStr,
                    tags: tagsArray,
                    description: desc,
                };

                await this.noteCreator.createNote(
                    this.targetFolder,
                    this.notesSubfolder,
                    row.file,
                    metadata,
                );
            }
        }
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
        this.rows = [];
        this.onCloseCallback();
    }
}
