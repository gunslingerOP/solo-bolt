import { async } from "validate.js";
import { paginate } from "../helpers/tools";
import { Access } from "../src/entity/access";
import { Board } from "../src/entity/board";
import { Design } from "../src/entity/design";
import { User } from "../src/entity/User";

export default class dataController {
  static getBoardAll = async (ctx) => {
    try {
      let user;
      let collabs;
      let board;
      let accesses;
      let collaborators;
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
      accesses = await Access.find({ where: { board, type: 3, active:true } });
      if (accesses) {
        collabs = [];
        for (let el of accesses) {
          collaborators = await User.findOne(el.userId);

          collabs.push(collaborators);
        }
      }
      if (!accesses) {
        collabs = `No collaborators for this board`;
      }

      ctx.body = {
        status: `Success`,
        data: { collabs, board: board, designs: design },
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static getBoardsOwned = async (ctx) => {
    try {
      let user = ctx.request.user;
      let boards;
      let { p, s } = ctx.request.query;
      let { take, skip } = paginate(p, s);
      boards = await Board.findAndCount({
        where: { user, author: user.id },
        take,
        skip,
      });
      ctx.body = {
        status: `Success`,
        data: { boards },
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
