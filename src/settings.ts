import { App, PluginSettingTab, Setting } from 'obsidian';
import type FileDescriberPlugin from './main';

export interface FileDescriberSettings {
    targetFolder: string;
    notesSubfolder: string;
    fileTypes: string;
    dateFormat: string;
    timeFormat: string;
}

export const DEFAULT_SETTINGS: FileDescriberSettings = {
    targetFolder: 'Файлы хранения',
    notesSubfolder: '_заметки',
    fileTypes: 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,json,xml,zip,rar,7z,png,jpg,jpeg,gif,svg,mp3,mp4',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '',
};

export class FileDescriberSettingTab extends PluginSettingTab {
    plugin: FileDescriberPlugin;

    constructor(app: App, plugin: FileDescriberPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'File Describer Settings' });

        new Setting(containerEl)
            .setName('Target folder')
            .setDesc('Folder to watch for new files')
            .addText(text => text
                .setPlaceholder('Файлы хранения')
                .setValue(this.plugin.settings.targetFolder)
                .onChange(async (value) => {
                    this.plugin.settings.targetFolder = value;
                    await this.plugin.saveSettings();
                    this.plugin.scanAndUpdateBadge();
                }));

        new Setting(containerEl)
            .setName('Notes subfolder')
            .setDesc('Subfolder inside target folder for description notes (empty = same folder)')
            .addText(text => text
                .setPlaceholder('_заметки')
                .setValue(this.plugin.settings.notesSubfolder)
                .onChange(async (value) => {
                    this.plugin.settings.notesSubfolder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('File types to track')
            .setDesc('Comma-separated list of file extensions (without dots)')
            .addText(text => text
                .setPlaceholder('pdf,docx,txt')
                .setValue(this.plugin.settings.fileTypes)
                .onChange(async (value) => {
                    this.plugin.settings.fileTypes = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Date format')
            .setDesc('Moment.js pattern for Status date (e.g. YYYY-MM-DD, DD.MM.YYYY)')
            .addText(text => text
                .setPlaceholder('YYYY-MM-DD')
                .setValue(this.plugin.settings.dateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value || 'YYYY-MM-DD';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Time format')
            .setDesc('Moment.js pattern for Status time (e.g. HH:mm). Leave empty to omit time.')
            .addText(text => text
                .setPlaceholder('(empty)')
                .setValue(this.plugin.settings.timeFormat)
                .onChange(async (value) => {
                    this.plugin.settings.timeFormat = value;
                    await this.plugin.saveSettings();
                }));
    }
}
