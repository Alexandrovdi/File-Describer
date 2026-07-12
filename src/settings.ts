import { App, PluginSettingTab, Setting } from 'obsidian';
import type FileDescriberPlugin from './main';
import { t } from './i18n';

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

        const targetSetting = new Setting(containerEl)
            .setName(t('settings.target-folder'))
            .setDesc(t('settings.target-folder-desc'))
            .addText(text => text
                .setPlaceholder(t('settings.placeholder.target-folder'))
                .setValue(this.plugin.settings.targetFolder)
                .onChange(async (value) => {
                    this.plugin.settings.targetFolder = value;
                    await this.plugin.saveSettings();
                    void this.plugin.scanAndUpdateBadge();
                }));
        targetSetting.descEl.createEl('div', {
            text: t('settings.target-folder-extra'),
        });
        new Setting(containerEl)
            .setName(t('settings.notes-subfolder'))
            .setDesc(t('settings.notes-subfolder-desc'))
            .addText(text => text
                .setPlaceholder(t('settings.placeholder.notes-subfolder'))
                .setValue(this.plugin.settings.notesSubfolder)
                .onChange(async (value) => {
                    this.plugin.settings.notesSubfolder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('settings.file-types'))
            .setDesc(t('settings.file-types-desc'))
            .addText(text => text
                .setPlaceholder(t('settings.placeholder.file-types'))
                .setValue(this.plugin.settings.fileTypes)
                .onChange(async (value) => {
                    this.plugin.settings.fileTypes = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('settings.date-format'))
            .setDesc(t('settings.date-format-desc'))
            .addText(text => text
                .setPlaceholder(t('settings.placeholder.date-format'))
                .setValue(this.plugin.settings.dateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value || 'YYYY-MM-DD';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('settings.time-format'))
            .setDesc(t('settings.time-format-desc'))
            .addText(text => text
                .setPlaceholder(t('settings.placeholder.time-format'))
                .setValue(this.plugin.settings.timeFormat)
                .onChange(async (value) => {
                    this.plugin.settings.timeFormat = value;
                    await this.plugin.saveSettings();
                }));
    }
}
