<p align="center">
  <a href="https://github.com/Alexandrovdi/File-Describer/blob/main/README.md">English</a> |
  <a href="https://github.com/Alexandrovdi/File-Describer/blob/main/docs/README.ru.md">Русский</a>
</p>

# File Describer

Плагин для Obsidian, который автоматически создаёт и управляет заметками-описаниями для файлов в отслеживаемой папке. Идеально подходит для организации файлов в вашем хранилище с поиском по описаниям, отслеживанием изменений файлов и управления метаданными.

## Возможности

- **Автосоздание файла описания** — при добавлении файла в целевую папку автоматически создаётся заметка-описание
-  **Отслеживание удаления файла** — при удалении файла заметка автоматически изменяет статус
- **Отслеживание перемещения файла** — в заметке в поле `File` автоматически обновляется путь к файлу
- **Работа с осиротевшими заметками** — при удалении файла, заметку можно оставить для истории или удалить ее. 
- **Индикатор** — красный `!` на иконке панели означает, что произошло изменение файлов и необходимо выполнить действия с заметками. 
- **Рекурсивное сканирование** — в установленной папке, файлы сканируются во всех папках, вне зависимости от вложенности. 


<p align="center">
  <img src="https://github.com/Alexandrovdi/File-Describer/blob/main/docs/File describer settings.jpg" alt="File Describer settings" width="900">
</p>

## Настройки
1. Target folder - установите папку в которой будет происходить мониторинг файлов
2. Notes subfolder - установите папку в которой будут располагаться файлы описания
3. File types to track - типы файлов которые будут отслеживаться 
4. Date format - настройте удобный формат даты
5. Time format - настройте удобный формат времени


## Как это работает

1. Поместите файл в целевую папку (Target folder)
2. Плагин создаёт заметку-описание в папке (Notes subfolder) с frontmatter: `File Description`, `File` (викиссылка), `date_added`, `filetype`, `filename`
3. При добавлении, удалении или перемещении файла над иконкой плагина появится красный `!`
   <p align="center">
  <img src="https://github.com/Alexandrovdi/File-Describer/blob/main/docs/File describer icon.jpg" alt="File Describer Ribbon indicator" width="45">
</p>
4. При открытии плагина на вкладках будет отображено необходимое действие 
   <p align="center">
  <img src="https://github.com/Alexandrovdi/File-Describer/blob/main/docs/File describer plugin window.jpg" alt="File Describer plugin window" width="900">
</p>
5. Заполните поля "Description" и "Tags", нажмите "Save"

## Установка

### Из браузера плагинов Obsidian

Найдите "File Describer" в Настройки → Сторонние плагины → Обзор.

### Через BRAT

1. Установите плагин [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. Добавьте `https://github.com/Alexandrovdi/File-Describer` в список бета-плагинов
3. Нажмите «Add Plugin»

### Вручную

1. Скачайте последний релиз с [GitHub Releases](https://github.com/Alexandrovdi/File-Describer/releases)
2. Распакуйте `main.js`, `manifest.json` и `styles.css` в `VaultFolder/.obsidian/plugins/file-describer/`
3. Включите плагин в Настройки → Сторонние плагины

## Разработка

```bash
git clone https://github.com/Alexandrovdi/File-Describer.git
cd File-Describer
npm install
npm run build    # сборка main.js
npm run dev      # режим слежения
```

## Лицензия

MIT
