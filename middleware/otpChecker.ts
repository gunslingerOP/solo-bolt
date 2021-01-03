import config from "../config/index";
import * as jwt from "jsonwebtoken";
import { User } from "../src/entity/User";


const checkToken =  async (ctx, next) => {
  try {

    let payload;
    let user;
    let token = ctx.request.query.token;
    payload = jwt.verify(token, config.jwtSecret);
    if (payload.otp != true)
      throw { message: `This is not a valid OTP token` };
    user = await User.findOne({ where: { id: payload.id } });
    if (!user) throw { message: `No user found` };
    ctx.user = user
await next()
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      status: "Failed",
      data: error,
    };
  }
  }

  export default checkToken