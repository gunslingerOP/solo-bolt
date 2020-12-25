import * as validate from "validate.js";
require("dotenv").config();
import validator from "../helpers/validate";
import {
  emailVerifyOtp,
  hashMyPassword,
  otpGenerator,
  ReEr,
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
      let board;
      let img;
      let user;
      let design;
      let access;
      access = ctx.request.access;
      board = ctx.request.board;
      console.log(`function works`);
      
      // console.log(ctx.request.files); // if multipart or urlencoded
      if (ctx.request.files.file.path == null && ctx.request.body.url == null)
        throw { message: `Please provide a design.` };

      user = ctx.request.user;

      if (access) {
        if (access.type != 3)
          throw { message: `You are not allowed to add designs` };
      }
      if (board.author != user.id)
        throw { message: `You have no access to this board` };

      if (ctx.request.body.url) {
        design = await Design.create({
          user,
          url: ctx.request.body.url,
          board,
        });
        await design.save();
      } else {
        // img = ctx.request.file.path;
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
      let user;
      let design;
      user = ctx.request.user;
      commentId = ctx.params.commentId;
      if (ctx.request.file == null && ctx.request.body.url == null)
        throw { message: `Please provide a design.` };
      comment = await Comment.findOne({ where: { id: commentId } });
      if (!comment) throw { message: `No comment found` };
      if (ctx.request.body.url) {
        design = await Design.create({
          user,
          url: ctx.request.body.url,
          comment,
        });
        await design.save();
      } else {
        let filename = ctx.request.files[0].path;
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
      designId = ctx.request.query.designId;
      if (!designId) throw { message: `please provide a designId as a query` };
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
      let body = ctx.request.body;
      let thread;
      let access;
      let board;
      let user;
      let comment;
      let threadId = ctx.request.query.threadId;
      if (!threadId) throw { message: `Please send threadId as query` };
      thread = await Thread.findOne({ where: { id: threadId } });
      if (!thread) throw { message: `No thread found` };
      access = ctx.request.access;
      board = ctx.request.board;
      user = ctx.request.user;
      if (access != 2 && access != 3 && board.author != user.id)
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

      if(!board.public){
        if (access != 2 && access != 3 && board.author != user.id)
        throw { message: `You don't have permission to comment` };
      }
      console.log(ctx.request.body);
      
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

  //get functions
  static getBoardAll = async (ctx) => {
    try {
      let user;
      let board;
      let design;
      user = ctx.request.user;
      board = ctx.request.board;
      design = await Design.find({
        where: { board },
        join: {
          alias: "design",
          leftJoinAndSelect: {
            threads: "design.threads",
            comments: "threads.comments",
          },
        },
      });

      ctx.body = {
        status: `Success`,
        data: { board: board, design: design },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };
}
