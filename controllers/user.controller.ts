import * as validate from "validate.js";
require("dotenv").config();
import validator from "../helpers/validate";
import { emailVerifyOtp, hashMyPassword, otpGenerator } from "../helpers/tools";
import * as jwt from "jsonwebtoken";
import { closestIndexTo, format } from "date-fns";
import { User } from "../src/entity/User";
import config from "../config/index";
import { Otp } from "../src/entity/otp";
import { Design } from "../src/entity/design";
import { Board } from "../src/entity/board";
import { validators } from "validate.js";
import { Plan } from "../src/entity/plan";
import { basename } from "path";
var cloudinary = require("cloudinary").v2;
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.cloudAPI,
  api_secret: config.cloudSecret,
});
export default class userController {
  static register = async (ctx: any) => {
    try {
      let user;
      let otp;
      let plan;
      let secretCode;
      let email;
      let notValid = validate(ctx.request.body, validator.register());
      if (notValid) throw { message: notValid };
      email = await User.findOne({ where: { email: ctx.request.body.email } });
      if (email) throw { message: `This email already exists` };
      const password = await hashMyPassword(ctx.request.body.password);

      plan = await Plan.findOne({
        where: { name: "free plan" },
      });
      user = await User.create({
        ...ctx.request.body,
        password,
        plan,
        verified: false,
        planPrice: plan.price,
      });
      await user.save();
      user.password = null;

      secretCode = await otpGenerator();
      otp = await Otp.create({
        expired: false,
        code: secretCode,
        used: false,
        type: `Register`,
        user,
      });
      await otp.save();
      email = ctx.request.body.email;
      emailVerifyOtp(email, secretCode, `Registration`);
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      ctx.body = {
        status: "success",
        data: { token: token, user },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static verify = async (ctx) => {
    try {
      let secretCode;
      let email;
      let notValid = validate(ctx.request.body, validator.verify());
      if (notValid) throw { message: notValid };
      let year;
      let month;
      let day;
      let hour;
      let minutes;
      let seconds;

      let date = new Date();
      let yearNow;
      let monthNow;
      let dayNow;
      let hourNow;
      let minutesNow;
      let secondsNow;
      let payload;
      let user;
      if (!ctx.request.headers.token) throw { message: `Please get a token` };
      const token = ctx.request.headers.token;

      payload = jwt.verify(token, config.jwtSecret);

      user = await User.findOne({ where: { id: payload.id } });
      if (!user) throw { message: `No user found` };
      if (user.verified == true)
        throw { message: `Your account has already been verified` };
      let otp;

      otp = await Otp.findOne({
        where: { used: false, expired: false, user: user },
      });
      if (!otp) throw { message: `No OTP found, get another one` };
      year = parseInt(format(otp.createdAt, "yyyy"));
      month = parseInt(format(otp.createdAt, "M"));
      day = parseInt(format(otp.createdAt, "d"));
      hour = parseInt(format(otp.createdAt, "H"));
      minutes = parseInt(format(otp.createdAt, "m"));
      seconds = format(otp.createdAt, "ss");

      yearNow = date.getFullYear();
      monthNow = date.getMonth() + 1;
      dayNow = date.getDate();
      hourNow = date.getHours();
      minutesNow = date.getMinutes();
      secondsNow = date.getSeconds() + 1;

      if (
        year !== yearNow ||
        month !== monthNow ||
        day !== dayNow ||
        hour !== hourNow ||
        minutesNow - minutes > 4
      ) {
        otp.expired = true;
        await otp.save();
        secretCode = await otpGenerator();
        otp = await Otp.create({
          expired: false,
          code: secretCode,
          used: false,
          type: `Register`,
          user,
        });
        await otp.save();
        email = user.email;
        emailVerifyOtp(email, secretCode, `Registration`);
        throw {
          message: `OTP expired, a new one has been sent to your email address`,
        };
      } else {
        if (otp.code !== ctx.request.body.otp)
          throw { message: `Incorrect OTP, try again` };
        user.verified = true;
        await user.save();
        otp.used = true;
        await otp.save();
      }
      ctx.body = {
        status: "Success",
        data: { user },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };
  static login = async (ctx) => {
    try {
      let secretCode;
      let token;
      let email;
      let date = new Date();
      let notValid = validate(ctx.request.body, validator.login());
      if (notValid) throw { message: notValid };
      let user;
      user = await User.findOne({ where: { email: ctx.request.body.email } });
      if (!user) throw { message: `No user found` };

      if (!user.verified) throw { message: `Verify your account first` };
      let otp;

      otp = await Otp.findOne({
        where: { used: false, expired: false, user: user },
      });
      if (otp) throw { message: `You already have an active OTP` };
      secretCode = await otpGenerator(5);
      email = user.email;
      otp = await Otp.create({
        expired: false,
        code: secretCode,
        used: false,
        type: `Login`,
        user,
      });
      await otp.save();
      emailVerifyOtp(email, secretCode, `login`);

      ctx.body = {
        status: "Success",
        data: { user, message: `An email with the login OTP has been sent` },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "False",
        data: error,
      };
    }
  };
  static loginOtp = async (ctx) => {
    try {
      let token;
      let date = new Date();
      let notValid = validate(ctx.request.body, validator.verify());
      if (notValid) throw { message: notValid };
      let user;
      let userId;
      userId = ctx.request.params.userId;

      let otp;
      user = await User.findOne({
        where: { id: userId },
      });
      if (!user) throw { message: `No user found` };
      otp = await Otp.findOne({
        where: { used: false, expired: false, user: user },
      });
      if (!otp) throw { message: `No OTP found, get another one` };

      let year = parseInt(format(otp.createdAt, "yyyy"));
      let month = parseInt(format(otp.createdAt, "M"));
      let day = parseInt(format(otp.createdAt, "d"));
      let hour = parseInt(format(otp.createdAt, "H"));
      let minutes = parseInt(format(otp.createdAt, "m"));
      let seconds = format(otp.createdAt, "s");

      let yearNow = date.getFullYear();
      let monthNow = date.getMonth() + 1;
      let dayNow = date.getDate();
      let hourNow = date.getHours();
      let minutesNow = date.getMinutes();
      let secondsNow = date.getSeconds() + 1;

      if (
        year !== yearNow ||
        month !== monthNow ||
        day !== dayNow ||
        hour !== hourNow ||
        minutesNow - minutes > 4
      ) {
        otp.expired = true;
        await otp.save();
        throw {
          message: `OTP expired, get a new one`,
          user,
        };
      } else {
        if (otp.code !== ctx.request.body.otp)
          throw { message: `Incorrect OTP, try again` };
        token = jwt.sign({ id: user.id }, config.jwtSecret);
        otp.used = true;
        await otp.save();
      }
      ctx.body = {
        status: "Success",
        data: { token: token, user, message: `login successful` },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  //design upload and board creation

  static uploadDesign = async (ctx) => {
    try {
      let boardId;
      let board;
      boardId = ctx.params.boardId;
      board = await Board.findOne({ where: { id: boardId } });
      if (!board) throw { message: `No such board found` };
      if (ctx.request.file == null && ctx.request.body.url == null)
        throw { message: `Please provide a design.` };
      let img;
      let user;
      let design;
      user = ctx.request.user;
      if (ctx.request.body.url) {
        design = await Design.create({
          user,
          url: ctx.request.body.url,
          board,
        });
        await design.save();
      } else {
        let fileName = ctx.file.originalname;
        let path = `./uploads/${fileName}`;
        await cloudinary.uploader.upload(path, function (error, result) {
          img = result.url;
        });
        design = await Design.create({
          user,
          file: img,
          board,
        });
        await design.save();
      }
      ctx.body = {
        status: "Success",
        data: `Design created successfully`,
      };
    } catch (error) {
      ctx.body = {
        data: error,
      };
    }
  };

  static makeBoard = async (ctx) => {
    try {
      console.log("ctx.request.files", ctx.request.files);
      console.log("ctx.files", ctx.files);
      console.log("ctx.request.body", ctx.request.body);
      let notvalid = validate(ctx.request.body, validator.board());
      if (notvalid) throw { message: notvalid };
      let boards;
      let board;
      let user;
      user = ctx.request.user;
      if (ctx.request.body.private == true && user.planPrice === "free")
        throw {
          message: `Please upgrade your account to make a private board`,
        };
      boards = await Board.findOne({ where: { user } });
      if (user.planPrice === "free" && boards)
        throw { message: `Upgrade your account to get unlimited boards` };

      if (ctx.request.body.private == true) {
        board = await Board.create({
          user,
          public: false,
          name: ctx.request.body.name,
        });
        await board.save();
      } else {
        board = await Board.create({
          user,
          public: true,
          name: ctx.request.body.name,
        });
        await board.save();
      }
      ctx.body = {
        status: "Success",
        data: `Board created successfully`,
      };
    } catch (error) {
      ctx.body = {
        data: error,
      };
    }
  };
}
