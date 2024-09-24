'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const { expressjwt: jwt } = require('express-jwt');
const { getRandomInt } = require('./utility');
const jwtSecret =
  'NiZAgCakhRQ3hk1lihUOoqXtlWfeF9vIF2E7abdbBTAdha5GDw/pjPKscUc7KD+fII0Y51FzH3VVETklKW3i1M';

// init express
const app = new express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(
  jwt({
    secret: jwtSecret,
    algorithms: ['HS256'],
  }),
);

// custom validator, returns true if every item of the array has a non-empty title and category
const arrayValidator = (array) => {
  const validArray = array.every((obj) => {
    return (
      obj.hasOwnProperty('title') &&
      obj.hasOwnProperty('category') &&
      obj.title?.trim().length > 1 &&
      obj.category?.trim().length > 1
    );
  });
  //debug
  // console.log(validArray);
  return validArray;
};

// To return a better object in case of errors
app.use(function (err, req, res, next) {
  //console.log("DEBUG: error handling function executed");
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({
      errors: [{ param: 'Server', msg: 'Authorization error', path: err.code }],
    });
  } else {
    next();
  }
});

app.post(
  '/api/closing-prediction',
  body('tickets')
    .isArray({ min: 1 })
    .withMessage('Ticket has to be a non-empty array')
    .custom(arrayValidator)
    .withMessage('Every ticket should contain a non-empty title and category'),
  (req, res) => {
    const accessLevel = req.auth.accessLevel;
    const tickets = req.body.tickets;
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map((e) => e.msg));
      return res.status(400).json({ errors: errList });
    }

    const predictions = [];

    tickets.forEach(({ title, category, id }) => {
      const titleLength = title.replaceAll(' ', '').length;
      const categoryLength = category.replaceAll(' ', '').length;
      const predTime =
        (titleLength + categoryLength) * 10 + getRandomInt(1, 240);

      predictions.push({ id, predTime });
    });

    if (accessLevel === 'admin')
      res.status(200).json(
        predictions.map(({ id, predTime }) => ({
          id,
          predTime: predTime + ' hours',
        })),
      );
    if (accessLevel === 'user')
      res.status(200).json(
        predictions.map(({ id, predTime }) => ({
          id,
          predTime: Math.round(predTime / 24) + ' days',
        })),
      );
  },
);

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
