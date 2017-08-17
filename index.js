const express = require('express');
const hb = require('express-handlebars');
const middlewares = require('./express/middlewares');
const routes = require('./express/routes');

//create express application
const app = express();

//set up templating engine
app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//set up middlewares
middlewares(app);

//serve static files
app.use('/static',express.static(__dirname + '/static'));

// set up routes
routes(app);

//start listening on port 8080
const port = 8080;
app.listen(port,function(){
  console.log(`Server listening on port ${port}`);
});
