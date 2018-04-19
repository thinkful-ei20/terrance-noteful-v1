'use strict';

const express = require('express');
const router = express.Router();

const data = require('../db/notes');
const simDB = require('../db/simDB');  
const notes = simDB.initialize(data);

router.get('/notes', (req, res, next) => {
  // if (req.query.searchTerm) {
  //   let query = req.query.searchTerm;
  //   let match = data.filter(item => item.title.includes(query));
  //   res.json(match);
  // } else {
  //   res.json(data);
  // }
  const { searchTerm } = req.query;

  notes.filter(searchTerm)
    .then(list => {
      if (list) {
        res.json(list);
      } 
    })
    .catch(err => {
      next(err);
    });

  // notes.filter(searchTerm, (err, list) => {
  //   if (err) {
  //     return next(err); // goes to error handler
  //   }
  //   res.json(list); // responds with filtered array
  // });
});

router.get('/notes/:id', (req, res, next) => {
  // const {id} = req.params;
  // let match = data.find(item => item.id === Number(id));
  // res.json(match);
  // let {id} = req.params;
  // id = Number(id);
  // notes.find( id, (err, item) => {
  //   res.json(item);
  // });
  let id = req.params.id;
  notes.find(id)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  notes.update(id, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
        // res.status(201).json({message: 'updated', id: item.id});
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

  // notes.update(id, updateObj, (err, item) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   if (item) {
  //     res.json(item);
  //   } else {
  //     next();
  //   }
  // });
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  notes.create(newItem)
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });


  // notes.create(newItem, (err, item) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   if (item) {
  //     res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
  //   } else {
  //     next();
  //   }
  // }); 
});

// Delete an item
router.delete('/notes/:id', (req, res, next) => {
  let id = req.params.id;
  notes.delete(id)
    .then(id => {
      if (id) {
        res.sendStatus(204);
      } 
    })
    .catch(err => {
      next(err);
    });

  // notes.delete(id, (err) => {
  //   if (err) {
  //     return next(err);
  //   } 
  //   res.sendStatus(204);
  // });
});

module.exports = router;