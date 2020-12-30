import userController from "../controllers/user.controller";
import limiter from "../middleware/rateLimiter";
import userAuth from "../middleware/userAuth";
import errHandler from "../middleware/errHandler";
import checkPermission from "../middleware/privilegeCheck";
import dataController from "../controllers/data.controller";
let router = require("koa-router");

let route = router();
//user Register, login, verify and profile image
route.post("/v1/register", userController.register);
route.post("/v1/verify", limiter, userController.verify);
route.post("/v1/login", userController.login);
route.post("/v1/loginOtp/:userId", userController.loginOtp);
route.post("/v1/credentials/change",userAuth, userController.changeCredentials);
route.post("/v1/credentials/change/otp",userAuth, userController.verifyCredentials);
route.post("/v1/profile/change",userAuth, userController.changeProfile);
route.delete("/v1/profile/delete/:profileId",userAuth, userController.deleteProfile);


//upload designs and create boards
route.post("/v1/board", userAuth, errHandler, userController.makeBoard);

route.post(
  "/v1/design/:boardId",
  userAuth,
  checkPermission,
  userController.uploadDesign
);

//add or remove collaborators
route.post(
  "/v1/collaborator/view/:boardId",
  userAuth,
  userController.addCollaboratorView
);

route.post(
  "/v1/collaborator/comment/:boardId",
  userAuth,
  userController.addCollaboratorComment
);

route.post(
  "/v1/collaborator/:boardId",
  userAuth,
  userController.addCollaborator
);

route.post(
  "/v1/collaborator/remove/:boardId/:collaboratorId",
  userAuth,
  userController.removePermission
);

//adding comments with their designs to boards and board designs

route.post(
  "/v1/board/design/thread/:boardId/:designId",
  userAuth,
  checkPermission,
  errHandler,
  userController.makeThread
);

route.post(
  "/v1/thread/comment/:boardId/:threadId",
  userAuth,
  checkPermission,
  errHandler,
  userController.addComment
);

route.post(
  "/v1/board/comment/design/:boardId/:commentId",
  userAuth,
  checkPermission,
  errHandler,
  userController.uploadDesignComment
);

route.post(
  "/v1/board/comment/:boardId",
  userAuth,
  checkPermission,
  errHandler,
  userController.addBoardComment
);



//change comment status

route.post(
  "/v1/comment/status/:commentId/:boardId",
  errHandler,
  userAuth,
  checkPermission,
  userController.setComment
);


//follow/unfollow a board
route.post(
  "/v1/board/follow/:boardId",
  errHandler,
  userAuth,
  checkPermission,
  userController.followBoard
);

route.post(
  "/v1/board/unfollow/:boardId",
  errHandler,
  userAuth,
  checkPermission,
  userController.unfollowBoard
);



//get functions

//get boards with their designs, threads and comments
route.get(
  "/v1/board/:boardId",
  errHandler,
  userAuth,
  checkPermission,
  dataController.getBoardAll
);

route.get(
  "/v1/boards",
  errHandler,
  userAuth,
  dataController.getBoardsOwned
);


//get the boards a user is actively following

route.get(
  "/v1/boards/following",
  errHandler,
  userAuth,
  dataController.getBoardsFollowing
);

//Admin routes
route.post("/v1/plan", userController.login);

export default route;
