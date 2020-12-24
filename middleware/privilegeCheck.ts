import config from "../config/index";
import { Access } from "../src/entity/access";
import { Board } from "../src/entity/board";

let checkPermission: any;
export default checkPermission = async (ctx, next)=> {
  try {
    let access;
    let board;
    let user;
    let boardId;
    boardId = ctx.request.params.boardId;
    user = ctx.request.user;

    board = await Board.findOne({ where: { id: boardId } });
    if (!board) throw { message: `No board found` };
    ctx.request.board = board;
    if (!board.public) {
      if (board.author == user.id)   return await next();


      access = await Access.findOne({ where: { board, userId: user.id } });
      if (!access)
        throw { message: `You do not have permission to view this board` };
      ctx.request.access = access;
    }

    return await next();
} catch (error) {
    ctx.status = 400;
    ctx.body = {
      status: `Failed`,
      data: error,
    };
  }
};
