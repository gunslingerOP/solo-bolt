import * as validate from "validate.js";
require("dotenv").config();
import validator from "../helpers/validate";
import {
  emailVerifyOtp,
  hashMyPassword,
  otpGenerator,
  ReEr,
  sendSMS,
} from "../helpers/tools";
import * as jwt from "jsonwebtoken";
import { closestIndexTo, format } from "date-fns";
import { User } from "../src/entity/User";
const streamifier = require("streamifier");

import config from "../config/index";
import { Otp } from "../src/entity/otp";
import { Design } from "../src/entity/design";
import { Board } from "../src/entity/board";
import { async, validators } from "validate.js";
import { Plan } from "../src/entity/plan";
import { basename } from "path";
import { Access } from "../src/entity/access";
import { Comment } from "../src/entity/comment";
import { Thread } from "../src/entity/thread";
import { Following } from "../src/entity/following";
import { Profile } from "../src/entity/profile";
import PhoneFormat from "../helpers/phone.format";
import { profile } from "console";
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
      let body = ctx.request.body;
      let otp;
      let plan;
      let secretCode;
      let email;
      let notValid = validate(ctx.request.body, validator.register());
      if (notValid) throw { message: notValid };
      if (body.phone == false && body.email == false)
        throw { message: `Please provide an email or a phone number` };
      if (body.email) {
        email = await User.findOne({
          where: { email: ctx.request.body.email },
        });
        if (email) throw { message: `This email already exists` };
      }
      if (body.phone) {
        let phoneObj = PhoneFormat.getAllFormats(body.phone);
        if (!phoneObj.isNumber) throw { message: `Invalid phone` };
        let phone = phoneObj.globalP;
      }

      plan = await Plan.findOne({
        where: { name: "free plan" },
      });
      user = await User.create({
        ...ctx.request.body,
        plan,
        verified: false,
        planPrice: plan.price,
      });
      await user.save();
      secretCode = await otpGenerator();
      otp = await Otp.create({
        expired: false,
        code: secretCode,
        used: false,
        type: `Register`,
        user,
      });
      await otp.save();
      if (user.email) {
        email = user.email;
        emailVerifyOtp(email, secretCode, `Registration`);
      }
      if (user.phone) {
        sendSMS(`Your otp for registration is ${secretCode}`, user.phone);
      }
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

  static changeCredentials = async (ctx) => {
    try {
      let secretCode;
      let otp;
      let user;
      let message;
      user = ctx.request.user;
      let body = ctx.request.body;
      let notValid = validate(ctx.request.body, validator.changeCredentials());
      if (notValid) throw { message: notValid };
      if (body.newEmail && body.newPhone)
        throw {
          message: `Please provide an email or a phone number, not both.`,
        };
      if (!body.newEmail && !body.newPhone)
        throw {
          message: `Please provide a new email or a new phone to set as yours`,
        };
      secretCode = await otpGenerator();
      otp = await Otp.create({
        expired: false,
        code: secretCode,
        used: false,
        type: `Reset`,
        user,
      });
      await otp.save();

      if (body.newEmail) {
        emailVerifyOtp(body.newEmail, secretCode, `resetting your email`);
        message = `An email reset OTP has been sent to your new email address`;
      }

      if (body.newPhone) {
        sendSMS(
          `The otp for resetting your phone number is ${secretCode}`,
          body.newPhone
        );
        message = `An OTP has been sent to your new phone number`;
      }

      ctx.body = {
        status: `Success`,
        data: message,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static verifyCredentials = async (ctx) => {
    try {
      let body = ctx.request.body;
      let secretCode;
      let email;
      let message;
      let phone;
      let notValid = validate(ctx.request.body, validator.verifyCredentials());
      if (notValid) throw { message: notValid };
      if (body.email == false && body.email == false)
        throw { message: `Please provide an email or a phone number` };
      if (body.email && body.phone)
        throw {
          message: `Please provide an email or a phone number, not both.`,
        };
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
      let otp;
      let user;
      user = ctx.request.user;
      otp = await Otp.findOne({
        where: { used: false, expired: false, user: user, type: `Reset` },
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
          type: `Reset`,
          user,
        });
        await otp.save();
        if (body.email) {
          email = body.email;
          emailVerifyOtp(email, secretCode, `Email reset`);
          throw {
            message: `OTP expired, a new one has been sent to your email address`,
          };
        }
        if (body.phone) {
          phone = body.phone;
          sendSMS(`Your new OTP is ${secretCode}`, phone);
          throw {
            message: `OTP expired, a new one has been sent to your phone number`,
          };
        }
      } else {
        if (otp.code !== ctx.request.body.otp)
          throw { message: `Incorrect OTP, try again` };
        if (body.email) {
          user.email = body.email;
          await user.save();
          message = `Your email address for this account is now ${body.email}`;
        }
        if (body.phone) {
          user.phone = body.phone;
          await user.save();
          message = `Your new phone number for this account is ${body.phone}`;
        }
        otp.used = true;
        await otp.save();
      }
      ctx.body = {
        status: "Success",
        data: { message },
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
      let otp;
      let phone;
      let body = ctx.request.body;
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

      otp = await Otp.findOne({
        where: { used: false, expired: false, user: user, type: "Register" },
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
        if (body.email) {
          email = body.email;
          emailVerifyOtp(email, secretCode, `Email reset`);
          throw {
            message: `OTP expired, a new one has been sent to your email address`,
          };
        } else if (body.phone) {
          phone = body.phone;
          sendSMS(`Your new OTP is ${secretCode}`, phone);
          throw {
            message: `OTP expired, a new one has been sent to your phone number`,
          };
        }
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
      let body = ctx.request.body;
      let email;
      let phone;
      let otp;
      let user;
      let message;
      let notValid = validate(ctx.request.body, validator.login());
      if (notValid) throw { message: notValid };
      if (body.email == false && body.phone == false)
        throw { message: `Please provide a phone number or an email` };
      if (body.email) {
        user = await User.findOne({ where: { email: body.email } });
        if (!user) throw { message: `No user found` };
      }

      if (body.email) {
        user = await User.findOne({ where: { phone: body.phone } });
        if (!user) throw { message: `No user found` };
      }

      if (!user.verified) throw { message: `Verify your account first` };

      otp = await Otp.findOne({
        where: { used: false, expired: false, user: user },
      });
      if (otp) throw { message: `You already have an active OTP` };
      secretCode = await otpGenerator(5);
      otp = await Otp.create({
        expired: false,
        code: secretCode,
        used: false,
        type: `Login`,
        user,
      });
      await otp.save();
      if (body.email) {
        email = user.email;
        emailVerifyOtp(email, secretCode, `login`);
        message = `An email with the login OTP has been sent to your email address`;
      }
      if (body.phone) {
        phone = user.phone;
        sendSMS(`Your login OTP is ${secretCode}`, phone);
        message = `An SMS with the login OTP has been sent to your number`;
      }

      ctx.body = {
        status: "Success",
        data: { user, message },
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
        where: { used: false, expired: false, user: user, type: `Login` },
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

  static changeProfile = async (ctx) => {
    try {
      if (!ctx.request.files) throw { message: `Please send an image` };
      let user = ctx.request.user;
      let filename = ctx.request.files.file.path;
      let url;
      let profile;
      await cloudinary.uploader
        .upload(filename, { tags: "gotemps", resource_type: "auto" })
        .then(function (file) {
          url = file.url;
        })
        .catch(function (err) {
          if (err) {
            return ReEr(ctx, err);
          }
        });
      profile = await Profile.create({
        url,
        user,
      }).save();

      ctx.body = {
        status: `Success`,
        data: { profile },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static deleteProfile = async (ctx) => {
    try {
      let profile;
      if (!ctx.request.params.profileId)
        throw { message: `Please send a profileId as request params` };
      let user = ctx.request.user;
      let profileId = ctx.request.params.profileId;
      profile = await Profile.findOne({ where: { id: profileId, user } });
      if (!profile) throw { message: `No profile image found` };

      if (profile) {
        await Profile.delete({ id: profileId, user });
      }

      ctx.body = {
        status: `Success`,
        data: `Profile image deleted successfully`,
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
      let board;
      let img;
      let user;
      let design;
      let access;

      let length = Object.keys(ctx.request.body).length;
      access = ctx.request.access;
      board = ctx.request.board;

      user = ctx.request.user;

      if (access) {
        if (access.type != 3)
          throw { message: `You are not allowed to add designs` };
      }
      if (board.author != user.id)
        throw { message: `You have no access to this board` };

      if (!ctx.request.files) {
        if (length == 0)
          return ReEr(ctx, `Please provide a design as a file or a URL`);
        let notValid = validate(ctx.request.body, validator.url());
        if (notValid) throw { message: notValid };
      }

      if (ctx.request.body.url) {
        design = await Design.create({
          user,
          url: ctx.request.body.url,
          board,
        });
        if (!design) return ReEr(ctx, `Design wasn't created`);
        await design.save();
      } else {
        let filename = ctx.request.files.file.path;

        await cloudinary.uploader
          .upload(filename, { tags: "gotemps", resource_type: "auto" })
          .then(function (file) {
            img = file.url;
          })
          .catch(function (err) {
            if (err) {
              return ReEr(ctx, err);
            }
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
        data: { design },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static uploadDesignComment = async (ctx) => {
    try {
      let commentId;
      let comment;
      let img;
      let access;
      let user;
      let design;
      let length = Object.keys(ctx.request.body).length;
      access = ctx.request.access;
      user = ctx.request.user;
      commentId = ctx.params.commentId;
      if (access) {
        if (access.type != 2 && access.type != 3)
          return ReEr(
            ctx,
            `You do not have permission to comment on this board`
          );
      }
      if (!ctx.request.files) {
        if (length == 0)
          return ReEr(ctx, `Please provide a design as a file or a URL`);
        let notValid = validate(ctx.request.body, validator.url());
        if (notValid) throw { message: notValid };
      }
      comment = await Comment.findOne({ where: { id: commentId, user } });
      if (!comment) throw { message: `No comment found` };
      if (ctx.request.body.url) {
        design = await Design.create({
          user,
          url: ctx.request.body.url,
          comment,
        });
        await design.save();
      } else {
        let filename = ctx.request.files.file.path;
        await cloudinary.uploader
          .upload(filename, { tags: "gotemps", resource_type: "auto" })
          .then(function (file) {
            img = file.url;
          })
          .catch(function (err) {
            if (err) {
              return ReEr(ctx, err);
            }
          });
        design = await Design.create({
          user,
          file: img,
          comment,
        });
        await design.save();
      }
      ctx.body = {
        status: "Success",
        data: { design: design },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static makeBoard = async (ctx) => {
    try {
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
      boards = await Board.findOne({ where: { author: user.id } });
      if (user.planPrice === "free" && boards)
        throw { message: `Upgrade your account to get unlimited boards` };

      if (ctx.request.body.private == true) {
        board = await Board.create({
          public: false,
          name: ctx.request.body.name,
          author: user.id,
          user,
        });
        await board.save();
        board = await Board.findOne({
          where: { id: board.id },
          relations: ["user"],
        });
      } else {
        board = await Board.create({
          public: true,
          name: ctx.request.body.name,
          author: user.id,
          user,
        });
        await board.save();
        board = await Board.findOne({
          where: { id: board.id },
          relations: ["user"],
        });
      }
      ctx.body = {
        status: "Success",
        data: { Board: board },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static addCollaboratorView = async (ctx) => {
    try {
      let notvalid = validate(ctx.request.body, validator.access());
      if (notvalid) throw { message: notvalid };
      let board;
      let user;
      let userToAdd;
      let accessTicket;
      user = ctx.request.user;
      board = await Board.findOne({
        where: { id: ctx.request.params.boardId },
      });
      if (!board) throw { message: `No such board found` };

      if (board.public == true)
        throw {
          message: `This board is already public, share the link with others so they can view it`,
        };
      if (!board.author == user.id)
        throw { message: `You're not the owner of this board` };

      userToAdd = await User.findOne({
        where: { email: ctx.request.body.userEmail },
      });
      if (userToAdd.id == user.id)
        throw { message: `You're already the owner of this board` };

      if (!userToAdd) throw { message: `No such user found` };
      accessTicket = await Access.findOne({
        where: { userId: userToAdd.id, board },
      });
      if (!accessTicket) {
        accessTicket = await Access.create({
          userId: userToAdd.id,
          board,
          type: 2,
        }).save();
      }
      accessTicket.type = 2;
      await accessTicket.save();
      ctx.body = {
        status: "Success",
        data: `User ${userToAdd.name} can now view your board`,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static addCollaboratorComment = async (ctx) => {
    try {
      let notvalid = validate(ctx.request.body, validator.access());
      if (notvalid) throw { message: notvalid };
      let board;
      let user;
      let userToAdd;
      let accessTicket;
      board = await Board.findOne({
        where: { id: ctx.request.params.boardId },
      });
      if (!board) throw { message: `No such board found` };
      if (board.public)
        throw {
          message: `This board is already public, share the link with others so they can view it`,
        };
      user = ctx.request.user;
      if (!board.author == user.id)
        throw { message: `You're not the owner of this board` };
      userToAdd = await User.findOne({
        where: { email: ctx.request.body.userEmail },
      });
      if (userToAdd.id == user.id)
        throw { message: `You're already the owner of this board` };

      if (!userToAdd) throw { message: `No such user found` };
      accessTicket = await Access.findOne({
        where: { userId: userToAdd.id, board },
      });
      if (!accessTicket) {
        accessTicket = await Access.create({
          userId: userToAdd.id,
          board,
          type: 2,
        }).save();
      }
      accessTicket.type = 2;
      await accessTicket.save();
      ctx.body = {
        status: "Success",
        data: `User ${userToAdd.name} can now comment on your board`,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static addCollaborator = async (ctx) => {
    try {
      let notvalid = validate(ctx.request.body, validator.access());
      if (notvalid) throw { message: notvalid };
      let board;
      let user;
      let userToAdd;
      let accessTicket;
      board = await Board.findOne({
        where: { id: ctx.request.params.boardId },
      });
      if (!board) throw { message: `No such board found` };
      user = ctx.request.user;
      if (!board.author == user.id)
        throw { message: `You're not the owner of this board` };

      userToAdd = await User.findOne({
        where: { email: ctx.request.body.userEmail },
      });
      if (userToAdd.id == user.id)
        throw { message: `You're already the owner of this board` };
      if (!userToAdd) throw { message: `No such user found` };
      accessTicket = await Access.findOne({
        where: { userId: userToAdd.id, board },
      });
      if (!accessTicket) {
        accessTicket = await Access.create({
          userId: userToAdd.id,
          board,
          type: 3,
        }).save();
      }
      accessTicket.type = 3;
      await accessTicket.save();
      ctx.body = {
        status: "Success",
        data: `User ${userToAdd.name} is now a collaborator`,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static makeThread = async (ctx) => {
    try {
      let notvalid = validate(ctx.request.body, validator.thread());
      if (notvalid) throw { message: notvalid };
      let body = ctx.request.body;
      let designId;
      let design;
      let board;
      let thread;
      let comment;
      let user;
      user = ctx.request.user;
      board = ctx.request.board;
      if (body.domElement == null && body.location == null)
        throw { message: `Please provide a location for the thread` };
      designId = ctx.request.params.designId;
      if (!designId) throw { message: `please provide a designId as params` };
      design = await Design.findOne({ where: { id: designId, board } });
      if (!design) throw { message: `No such design found` };
      thread = await Thread.findOne({
        where: [
          { location: body.location, design },
          { domElement: body.domElement, design },
        ],
      });
      if (thread) throw { message: `Thread already exists here` };

      thread = await Thread.create({
        edited: false,
        review: false,
        completed: false,
        domElement: body.domElement,
        location: body.location,
        design,
      }).save();

      comment = await Comment.create({
        text: body.text,
        completed: false,
        review: false,
        edited: false,
        thread,
        user,
      }).save();

      ctx.body = {
        status: "Success",
        data: { comment: comment },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static addComment = async (ctx) => {
    try {
      let threadId = ctx.request.params.threadId;
      if (!threadId) throw { message: `Please send threadId as params` };
      let notvalid = validate(ctx.request.body, validator.comment());
      if (notvalid) throw { message: notvalid };
      let body = ctx.request.body;
      let thread;
      let access;
      let board;
      let user;
      let comment;
      access = ctx.request.access;
      board = ctx.request.board;
      user = ctx.request.user;
      thread = await Thread.findOne({ where: { id: threadId } });
      if (!thread) throw { message: `No thread found` };
      if (access.type != 2 && access.type != 3 && board.author != user.id)
        throw { message: `You don't have permission to comment` };
      comment = await Comment.create({
        text: body.text,
        completed: false,
        review: false,
        edited: false,
        thread,
        user,
      }).save();
      ctx.body = {
        status: "Success",
        data: { comment: comment },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static addBoardComment = async (ctx) => {
    try {
      let body = ctx.request.body;
      let access;
      let board;
      let user;
      let comment;

      access = ctx.request.access;
      board = ctx.request.board;
      user = ctx.request.user;

      if (!board.public) {
        if (access.type != 2 && access.type != 3 && board.author != user.id)
          throw { message: `You don't have permission to comment` };
      }

      comment = await Comment.create({
        text: body.text,
        completed: false,
        review: false,
        edited: false,
        board,
        user,
      }).save();
      ctx.body = {
        status: "Success",
        data: { comment: comment },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static setComment = async (ctx) => {
    try {
      let notvalid = validate(ctx.request.body, validator.setComment());
      if (notvalid) throw { message: notvalid };
      let comment;
      let body = ctx.request.body;
      let access = ctx.request.access;
      let board = ctx.request.board;
      let date = new Date();
      let user = ctx.request.user;
      let commentId = ctx.request.params.commentId;
      comment = await Comment.findOne({ where: { id: commentId } });
      if (!comment) throw { message: `No comment found` };
      if (access) {
        if (access.type != 3)
          return ReEr(ctx, `You do not have designer permissions`);
      }
      if (user.id != board.author)
        throw { message: `You do not have designer permissions` };
      if (comment.inProgress != body.inProgress) {
        comment.inProgress = body.inProgress;
        await comment.save();
      } else if (comment.review != body.review) {
        comment.review = body.review;
        await comment.save();
      } else if (comment.completed != body.completed) {
        comment.completed = body.completed;
        await comment.save();
      } else {
        throw { message: `No change in comment state detected!` };
      }

      ctx.body = {
        status: `Success`,
        data: comment,
        user,
        date,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static followBoard = async (ctx) => {
    try {
      let notvalid = validate(ctx.request.body, validator.followBoard());
      if (notvalid) throw { message: notvalid };
      let follow;
      let user = ctx.request.user;
      follow = await Following.create({
        boardId: ctx.request.body,
        user,
      }).save();
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static unfollowBoard = async (ctx) => {
    try {
      let notvalid = validate(ctx.request.body, validator.followBoard());
      if (notvalid) throw { message: notvalid };
      let follow;
      let user = ctx.request.user;
      follow = await Following.delete({
        boardId: ctx.request.body,
        user,
      });
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };
}
