const express = require('express');
const hb = require('express-handlebars');
const {middlewares:{middlewares},loginRouter,profileRouter,petitionRouter} = require('./express');

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
app.use('/',loginRouter);
app.use('/profile',profileRouter);
app.use('/petition',petitionRouter);


//handle browser's request for 'favicon.ico'
app.get('/favicon.ico', function(req, res){
  res.redirect('/static/images/favicon.ico');
});

//catch all request for unexisting routes
app.get('*',function(req,res){
  res.redirect('/petition');
});

//handle 'Express' errors
app.use(function (err, req, res, next) {
  res.status(500).render('error',{errorMessage: 'Server error, something broke!'})
})

//start listening on port 8080 (on dev environment)
const port = process.env.PORT || 8080;
app.listen(port,function(){
  console.log(`Server listening on port ${port}`);
});
