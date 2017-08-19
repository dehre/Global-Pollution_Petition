//methods for working with database
const dbMethods = require('../db/methods');

//set all routes used inside express app
module.exports = function(app){

  app.get('/register',function(req,res){
    res.render('register');
  });

  app.post('/register',function(req,res){
    const {firstName,lastName,email, password} = req.body;
    if(!(firstName && lastName && email && password)){
      //if not all fields were filled, just render the 'register' template again with an error message, then exit the function
      return res.render('register',{showError: true});
    }
    //if all <input> fields filled,save new user to database
    dbMethods.createUser(firstName,lastName,email,password)
    .then(function(result){
      //grab 'id','firstName','lastName' of new registered user, and set them as cookie on user's browser
      req.session.user = result;
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.send(`Error happened creating new user into DB`);
    });
  });


  app.get('/login',function(req,res){
    res.render('login');
  });

  app.post('/login',function(req,res){
    const {email, password} = req.body;
    if(!(email && password)){
      //if not all fields were filled, just render the 'register' template again with an error message, then exit the function
      return res.render('login',{showError: true});
    }
    //if all <input> fields filled,retrieve person database
    dbMethods.getUser(email,password)
    .then(function(result){
      //set 'id','firstName','lastName' of logged in user as cookies on user's browser
      req.session.user = result;
      res.redirect('/petition');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      //redirect users to 'login' page with error message
      res.render('login',{showError:true});
    });
  });


  app.get('/petition',function(req,res){
    //grab user's first and last name from cookie to  prepopulate <input> fields inside <form>
    const {first,last} = req.session.user;
    res.render('petition',{
      first: first,
      last: last
    });
  });

  app.post('/petition',function(req,res){
    const {firstName,lastName,signature} = req.body;
    if(!(firstName && lastName && signature)){
      //if not all fields were filled, just render the 'petition' template again with an error message, then exit the function
      const {first,last} = req.session.user;
      return res.render('petition',{
        showError: true,
        first: first,
        last: last
      });
    }
    //if all <input> fields filled,save signature to database
    const {user_id,first,last} = req.session.user;
    dbMethods.createSignature(user_id,first,last,signature)
    .then(function(){
      //redirect user away after saving signature
      res.redirect('/signed');
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.send(`Error happened saving data to DB.`);
    });
  });


  app.get('/signed',function(req,res){
    //take user's id from cookies and  grab his signature from DB
    dbMethods.getSignature(req.session.user.user_id)
    .then(function(signature){
      //pass the signature I got back to 'signed' template
      res.render('signed',{signature:signature});
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.send(`Error happened retrieving signature from DB.`);
    })
  });

  app.get('/signers',function(req,res){
    //retrieve signed people's name from database and pass data to template
    dbMethods.getSigners()
    .then(function(signers){
      console.log('signers are',signers.length);
      res.render('signers',{signers: signers});
    })
    .catch(function(err){
      console.log(`Error inside ${req.method}'${req.url}'--> ${err}`);
      res.send(`Error happened retrieving data from DB.`);
    });
  });

  app.get('/logout',function(req,res){
    req.session.user = null;
    res.redirect('/register');
  });

  //catch all request for unexisting routes
  app.get('*',function(req,res){
    res.redirect('/petition');
  });


};
