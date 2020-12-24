const Koa = require("koa");
const app = new Koa();
var bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
import { createConnection } from "typeorm";
import route from "../routes/v1";
let port = process.env.PORT || 3000;
createConnection().then(async (connection) => {
    app.use(cors());

  app.use(bodyParser({
   formidable:{uploadDir: './uploads'},    //This is where the files would come
   multipart: true,
   urlencoded: true
}));

  app.use(route.routes());

  app.listen(port, () => {
    console.log(`Running on port ${port}`);
  });
});
