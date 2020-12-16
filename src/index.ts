const Koa = require('koa');
const app = new Koa();
import {createConnection } from "typeorm";
import route from "../routes/v1";
let port = process.env.PORT || 3000
createConnection().then(async (connection) => {

app.use(route.routes());

app.listen(port, ()=>{
    console.log(`Running on port ${port}`);
    
});

})