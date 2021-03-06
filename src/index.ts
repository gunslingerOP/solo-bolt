const Koa = require("koa");
const app = new Koa();
var body = require("koa-better-body");
var bodyParser = require("koa-bodyparser");
const koaBody = require("koa-body");
const cors = require("@koa/cors");
import { createConnection } from "typeorm";
import route from "../routes/v1.post";
let port = process.env.PORT || 5000;
createConnection().then(async (connection) => {
  app.use(cors());

  app.use(koaBody({ multipart: true }));

  app.use(route.routes());

  app.listen(port, () => {
    console.log(`Running on port ${port}`);
  });
});
