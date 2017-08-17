const express = require('express');
const hb = require('express-handlebars');
const middlewares = require('./middlewares');
const routes = require('./routes');

//create express application
const app = express();

//set up templating engine
app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//set up middlewares
middlewares(app);

// set up routes
routes(app);

//start listening on port 8080
const port = 8080;
app.listen(port,function(){
  console.log(`Server listening on port ${port}`);
});
