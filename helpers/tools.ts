import * as bcrypt from "bcrypt";
import config from "../config";
import * as twilio from "twilio";


const accountSid= config.accountSID
const authToken =config.authToken
const client = twilio(accountSid, authToken);
const sgMail = require("@sendgrid/mail");
const otpGenerator = async (length = 4) => {

  let digits = "0123456789abcdefghijklmnopqrstuvwxyz";
let otp=''
  for (let i = 1; i <= length; i++) {
    let index = Math.floor(Math.random() * digits.length);
  otp = otp + digits[index]
  }
  return otp
};
const hashMyPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(plainPassword, salt);
  return password;
};

const comparePassword = async (plainPassword, hash) =>
  await bcrypt.compare(plainPassword, hash);

  const emailVerifyOtp = async (email, secretCode, action)=>{


    const msg = {
      to: email,
      from: "hasanaqeel38@gmail.com",
      subject: `Your OTP for ${action}!`,
      text: `Your OTP is ${secretCode}`,
      html: `<strong>Your OTP is ${secretCode}</strong>`,
    };

    (async () => {
      try {
        await sgMail.send(msg);
      } catch (error) {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    })();
  }

  const sendSMS = (body: string, to: string) => {
    client.messages
      .create({ body, from: "+19419993310", to })
      .then((message) => console.log(message.sid));
  };


  const ReEr=async (ctx, error)=>{
    ctx.status=400
    ctx.body={
      status:`Failed`,
      data:error
    }
  }

  
export {emailVerifyOtp, hashMyPassword, comparePassword, otpGenerator, ReEr, sendSMS };
