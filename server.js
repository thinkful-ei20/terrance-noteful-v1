'use strict';

const data = require('./db/notes');

console.log('Hello Noteful!');

// INSERT EXPRESS APP CODE HERE...
const express = require('express');
const app = express();

app.use(express.static('public'));

const {PORT} = require('./config');
console.log(PORT);

app.get('/api/notes', (req, res) => {
  if (req.query.searchTerm) {
    let query = req.query.searchTerm;
    let match = data.filter(item => item.title.includes(query));
    res.json(match);
  } else {
    res.json(data);
  }
});

app.get('/api/notes/:id', (req, res) => {
  const {id} = req.params;
  let match = data.find(item => item.id === Number(id));
  res.json(match);
});

app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});