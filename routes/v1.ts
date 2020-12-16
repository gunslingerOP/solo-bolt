import userController from "../controllers/user.controller"
let koa = require('koa');
let router = require('koa-router');

let route= router(); 

route.post("/v1/login", userController.login)

route.post("/v1/register", userController.login)





export default route