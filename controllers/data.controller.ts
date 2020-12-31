import { async } from "validate.js";
import { paginate } from "../helpers/tools";
import { Access } from "../src/entity/access";
import { Board } from "../src/entity/board";
import { Comment } from "../src/entity/comment";
import { Design } from "../src/entity/design";
import { Following } from "../src/entity/following";
import { Thread } from "../src/entity/thread";
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
            designs:"comments.designs"
          },
        },
      });
      accesses = await Access.find({ where: { board, type: 3, active: true } });
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

  static getBoardsFollowing = async (ctx) => {
    try {
      let user = ctx.request.user;
      let boards;
      let following;
      let ids=[]
      let { p, s } = ctx.request.query;
      let { take, skip } = paginate(p, s);
      following = await Following.find({where:{user}});
      if(!following) throw {message:`You're not following any board`}
for(let el of following){
  ids.push(el.boardId)

}      
      boards = await Board.findByIds(ids)
      if(boards.length==0) throw {message:`You haven't followed any boards yet`}
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

  static getComments = async (ctx) => {
    try {
      let comments
      let totalComments
     let designId = ctx.request.params.designId
     if(!designId) throw{message:`Provide a design id`}
     let design
     let threads
     design= await Design.findOne({where:{id:designId}})
     if(!design) throw{message:`No design found`}
      threads = await Thread.find({where:{design}})
      for(let thread of threads){
        totalComments=[]
        comments = await Comment.find({where:{thread}})
        totalComments.push(comments)
      }
      
      ctx.body = {
        status: `Success`,
        data: totalComments,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };

  static getCommentDesign = async (ctx) => {
    try {
     let comment
     let design
      let commentId = ctx.request.params.commentId
     if(!commentId) throw{message:`Please provide a comment id in the params`}
comment = await Comment.findOne({where:{id:commentId}})
if(!comment) throw {message:`No comment found`}
design = await Design.find({where:{comment}})
if(!design) throw {message:`There are no designs for this comment`}
      ctx.body = {
        status: `Success`,
        data: design,
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
