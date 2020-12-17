import * as bcrypt from "bcrypt";
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

export {emailVerifyOtp, hashMyPassword, comparePassword, otpGenerator };
