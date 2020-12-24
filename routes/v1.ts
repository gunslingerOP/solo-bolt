import userController from "../controllers/user.controller";
import limiter from "../middleware/rateLimiter";
import userAuth from "../middleware/userAuth";
import errHandler from "../middleware/errHandler";
import checkPermission from "../middleware/privilegeCheck";
let router = require("koa-router");
var cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require("@koa/multer");


// var storage = cloudinaryStorage({
//   cloudinary: cloudinary,
//   folder: "demo",
//   allowedFormats: ["jpg", "png"],
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   folder: 'jomwedding',
//   allowedFormats: ['jpg', 'png'],
// });
// const upload = multer().single("file");

let route = router();
//user Register, login and verify
route.post("/v1/register", userController.register);
route.post("/v1/verify", limiter, userController.verify);
route.post("/v1/login", userController.login);
route.post("/v1/loginOtp/:userId", userController.loginOtp);

//upload designs and create boards
route.post("/v1/board", userAuth, errHandler, userController.makeBoard);

route.post(
  "/v1/design/:boardId",
  userAuth,
  checkPermission,
  upload,
  userController.uploadDesign
);

//upload collaborators
route.post(
  "/v1/collaborator/view/:boardId",
  userAuth,
  errHandler,
  userController.addCollaboratorView
);

route.post(
  "/v1/collaborator/comment/:boardId",
  userAuth,
  errHandler,
  userController.addCollaboratorComment
);

route.post(
  "/v1/collaborator/:boardId",
  userAuth,
  errHandler,
  userController.addCollaborator
);

//adding comments with their designs to boards and board designs

route.post(
  "/v1/thread/:boardId",
  userAuth,
  checkPermission,
  errHandler,
  userController.makeThread
);

route.post(
  "/v1/comment/:boardId",
  userAuth,
  checkPermission,
  errHandler,
  userController.addComment
);

route.post(
  "/v1/design/comment/:commentId",
  userAuth,
  checkPermission,
  errHandler,
  upload,
  userController.uploadDesignComment
);

route.post(
  "/v1/board/comment/:boardId",
  userAuth,
  checkPermission,
  errHandler,
  userController.addBoardComment
);

//get boards with their designs, threads and comments

route.get(
  "/v1/board/:boardId",
  errHandler,
  userAuth,
  checkPermission,
  userController.getBoardAll
);

//Admin routes
route.post("/v1/plan", userController.login);

export default route;
