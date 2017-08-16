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
  res.render('petition');
});
app.post('/petition',function(req,res){
  console.log('Body of inputs is',req.body);
  res.redirect('/petition')
});

//start listening on port 8080
const port = 8080;
app.listen(port,function(){
  console.log(`Server listening on port ${port}`);
});
