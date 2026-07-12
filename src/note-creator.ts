import { App, Notice, TFile, TFolder, normalizePath } from 'obsidian';

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

    getNoteKeyFromPath(filePath: string, fileName: string, targetFolder: string): string {
        const prefix = targetFolder.replace(/\/+$/, '') + '/';
        const relPath = filePath.startsWith(prefix)
            ? filePath.slice(prefix.length)
            : fileName;
        const dotIndex = relPath.lastIndexOf('.');
        const nameWithoutExt = dotIndex > 0 ? relPath.substring(0, dotIndex) : relPath;
        return nameWithoutExt.replace(/\//g, '_');
    }

    getNoteKey(file: TFile, targetFolder: string): string {
        return this.getNoteKeyFromPath(file.path, file.name, targetFolder);
    }

    getNotePath(targetFolder: string, notesSubfolder: string, noteKey: string): string {
        const noteFolder = this.getNoteFolderPath(targetFolder, notesSubfolder);
        return normalizePath(`${noteFolder}/${noteKey}.md`);
    }

    async noteExists(targetFolder: string, notesSubfolder: string, file: TFile): Promise<boolean> {
        const noteFolder = this.getNoteFolderPath(targetFolder, notesSubfolder);

        const key = this.getNoteKey(file, targetFolder);
        if (this.app.vault.getAbstractFileByPath(normalizePath(`${noteFolder}/${key}.md`))) return true;

        const simple = this.getNoteName(file.name);
        if (key !== simple && this.app.vault.getAbstractFileByPath(normalizePath(`${noteFolder}/${simple}.md`))) return true;

        return false;
    }

    async findNoteFile(targetFolder: string, notesSubfolder: string, file: TFile): Promise<TFile | null> {
        const noteFolder = this.getNoteFolderPath(targetFolder, notesSubfolder);

        const key = this.getNoteKey(file, targetFolder);
        const notePath = normalizePath(`${noteFolder}/${key}.md`);
        let noteFile = this.app.vault.getAbstractFileByPath(notePath);
        if (noteFile instanceof TFile) return noteFile;

        const simple = this.getNoteName(file.name);
        if (key !== simple) {
            const simplePath = normalizePath(`${noteFolder}/${simple}.md`);
            noteFile = this.app.vault.getAbstractFileByPath(simplePath);
            if (noteFile instanceof TFile) return noteFile;
        }

        return null;
    }

    async createNote(targetFolder: string, notesSubfolder: string, file: TFile, metadata: FileMetadata): Promise<void> {
        const noteFolder = this.getNoteFolderPath(targetFolder, notesSubfolder);
        await this.ensureFolder(noteFolder);

        const noteKey = this.getNoteKey(file, targetFolder);
        const notePath = normalizePath(`${noteFolder}/${noteKey}.md`);

        const tagsStr = metadata.tags.length > 0
            ? `  - ${metadata.tags.join('\n  - ')}`
            : '';

        const descEscaped = metadata.description.replace(/"/g, '\\"');

        const folderPrefix = targetFolder.replace(/\/+$/, '') + '/';
        const fileRelPath = file.path.startsWith(folderPrefix)
            ? file.path.slice(folderPrefix.length)
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

        const existing = this.app.vault.getAbstractFileByPath(notePath);
        if (existing instanceof TFile) {
            new Notice(`Note already exists for ${file.name}`);
            return;
        }
        await this.app.vault.create(notePath, content);
    }
}
