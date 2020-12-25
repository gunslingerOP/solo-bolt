import { ReEr } from "../helpers/tools";
import { Access } from "../src/entity/access";
import { Board } from "../src/entity/board";

let checkPermission: any;
export default checkPermission = async (ctx, next) => {
  try {
    let access;
    let board;
    let user;
    let boardId;
    boardId = ctx.request.params.boardId;
    user = ctx.request.user;

    board = await Board.findOne({ where: { id: boardId } });
    
    if (!board) return ReEr(ctx,{message: `No board found`} )
    
    ctx.request.board = board;
    if (!board.public) {
        access = await Access.findOne({ where: { board, userId: user.id } });    
        if (!access && board.author != user.id)
        return ReEr(ctx,{ message: `You do not have permission to view this board` } )
        if(access){
            ctx.request.access = access;
            
        }
    }
    await next();
} catch (error) {
    ctx.status = 400;
    ctx.body = {
        status: `Failed`,
        data: error,
    };
}
};
