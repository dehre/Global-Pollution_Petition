const spicedPg = require('spiced-pg');
//import useful functions for hashing passwords
const {hashPassword,checkPassword} = require('./hashing');
const redisCache = require('./redisCache');

//log into database (behave differently if in development or production mode)
let db;
if(process.env.DATABASE_URL){
  db = spicedPg(process.env.DATABASE_URL);
} else {
  //grab data for logging into database
  const {dbUser,dbPassword} = require('../secret.json');
  db = spicedPg(`postgres:${dbUser}:${dbPassword}@localhost:5432/Loris`);
}


//save new signature to DB
module.exports.createSignature = function(user_id,signature){
  //set up query to put data into DB
  const query = 'INSERT INTO signatures (user_id,signature,petition_id) VALUES ($1,$2,1)';
  return db.query(query,[user_id,signature]);
}

//grab user's signature for the petition
module.exports.getSignature = function(user_id){
  //set up query to retrieve specific signature from DB
  const query = `SELECT signature FROM signatures WHERE user_id = $1 AND petition_id = 1`;
  return db.query(query,[user_id])
  .then(function(signatureObj){
    return signatureObj.rows[0].signature;
  });
}

//delete user's signature
module.exports.deleteSignature = function(user_id){
  //set up query to delete specific signature from DB
  const query = `DELETE FROM signatures WHERE user_id = $1 AND petition_id = 1`;
  return db.query(query,[user_id])
}

//retrieve all people that signed the petition
module.exports.getSigners = function(city){
  //set up query to put data into DB
  let query = 'SELECT first,last, age, city, homepage FROM signatures LEFT OUTER JOIN user_profiles ON signatures.user_id = user_profiles.user_id JOIN users ON signatures.user_id = users.id WHERE signatures.petition_id = 1';
  //if city name passed as argument, retrieve signers by city
  if(city){
    query += ' AND city = $1';
    return db.query(query,[city])
    .then(function(signersObj){
      return signersObj.rows;
    });
  }
  //otherwise retrieve all signers
  return db.query(query)
  .then(function(signersObj){
    return signersObj.rows;
  });
}

//set petition goal as cookie into user's browser
module.exports.getPetitionGoal = function(){
  const query = `SELECT goal FROM petitions WHERE id = 1`;
  return db.query(query)
  .then(function(goalObj){
    return goalObj.rows[0].goal
  })
}
