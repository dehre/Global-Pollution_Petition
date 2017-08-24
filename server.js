const express = require('express');
const hb = require('express-handlebars');
const {middlewares:{middlewares},rootRouter,profileRouter,petitionRouter} = require('./express');

//create express application
const app = express();

//set up Redis database as cache
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379
});
client.on('error',function(err){
  console.log('Redis error:',err);
});

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

//handle 'Express' errors
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).render('error',{
    errorMessage: 'Server error, something broke!'
  })
})

//start listening on port 8080 (on dev environment)
const port = process.env.PORT || 8080;
app.listen(port,function(){
  console.log(`Server listening on port ${port}`);
});
