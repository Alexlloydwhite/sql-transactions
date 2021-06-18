const express = require('express');
const router = express.Router();

const pool = require('../modules/pool');

router.get('/', (req, res) => {
  const sqlText = `SELECT account.id, account.name, SUM(amount) FROM account
  JOIN register on account.id = register.acct_id 
  GROUP BY register.acct_id, account.id;`

  pool.query(sqlText)
    .then(result => {
    res.send(result.rows);
  })
  .catch((err) => {
    console.log(err);
    res.sendStatus(500);
  });

})

module.exports = router;
