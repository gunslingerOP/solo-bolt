import userController from "../controllers/user.controller"
import limiter from "../middleware/rateLimiter";
import userAuth from "../middleware/userAuth";
let koa = require('koa');
let router = require('koa-router');

let route= router(); 

route.post("/v1/verify",limiter, userController.verify)
route.post("/v1/login", userController.login)
route.post("/v1/loginOtp/:userId", userController.loginOtp)


route.post("/v1/register", userController.register)





export default route