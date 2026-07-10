import fs from 'fs';
import path from 'path';

function stripBom(text) {
    if (text.charCodeAt(0) === 0xFEFF) {
        return text.slice(1);
    }
    return text;
}

function copyWithoutBom(src, dest) {
    let content = fs.readFileSync(src, 'utf-8');
    content = stripBom(content);
    fs.writeFileSync(dest, content, 'utf-8');
}

const VAULTS = {
    main: 'C:/Users/alexa/Yandex.Disk/Obsidian_sync/Obsidian_Yandex_Main_Vault/.obsidian/plugins/file-describer',
    test: 'C:/Users/alexa/OneDrive/Документы/Test_pro/File Describer Vault/.obsidian/plugins/file-describer',
};

const target = process.argv[2] || 'main';
const vaultPath = VAULTS[target];

if (!vaultPath) {
    console.error(`Unknown target: "${target}". Available: main, test`);
    process.exit(1);
}

const files = ['main.js', 'manifest.json', 'styles.css'];

if (!fs.existsSync(vaultPath)) {
    fs.mkdirSync(vaultPath, { recursive: true });
}

for (const file of files) {
    const src = path.resolve(file);
    const dest = path.join(vaultPath, file);
    if (fs.existsSync(src)) {
        copyWithoutBom(src, dest);
        console.log(`Copied: ${file}`);
    } else {
        console.warn(`Warning: ${file} not found, skipping`);
    }
}

console.log(`Deploy to "${target}" vault complete!`);
