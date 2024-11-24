const { program } = require("commander");
const http = require("http");
const path = require("path");
const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer();

// Налаштування командного рядка
program
  .requiredOption("-h, --host <host>", "хост сервера")
  .requiredOption("-p, --port <port>", "порт сервера")
  .requiredOption("-c, --cache <path>", "шлях до кешу");

program.parse(process.argv);

const { host, port, cache } = program.opts();

// Підключення middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Головна сторінка
app.get("/", (req, res) => {
  res.send("Сервер працює");
});

// Нотатки
let notes = {};

// Отримання конкретної нотатки
app.get("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;
  if (notes[noteName]) {
    res.send(notes[noteName]);
  } else {
    res.status(404).send("Нотатка не знайдена");
  }
});

// Оновлення нотатки
app.put("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;
  const text = req.body.text; // Оскільки використовується express.json
  if (notes[noteName]) {
    notes[noteName] = text;
    res.send("Нотатку оновлено");
  } else {
    res.status(404).send("Нотатку не знайдено");
  }
});

// Видалення нотатки
app.delete("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;
  if (notes[noteName]) {
    delete notes[noteName];
    res.send("Нотатку видалено");
  } else {
    res.status(404).send("Нотатку не знайдено");
  }
});

// Список усіх нотаток
app.get("/notes", (req, res) => {
  const notesList = Object.keys(notes).map((noteName) => ({
    name: noteName,
    text: notes[noteName],
  }));
  res.json(notesList);
});

// Додавання нової нотатки
app.post("/write", upload.none(), (req, res) => {
  const noteName = req.body.note_name;
  const text = req.body.note;
  if (notes[noteName]) {
    res.status(400).send("Нотатка вже існує");
  } else {
    notes[noteName] = text;
    res.status(201).send("Нотатку створено");
  }
});

// Завантаження HTML-форми
app.get("/UploadForm.html", (req, res) => {
  res.sendFile(path.join(__dirname, "UploadForm.html"));
});

// Запуск сервера
const server = http.createServer(app);

server.listen(port, host, () => {
  console.log(`Сервер запущено: http://${host}:${port}`);
});
