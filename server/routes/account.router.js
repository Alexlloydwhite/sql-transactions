const express = require('express');
const router = express.Router();

const pool = require('../modules/pool');

router.get('/', (req, res) => {

  const sqlText = 
  `SELECT 
    account.id, 
    account.name, 
    SUM(amount) 
  FROM account
  JOIN register 
  ON account.id = register.acct_id 
  GROUP BY register.acct_id, account.id;`;

  pool.query(sqlText)
    .then(result => {
    res.send(result.rows);
  })
  .catch((err) => {
    console.log(err);
    res.sendStatus(500);
  });
})

router.post('/transfer', (req,res) => {
  const toAccount = req.body.to;
  const fromAccount = req.body.from;
  const amount = req.body.amount;

  console.log(`Info for transfer:`, toAccount, fromAccount, amount);

  // MUST use the same connection for all the queries in a Transaction
  const connection = await pool.connection();

  try {
    await connection.query('BEGIN;');
    const sqlText = 
    `INSERT INTO register (acct_id, amount) 
    VALUES ($1, $2);`;
    await connection.query(sqlText, [fromAccount, -amount]);
    await connection.query(sqlText, [toAccount, amount]);
    await connection.query(`COMMIT;`);
  } catch (error) {
    await connection.query('ROLLBACK;');
    console.log(`error transferring money!`, error);
    res.sendStatus(500);
  } finally { 
    // always runs - wether there is an error or not
    // Cleanup - return the database connection to the pool
    // THIS IS SUPER IMPORTANT
    connection.release();
  }
})

module.exports = router;
