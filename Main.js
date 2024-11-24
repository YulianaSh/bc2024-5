const express = require('express');
const { Command } = require('commander');
const http = require('http');
const path = require('path');

const program = new Command();
program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

program.parse(process.argv);
const options = program.opts();

const cachePath = path.resolve(options.cache);
try {
  require('fs').accessSync(cachePath);
} catch (err) {
  console.error(`Помилка: вказана директорія кешу недоступна - ${cachePath}`);
  process.exit(1);
}

const app = express();

app.get('/', (req, res) => {
  res.send('Веб-сервер працює!');
});

const server = http.createServer(app);

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
