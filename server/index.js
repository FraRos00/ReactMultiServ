'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const morgan = require('morgan');
const cors = require('cors');
const ticketsDao = require('./db/ticketsDao');
const usersDao = require('./db/usersDao');

//dayjs for date managment
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

//passport for login
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

//setup for sanitization
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

//json web tokens
const jsonwebtoken = require('jsonwebtoken');
const jwtSecret =
  'NiZAgCakhRQ3hk1lihUOoqXtlWfeF9vIF2E7abdbBTAdha5GDw/pjPKscUc7KD+fII0Y51FzH3VVETklKW3i1M';
const expireTime = 60; //in seconds

// init express
const app = new express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

// middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(401).json({ errorMsg: 'Not authenticated' });
};

// Passport setup

passport.use(
  new LocalStrategy(function verify(username, password, callback) {
    usersDao
      .getUser(username, password)
      .then((user) => {
        if (!user)
          return callback(null, false, {
            errorMsg: 'Incorrect username or password',
          });
        return callback(null, user);
      })
      .catch((err) => console.log(err));
  }),
);

passport.serializeUser(function (user, callback) {
  return callback(null, user);
});

passport.deserializeUser(function (user, callback) {
  //another approach could be the minimal approach were you have a higher load on the db since you store
  //in the session only the id of the user but you are sure you have always updated info about the user requesting them in the deserialize.
  //I did not chose this approach since there is no way for the user to change its infos in our application
  return callback(null, user);
});

//secure should be set to true when not in development mode
app.use(
  session({
    secret: 'Dkjj2+pQB6PhGE+rd8V4roWFYTNNjviyJncQkUHyu6M',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false },
  }),
);

app.use(passport.authenticate('session'));

/****************************UTILITY FUNCTIONS**********************************/

// This function is used to format express-validator errors as strings

const errorFormatter = ({ type, path, msg, value, location }) => {
  return `${type} [${path}] in ${location}: ${msg} ${value}`;
};

//This function is used to purify the fields of an object
//
const purifyObject = (rawObj) => {
  Object.entries(rawObj).forEach(([key, value]) => {
    if (typeof rawObj[key] === 'string')
      rawObj[key] = DOMPurify.sanitize(value);
  });
  return rawObj;
};

//This function is used to handle correctly the different errors that can come into catch blocks from dao

const handleErrors = (error, res) => {
  if (error.notFound) {
    res.status(404).json({ errorMsg: error.notFound });
    return;
  }

  if (error.unauthorized) {
    res.status(401).json({ errorMsg: error.unauthorized });
    return;
  }
  if (error.badRequest) {
    res.status(400).json({ errorMsg: error.badRequest });
    return;
  }
  res.status(500).json({ errorMsg: error });
};

// NOTE:this function is ONLY for debug
const sleeptime = 1000;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//Custom validator for dates (I didn't use it eventually)

const checkDate = (value) => {
  // check if it's a valid date using dayjs
  //true is for the strict parameter. Without it dates like '10-07-2024 16:43:01dasd' would be recognised as valid
  return dayjs(value, 'DD-MM-YYYY HH:mm:ss', true).isValid();
};

// global variables
const maxTitleLength = 160;
const maxDescriptionLength = 500;

/**************************API ROUTES****************************************/

// Sessions route routes

app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(info);
    }
    req.login(user, (err) => {
      if (err) return next(err);

      return res.json(req.user);
    });
  })(req, res, next);
});

// ALTERNATIVE: if we are not interested in sending error messages...
/*
app.post('/api/sessions', passport.authenticate('local'), (req,res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.user);
});
*/

// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ errorMsg: 'Unauthenticated user!' });
});

app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// Token route

app.get('/api/auth-token', isLoggedIn, (req, res) => {
  const accessLevel = req.user.role;
  const payloadToSign = { accessLevel };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {
    expiresIn: expireTime,
  });
  // send also accessLevel for debug purposes
  res.status(200).json({ token: jwtToken, accessLevel });
});

// GET routes

app.get('/api/tickets', async (req, res) => {
  try {
    //sleep for testing when connection is slow
    //await sleep(sleeptime);
    const result = await ticketsDao.getTickets();
    res.status(200).json(result);
  } catch (error) {
    handleErrors(error, res);
  }
});

app.get(
  '/api/tickets/:ticketId',
  [isLoggedIn, check('ticketId').isInt({ min: 1 })],
  async (req, res) => {
    //check for validation errors
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      res.status(422).json({ errorMsg: errors.array() });
      return;
    }

    try {
      //sleep for testing when connection is slow
      //await sleep(sleeptime);
      const id = Number(req.params.ticketId);
      const ticket = await ticketsDao.getSingleTicket(id);
      const ticketOwner = await usersDao.getUserById(ticket.owner);
      const result = await ticketsDao.getTicketInfos(id, ticket);
      result.ticket.owner = ticketOwner;
      res.status(200).json(result);
    } catch (error) {
      handleErrors(error, res);
    }
  },
);

// POST routes

