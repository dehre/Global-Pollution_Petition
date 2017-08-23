const express = require('express');
const hb = require('express-handlebars');
const {middlewares:{middlewares},rootRouter,profileRouter,petitionRouter} = require('./express');

//create express application
const app = express();

//set up templating engine
app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//serve static files
app.use('/static',express.static(__dirname + '/static'));

//set up middlewares
middlewares(app);

// set up routes
app.use('/',rootRouter);
app.use('/profile',profileRouter);
app.use('/petition',petitionRouter);

//catch all request for unexisting routes
app.get('*',function(req,res){
  res.redirect('/petition');
});

//start listening on port 8080
const port = 8080;
app.listen(port,function(){
  console.log(`Server listening on port ${port}`);
});
