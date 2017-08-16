//require modules
const express = require('express');
const spicedPg = require('spiced-pg');
const hb = require('express-handlebars');

//create express application
const app = express();

//get back data for logging into database
const secret = require('./dbSecret.json');
//setup database
const db = spicedPg(`postgres:${secret.user}:${secret.password}@localhost:5432/Loris`);

//set up templating engine
app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//MIDDLEWARES
app.use(require('body-parser').urlencoded({
    extended: false
}));
app.use(require('cookie-parser')());
//serve static files
app.use('/static',express.static(__dirname + '/static'));

//CODE ROUTING
app.get('/petition',function(req,res){
  res.render('petition',{
    showError: false
  });
});
app.post('/petition',function(req,res){
  const {firstName,lastName,signature} = req.body;
  if(firstName && lastName && signature){
    console.log('All fields filled!');
    //set up query to put data into DB
    const query = 'INSERT INTO signatures (first,last,signature) VALUES ($1,$2,$3)';
    db.query(query,[firstName,lastName,signature])
    .then(function(results){
      console.log('Data correctly inserted to DB');
    })
    .catch(function(err){
      console.log('Error happened inserting data to DB',err);
    });
  } else {
    //if not all fields were filled, just render the petition page again with an error message
    res.render('petition',{
      showError: true
    });
  }
});

//start listening on port 8080
const port = 8080;
app.listen(port,function(){
  console.log(`Server listening on port ${port}`);
});
