'use strict';

/* global app */

const logger = (req, res, next) => {
  const date = new Date();
  console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
};

module.exports = logger;

