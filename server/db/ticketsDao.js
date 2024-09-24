'use strict';

const { db } = require('./db');
const { sortByTimestamp } = require('./utility');

/*****************************DAO FUNCTIONS*********************************/

// get general infos on all tickets
exports.getTickets = () => {
  return new Promise((resolve, reject) => {
    const query =
      'SELECT t.id,t.title,t.category,t.timestamp,t.state,u.name,u.id as user_id from TICKETS as t INNER JOIN users as u on t.owner=u.id';
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = sortByTimestamp(rows, 'latest');
      resolve(
        tickets.map(
          ({ id, title, category, timestamp, state, name, user_id }) => ({
            id,
            title,
            category,
            state,
            owner: { name, id: user_id },
            timestamp: timestamp.format('DD-MM-YYYY HH:mm:ss'),
          }),
        ),
      );
    });
  });
};

//get a single ticket
exports.getSingleTicket = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM tickets WHERE id=?';
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        reject({ notFound: 'Ticket not found' });
        return;
      }
      resolve(row);
    });
  });
};

//get a single text block
exports.getSingleTextBlock = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM textblocks WHERE id=?';
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        reject({ notFound: 'Text block not found' });
        return;
      }

      resolve(row);
    });
  });
};

//get infos and textblocks of a ticket

exports.getTicketInfos = (id, ticket) => {
  return new Promise((resolve, reject) => {
    // const query =
    //   'SELECT u.id as user_id,u.name,u.email,u.role, tb.id,tb.text,tb.timestamp,tb.author FROM textblocks as tb INNER JOIN tickets as t on tb.ticket=t.id INNER JOIN users as u on tb.author=u.id WHERE tb.ticket=?';
    const query =
      'SELECT u.id as user_id,u.name,u.email,u.role, tb.id,tb.text,tb.timestamp,tb.author FROM textblocks as tb INNER JOIN users as u on tb.author=u.id WHERE tb.ticket=?';

    db.all(query, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const textBlocks = sortByTimestamp(rows, 'oldest').map((el) => ({
        id: el.id,
        text: el.text,
        timestamp: el.timestamp.format('DD-MM-YYYY HH:mm:ss'),
        author: {
          id: el.user_id,
          name: el.name,
          //email: el.email,
          role: el.role,
        },
      }));
      resolve({ ticket, textBlocks });
    });
  });
};

//create ticket

exports.createTicket = ({ title, description, category, timestamp, owner }) => {
  return new Promise((resolve, reject) => {
    const query =
      'INSERT INTO tickets (title,category,description,timestamp,owner) VALUES(?,?,?,?,?)';
    db.run(
      query,
      [title, category, description, timestamp, owner],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(exports.getSingleTicket(this.lastID));
      },
    );
  });
};

// add text blocks

exports.createTextBlocks = ({
  ticketId,
  author,
  text,
  timestamp,
  ticketState,
}) => {
  return new Promise((resolve, reject) => {
    //first check if the ticket is still opened
    if (ticketState === 'closed') {
      reject({ badRequest: 'This ticket is closed' });
      return;
    }
    const query =
      'INSERT INTO textblocks (text,timestamp,author,ticket) VALUES(?,?,?,?)';
    db.run(query, [text, timestamp, author, ticketId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(exports.getSingleTextBlock(this.lastID));
    });
  });
};

// update the category of a ticket

exports.updateCategory = ({ ticketId, userRole, newCategory, oldCategory }) => {
  return new Promise((resolve, reject) => {
    if (userRole != 'admin') {
      reject({
        unauthorized: 'You are not authorized to perform this action',
      });
      return;
    }
    if (oldCategory === newCategory) {
      // 0 changes are made
      resolve(0);
      return;
    }

    const query = 'UPDATE tickets SET category=? WHERE id=?';
    db.run(query, [newCategory, ticketId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      //checked also in the server route
      if (this.changes !== 1) {
        reject({ notFound: 'Ticket not found' });
        return;
      }

      resolve(this.changes);
    });
  });
};

exports.updateTicketState = ({
  userRole,
  userId,
  ticketId,
  ticketOwner,
  newState,
  oldState,
}) => {
  return new Promise((resolve, reject) => {
    switch (newState) {
      //case 1: you want to close a ticket. You must be an admin or the owner of the ticket
      case 'closed':
        if (userId !== ticketOwner && userRole !== 'admin') {
          reject({
            unauthorized: 'You are not authorized to perform this action',
          });
          return;
        }
        break;
      //case 2: you want to open a ticket. You must be an admin.
      case 'open':
        if (userRole !== 'admin') {
          reject({
            unauthorized: 'You are not authorized to perform this action',
          });
          return;
        }
        break;
      default:
        reject('Invalid state');
        return;
    }

    if (newState === oldState) {
      // 0 changes are made
      resolve(0);
      return;
    }
    const query = 'UPDATE tickets SET state=? where id=?';
    db.run(query, [newState, ticketId], function (err) {
      if (err) {
        reject(err);
        return;
      }

      if (this.changes !== 1) {
        reject({ notFound: 'Ticket not found' });
        return;
      }
      resolve(this.changes);
    });
  });
};
