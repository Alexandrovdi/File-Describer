import { App, TFile, normalizePath } from 'obsidian';

export interface FileMetadata {
    filename: string;
    filetype: string;
    date_added: string;
    tags: string[];
    description: string;
}

export class NoteCreator {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    getNoteFolderPath(targetFolder: string, notesSubfolder: string): string {
        if (notesSubfolder) {
            return normalizePath(`${targetFolder}/${notesSubfolder}`);
        }
        return normalizePath(targetFolder);
    }

    async ensureFolder(folderPath: string): Promise<void> {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder) {
            await this.app.vault.createFolder(folderPath);
        }
    }

    getNoteName(fileName: string): string {
        const dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            return fileName.substring(0, dotIndex);
        }
        return fileName;
    }

    async noteExists(targetFolder: string, notesSubfolder: string, fileName: string): Promise<boolean> {
        const noteFolder = this.getNoteFolderPath(targetFolder, notesSubfolder);
        const noteName = this.getNoteName(fileName);
        const notePath = normalizePath(`${noteFolder}/${noteName}.md`);
        const exists = this.app.vault.getAbstractFileByPath(notePath);
        return !!exists;
    }

    async createNote(targetFolder: string, notesSubfolder: string, file: TFile, metadata: FileMetadata): Promise<void> {
        const noteFolder = this.getNoteFolderPath(targetFolder, notesSubfolder);
        await this.ensureFolder(noteFolder);

        const noteName = this.getNoteName(file.name);
        const notePath = normalizePath(`${noteFolder}/${noteName}.md`);

        const tagsStr = metadata.tags.length > 0
            ? `  - ${metadata.tags.join('\n  - ')}`
            : '';

        const descEscaped = metadata.description.replace(/"/g, '\\"');

        const fileRelPath = file.path.startsWith(targetFolder + '/')
            ? file.path.slice(targetFolder.length + 1)
            : file.name;

        const content = [
            '---',
            `filename: ${metadata.filename}`,
            `filetype: ${metadata.filetype}`,
            `date_added: ${metadata.date_added}`,
            'tags:',
            tagsStr,
            `File Description: "${descEscaped}"`,
            `File: "[[${fileRelPath}]]"`,
            '---',
        ].join('\n');

        await this.app.vault.create(notePath, content);
    }
}
