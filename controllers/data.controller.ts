import { Design } from "../src/entity/design";


export default class dataController{
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