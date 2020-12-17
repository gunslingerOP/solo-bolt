require("dotenv").config();

let config: any;
export default config = {
  jwtSecret: process.env.JWT_SECRET ,
  sendGrid:process.env.SENDGRID_API_KEY,
  port: process.env.PORT 
};