import config from "../config/index";
import * as jwt from "jsonwebtoken";
import { User } from "../src/entity/User";
import { ReEr } from "../helpers/tools";

 const Authenticate = async (ctx, next) => {
  
      
  let payload: any;
  const token = ctx.request.headers.token;
      try {
        payload = jwt.verify(token, config.jwtSecret)
        
      } catch (error) {
        
        return ReEr(ctx, error)
      }
      if(payload.otp) throw{message:`Your token is for logging in and registering only!`}
    let   user = await User.findOne({
        where: { id: payload.id, verified: true },
    });
    if (!user) return ReEr(ctx, {message:`User does not exist, please complete the registration process.`})
    ctx.request.user = user;
    
    await next();
 
};
export default Authenticate