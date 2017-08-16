const spicedpg = require('spicedpg');
const secrets = require('./secrets');
const db = spicedPg(`postgres://${secrets.user}:${secrets.password}@localhost:5432/cities`);

db.query('SELECT * FROM superheroes WHERE universe="Marvel"').then(function(result){
  console.log(result);
});



var can = document.querySelector('canvas');

can.toDataUrl(); --> I 
