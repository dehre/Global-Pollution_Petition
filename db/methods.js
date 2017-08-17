const spicedPg = require('spiced-pg');

//get back data for logging into database
const secret = require('../dbSecret.json');

//setup database
const db = spicedPg(`postgres:${secret.user}:${secret.password}@localhost:5432/Loris`);

//save new signature to DB
module.exports.savePerson = function(firstName,lastName,signature){
    //set up query to put data into DB
    const query = 'INSERT INTO signatures (first,last,signature) VALUES ($1,$2,$3)';
    return db.query(query,[firstName,lastName,signature]);
}
