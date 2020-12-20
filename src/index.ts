const Koa = require('koa');
const app = new Koa();
var bodyParser = require('koa-bodyparser');
import {createConnection } from "typeorm";
import route from "../routes/v1";
let port = process.env.PORT || 5000
createConnection().then(async (connection) => {
app.use(bodyParser());

 

app.use(route.routes());

app.listen(port, ()=>{
    console.log(`Running on port ${port}`);
    
});

})