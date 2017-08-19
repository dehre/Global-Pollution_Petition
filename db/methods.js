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
    const query = 'INSERT INTO users (first,last,email,password) VALUES ($1,$2,$3,$4) RETURNING id,first,last';
    return db.query(query,[firstName,lastName,email,hash]);
  })
  .then(function(userData){
    //return from promise 'id','firstName','lastName' of newly registered user
    return {
      user_id:userData.rows[0].id,
      first:userData.rows[0].first,
      last:userData.rows[0].last,
    }
  });
}

//retrieve existing user from 'users' database
module.exports.getUser = function(email,plainTextPassword){
  //search by 'email' into 'users' database
  const query = 'SELECT id,first,last,email,password FROM users WHERE email = $1';
  return db.query(query,[email])
  .then(function(userData){
    //create object containing useful user's data
    return {
      id:userData.rows[0].id,
      first:userData.rows[0].first,
      last:userData.rows[0].last,
      email:userData.rows[0].email,
      hashedPassword:userData.rows[0].password
    }
  })
  .then(function(userObj){
    //compare saved password with new one provided from user
    return checkPassword(plainTextPassword,userObj.hashedPassword)
    .then(function(doesMatch){
      //if passwords match return from promise 'id','firstName','lastName' of currently searched user, otherwise throw an error
      if(!doesMatch){
        throw 'Passwords do not match!';
      }
      return {
        user_id: userObj.id,
        first: userObj.first,
        last: userObj.last
      };
    })
  });
}


//save new signature to DB
module.exports.createSignature = function(user_id,firstName,lastName,signature){
  //set up query to put data into DB
  const query = 'INSERT INTO signatures (user_id,first,last,signature) VALUES ($1,$2,$3,$4)';
  return db.query(query,[user_id,firstName,lastName,signature]);
}

//grab user's signature for the petition
module.exports.getSignature = function(user_id){
  //set up query to retrieve specific signature from DB
  const query = `SELECT signature FROM signatures WHERE user_id = $1`;
  return db.query(query,[user_id]);
}


//retrieve all people that signed the petition
module.exports.retrievePeople = function(){
  //set up query to put data into DB
  const query = 'SELECT first,last FROM signatures';
  return db.query(query);
}
