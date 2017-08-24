//use Redis cache for preventing hack attacks
const redisCache = require('../database/redisCache');

module.exports = function(req,res){
  //take count of bad logins
  return redisCache.get('wrongAttempt')
  .then(function(wrongAttemptStr){
    const wrongAttempt = parseInt(wrongAttemptStr) || 1;
    return wrongAttempt
  })
  .then(function(wrongAttempt){
    if(wrongAttempt>=3){
      //if user tries bad login more than 3 times, give him punish time of 90sec, 180sec, 360 sec and so on
      return redisCache.get('punishTime')
      .then(function(timeStr){
        return parseInt(timeStr) || 90;
      })
      .then(function(time){
        req.session.punishTime = `You failed ${wrongAttempt} times. Please wait ${time} seconds before trying again`;
        return redisCache.setex('punishTime',time,JSON.stringify(time*2))
        .then(function(){
          return {wrongAttempt,time}
        })
      })
    }
    //return a default time of 10 seconds if no one provided
    return {wrongAttempt:wrongAttempt,time:10};
  })
  .then(function(obj){
    return redisCache.setex('wrongAttempt',obj.time,JSON.stringify(obj.wrongAttempt+1))
  })
}
