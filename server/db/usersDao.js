'use strict';

const crypto = require('crypto');
const { db } = require('./db');

// get user for passport login
exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        const user = {
          id: row.id,
          username: row.email,
          name: row.name,
          role: row.role,
        };

        const salt = row.salt;
        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
          if (err) reject(err);

          const passwordHex = Buffer.from(row.password, 'hex');

          if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
            resolve(false);
          else resolve(user);
        });
      }
    });
  });
};

// retrieve a user given its id
exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE id=?';
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row == undefined) {
        reject({ notFound: 'User not found' });
        return;
      }
      resolve({
        name: row.name,
        //email: row.email,
        role: row.role,
        id: row.id,
      });
    });
  });
};