app.post(
  '/api/tickets',
  [
    isLoggedIn,
    check('title')
      .trim()
      .isLength({ min: 1, max: maxTitleLength })
      .withMessage(
        `Title has to have between 1 and ${maxTitleLength} characters`,
      ),
    check('category').isIn([
      'inquiry',
      'maintenance',
      'new feature',
      'administrative',
      'payment',
    ]),
    check('description')
      .trim()
      .isLength({ min: 1, max: maxDescriptionLength })
      .withMessage(
        `Description has to have between 1 and ${maxDescriptionLength} characters`,
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      res.status(422).json({ errorMsg: errors.array() });
      return;
    }

    try {
      //sleep for testing when connection is slow
      //await sleep(sleeptime);
      //the category purification is an additional check since it is already checked in the validator. Security in depth principle
      const { title, category, description } = purifyObject(req.body);
      const timestamp = dayjs().format('DD-MM-YYYY HH:mm:ss');
      const owner = req.user.id;
      const result = await ticketsDao.createTicket({
        title,
        category,
        description,
        timestamp,
        owner,
      });
      res.status(201).json(result);
    } catch (error) {
      handleErrors(error, res);
    }
  },
);

app.post(
  '/api/tickets/:ticketId',
  [
    isLoggedIn,
    check('ticketId').isInt({ min: 1 }),
    check('text')
      .trim()
      .isLength({ min: 1, max: maxDescriptionLength })
      .withMessage(
        `Description has to have between 1 and ${maxDescriptionLength} characters`,
      ),
    check('id').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      res.status(422).json({ errorMsg: errors.array() });
      return;
    }

    try {
      //sleep for testing when connection is slow
      //await sleep(sleeptime);
      const ticketId = Number(req.params.ticketId);

      const { text, id: ticket_id } = purifyObject(req.body);
      const timestamp = dayjs().format('DD-MM-YYYY HH:mm:ss');
      const author = req.user.id;

      //if the id from the url does not match the url in the body return an error
      if (ticket_id && ticket_id !== ticketId) {
        res.status(422).json({ errorMsg: 'URL and body id mismatch' });
        return;
      }
      //retrieve the ticket to check if the state is opened or closed in ticketsDao.createTextBlocks
      const ticket = await ticketsDao.getSingleTicket(ticketId);

      const textBlock = await ticketsDao.createTextBlocks({
        ticketId,
        author,
        text,
        timestamp,
        ticketState: ticket.state,
      });
      res.status(201).json(textBlock);
    } catch (error) {
      handleErrors(error, res);
    }
  },
);

app.put(
  '/api/tickets/:ticketId/category',
  [
    isLoggedIn,
    check('ticketId').isInt({ min: 1 }),
    check('id').isInt({ min: 1 }),
    check('category').isIn([
      'inquiry',
      'maintenance',
      'new feature',
      'administrative',
      'payment',
    ]),
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      res.status(422).json({ errorMsg: errors.array() });
      return;
    }

    try {
      //sleep for testing when connection is slow
      //await sleep(sleeptime);
      const ticketId = Number(req.params.ticketId);
      const { role: userRole } = req.user;

      //this purification is just an additional check since the category is already checked also in the validator. Security in depth principle
      const { category: newCategory, id: ticket_id } = purifyObject(req.body);

      if (ticket_id && ticket_id !== ticketId) {
        return res.status(422).json({ error: 'URL and body id mismatch' });
      }

      // good practice to retrieve the item you want to update to perform some checks like
      // checking if it really has to be updated and that the ticket exists
      const ticket = await ticketsDao.getSingleTicket(ticketId);

      const changes = await ticketsDao.updateCategory({
        ticketId,
        userRole,
        newCategory,
        oldCategory: ticket.category,
      });

      res.status(200).json({ itemsChanged: changes });
    } catch (error) {
      handleErrors(error, res);
    }
  },
);

app.put(
  '/api/tickets/:ticketId/state',
  [
    isLoggedIn,
    check('ticketId').isInt({ min: 1 }),
    check('state').isIn(['open', 'closed']),
    check('id').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      res.status(422).json({ errorMsg: errors.array() });
      return;
    }

    try {
      //sleep for testing when connection is slow
      //await sleep(sleeptime);
      const { role: userRole, id: userId } = req.user;
      const ticketId = Number(req.params.ticketId);

      //this purification is just an additional check since the state is already checked also in the validator. Security in depth principle
      const { state: newState, id: ticket_id } = purifyObject(req.body);

      if (ticket_id && ticket_id !== ticketId) {
        return res.status(422).json({ error: 'URL and body id mismatch' });
      }

      const ticket = await ticketsDao.getSingleTicket(ticketId);
      const changes = await ticketsDao.updateTicketState({
        userRole,
        userId,
        ticketId,
        newState,
        oldState: ticket.state,
        ticketOwner: ticket.owner,
      });
      res.status(200).json({ itemsChanged: changes });
    } catch (error) {
      handleErrors(error, res);
    }
  },
);
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
