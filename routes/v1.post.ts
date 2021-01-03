import userController from "../controllers/user.controller";
import limiter from "../middleware/rateLimiter";
import userAuth from "../middleware/userAuth";
import checkPermission from "../middleware/privilegeCheck";
import dataController from "../controllers/data.controller";
import otpChecker from "../middleware/otpChecker";
import checkToken from "../middleware/otpChecker";
let router = require("koa-router");

let route = router({
  prefix:'/v1'
});
//user Register, login, verify and profile image
route.post("/register", userController.register);
route.post("/verify",checkToken, userController.verify);
route.post("/login", userController.login);
route.post("/otp/:userId",checkToken, userController.loginOtp);
route.post("/credentials/change",userAuth, userController.changeCredentials);
route.post("/credentials/change/otp",userAuth, userController.verifyCredentials);
route.post("/profile/change",userAuth, userController.changeProfile);
route.delete("/profile/delete/:profileId",userAuth, userController.deleteProfile);


//upload designs and create boards
route.post("/board", userAuth, userController.makeBoard);

route.post(
  "/design/:boardId",
  userAuth,
  checkPermission,
  userController.uploadDesign
);

//add or remove collaborators
route.post(
  "/collaborator/view/:boardId",
  userAuth,
  userController.addCollaboratorView
);

route.post(
  "/collaborator/comment/:boardId",
  userAuth,
  userController.addCollaboratorComment
);

route.post(
  "/collaborator/:boardId",
  userAuth,
  userController.addCollaborator
);

route.post(
  "/collaborator/remove/:boardId/:collaboratorId",
  userAuth,
  userController.removePermission
);

//adding comments with their designs to boards and board designs

route.post(
  "/design/thread/:boardId/:designId",
  userAuth,
  checkPermission,

  userController.makeThread
);

route.post(
  "/thread/comment/:boardId/:threadId",
  userAuth,
  checkPermission,
  userController.addComment
);

route.post(
  "/board/comment/design/:boardId/:commentId",
  userAuth,
  checkPermission,

  userController.uploadDesignComment
);

route.post(
  "/board/comment/:boardId",
  userAuth,
  checkPermission,
  userController.addBoardComment
);



//change comment status

route.post(
  "/comment/status/:commentId/:boardId",
  userAuth,
  checkPermission,
  userController.setComment
);


//follow/unfollow a board
route.post(
  "/board/follow/:boardId",
  userAuth,
  checkPermission,
  userController.followBoard
);

route.post(
  "/board/unfollow/:boardId",
  userAuth,
  checkPermission,
  userController.unfollowBoard
);



//get functions

//get boards with their designs, threads and comments
route.get(
  "/board/:boardId",
  userAuth,
  checkPermission,
  dataController.getBoardAll
);

route.get(
  "/boards",

  userAuth,
  dataController.getBoardsOwned
);


//get the boards a user is actively following

route.get(
  "/boards/following",
  userAuth,
  dataController.getBoardsFollowing
);


//get comments for a design

route.get(
  "/design/comments/:boardId/:designId",
  userAuth,
  checkPermission,
  dataController.getComments
);



//Admin routes
route.post("/plan", userController.login);

export default route;
