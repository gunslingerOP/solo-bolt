import config from "../config/index";
import * as jwt from "jsonwebtoken";
import { User } from "../src/entity/User";
import { ReEr } from "../helpers/tools";

 const Authenticate = async (ctx, next) => {
  
      
  let payload: any;
  const token = ctx.request.headers.token;
      
    payload = jwt.verify(token, config.jwtSecret).catch(error=>ReEr(ctx, error));
    let   user = await User.findOne({
        where: { id: payload.id, verified: true },
    });
    if (!user)  ReEr(ctx, {message:`User does not exist, please complete the registration process.`})
    ctx.request.user = user;
    
    await next();
 
};
export default Authenticate