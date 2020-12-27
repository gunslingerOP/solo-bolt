const RateLimit = require('koa2-ratelimit').RateLimit;
 
const limiter = RateLimit.middleware({
  interval: { hour: 24 }, 
  max: 12, 
  message:`You've exceeded your daily number of tries`
});

export default limiter