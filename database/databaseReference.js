//log into database (behave differently if in development or production mode)
const spicedPg = require('spiced-pg');
let db;
if(process.env.DATABASE_URL){
  db = spicedPg(process.env.DATABASE_URL);
} else {
  //grab data for logging into database
  const {dbUser,dbPassword} = require('../secret.json');
  db = spicedPg(`postgres:${dbUser}:${dbPassword}@localhost:5432/Loris`);
}

module.exports = db;
