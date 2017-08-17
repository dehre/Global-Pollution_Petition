const spicedPg = require('spiced-pg');

//get back data for logging into database
const {dbUser,dbPassword} = require('../secret.json');

//setup database
const db = spicedPg(`postgres:${dbUser}:${dbPassword}@localhost:5432/Loris`);

//save new signature to DB
module.exports.savePerson = function(firstName,lastName,signature){
  //set up query to put data into DB
  const query = 'INSERT INTO signatures (first,last,signature) VALUES ($1,$2,$3) RETURNING id';
  return db.query(query,[firstName,lastName,signature]);
}

module.exports.retrievePeople = function(){
  //set up query to put data into DB
  const query = 'SELECT first,last FROM signatures';
  return db.query(query);
}
