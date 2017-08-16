//require modules
const express = require('express');
const hb = require('express-handlebars');

//create express application
const app = express();

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
  if(!req.body.firstName && !req.body.lastName && !req.body.signature){
    console.log('All fields filled!');
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
