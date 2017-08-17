const dbMethods = require('./db/methods');
//set all routes used inside express app
module.exports = function(app){

  app.get('/petition',function(req,res){
    res.render('petition',{
      showError: false
    });
  });

  app.post('/petition',function(req,res){
    const {firstName,lastName,signature} = req.body;
    //need all <input> fields to be filled
    if(firstName && lastName && signature){
      //save signed person to database
      dbMethods.savePerson(firstName,lastName,signature)
      .then(function(){
        //set a cookie to remember signed-in user
        res.cookie('signed','true');
        //redirect user away
        res.redirect('/signed');
      })
      .catch(function(err){
        res.send('Error happened saving data to DB');
      });
    } else {
      //if not all fields were filled, just render the petition page again with an error message
      res.render('petition',{
        showError: true
      });
    }
  });

  app.get('/signed',function(req,res){
    res.render('signed');
  });

  app.get('/signers',function(req,res){
    //retrieve signed people's name from database and pass data to template
    dbMethods.retrievePeople()
    .then(function(results){
      res.render('signers',{
        signers: results.rows
      });
    })
    .catch(function(err){
      res.send('Error happened retrieving data from DB');
    });
  });

  //catch all request for unexisting routes
  app.get('*',function(req,res){
    res.redirect('/petition');
  });


};
