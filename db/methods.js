const spicedPg = require('spiced-pg');
//import useful functions for hashing passwords
const {hashPassword,checkPassword} = require('./hashing');

//get back data for logging into database
const {dbUser,dbPassword} = require('../secret.json');

//setup database
const db = spicedPg(`postgres:${dbUser}:${dbPassword}@localhost:5432/Loris`);

//create new user inside 'users' database
module.exports.createUser = function(firstName,lastName,email,password){
  //hash user's password before putting into database
  return hashPassword(password)
  .then(function(hash){
    //set up query to put data into DB
    const query = 'INSERT INTO users (first,last,email,password) VALUES ($1,$2,$3,$4) RETURNING id';
    return db.query(query,[firstName,lastName,email,hash]);
  })
  .catch(function(err){
    return(`Error happened hashing password before saving into DB. Error is:\n${err}`);
  });
}

//save new signature to DB
module.exports.savePerson = function(firstName,lastName,signature){
  //set up query to put data into DB
  const query = 'INSERT INTO signatures (first,last,signature) VALUES ($1,$2,$3) RETURNING id';
  return db.query(query,[firstName,lastName,signature]);
}

//retrieve all people that signed the petition
module.exports.retrievePeople = function(){
  //set up query to put data into DB
  const query = 'SELECT first,last FROM signatures';
  return db.query(query);
}

//grab user's signature for the petition
module.exports.getSignature = function(id){
  //set up query to retrieve specific signature from DB
  const query = `SELECT signature FROM signatures WHERE id = $1`;
  return db.query(query,[id]);
}
