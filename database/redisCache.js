//set up Redis database as cache
const redis = require('redis');
//grab url for working with Redis
let redisUrl;
process.env.REDIS_URL ? redisUrl = process.env.REDIS_URL : redisUrl = 'localhost';
const client = redis.createClient({
  host: redisUrl,
  port: 6379
});
client.on('error',function(err){
  console.log('Redis error:',err);
});

//promisify redis functions
module.exports = {
  get: function(name){
    return new Promise(function(resolve,reject){
      client.get(name, function(err, data) {
        if(err){
          reject(err);
        }
        resolve(data);
      })
    })
  },
  set: function(name,value){
    return new Promise(function(resolve,reject){
      client.set(name,value, function(err, data) {
        if(err){
          reject(err);
        }
        resolve(data);
      })
    })
  },
  setex: function(name,time,value){
    return new Promise(function(resolve,reject){
      client.setex(name,time,value, function(err, data) {
        if(err){
          reject(err);
        }
        resolve(data);
      })
    })
  }
}
