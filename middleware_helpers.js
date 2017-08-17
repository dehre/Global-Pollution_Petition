// //useful functions for routing

//keep unsigned users away from private pages
module.exports.privatize = function(req,res,next){
  if(!req.session.userId){
    res.redirect('/petition');
  } else {
    next();
  }
}
//keep signed users away from public pages
module.exports.publicize = function(req,res,next){
  if(req.session.userId){
    res.redirect('/signed');
  } else {
    next();
  }
}
