import config from "../config/index";
import * as jwt from "jsonwebtoken";
import { User } from "../src/entity/User";

let Authenticate: any;
export default Authenticate = async (ctx, next): Promise<object> => {
    try {
  let payload: any;
  const token = ctx.request.headers.token;

    payload = jwt.verify(token, config.jwtSecret);
    let   user = await User.findOne({
        where: { id: payload.id, verified: true },
    });
    if (!user) throw  {message:`User does not exist, please complete the registration process.`};
    ctx.request.user = user;
    
    return next();
} catch (error) {
 ctx.status= 400
 ctx.body={
    status:`Failed`,
    data:error
 }
}
};