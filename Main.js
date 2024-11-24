const express = require('express');
const { Command } = require('commander');
const http = require('http');
const path = require('path');
const fs = require('fs');

const program = new Command();
program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

program.parse(process.argv);
const options = program.opts();

const cachePath = path.resolve(options.cache);
try {
  fs.accessSync(cachePath);
} catch (err) {
  console.error(`Помилка: вказана директорія кешу недоступна - ${cachePath}`);
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const notes = {};

app.get('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  if (notes[noteName]) {
    return res.send(notes[noteName].text);
  } else {
    return res.status(404).send('Нотатка не знайдена');
  }
});

app.put('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  if (notes[noteName]) {
    notes[noteName].text = req.body.text;
    return res.send('Нотатку оновлено');
  } else {
    return res.status(404).send('Нотатка не знайдена');
  }
});

app.delete('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  if (notes[noteName]) {
    delete notes[noteName];
    return res.send('Нотатку видалено');
  } else {
    return res.status(404).send('Нотатка не знайдена');
  }
});

app.get('/notes', (req, res) => {
  const noteList = Object.keys(notes).map((noteName) => ({
    name: noteName,
    text: notes[noteName].text
  }));
  return res.json(noteList);
});

app.post('/write', (req, res) => {
  const { note_name, note } = req.body;

  if (notes[note_name]) {
    return res.status(400).send('Нотатка з таким ім\'ям вже існує');
  }

  notes[note_name] = { text: note };
  return res.status(201).send('Нотатку створено');
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

const server = http.createServer(app);

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
