import userController from "../controllers/user.controller";
import limiter from "../middleware/rateLimiter";
import userAuth from "../middleware/userAuth";
import errHandler from "../middleware/errHandler";
import checkPermission from "../middleware/privilegeCheck"
let router = require("koa-router");
const multer = require("@koa/multer");
const storage = multer.diskStorage({
  destination: function (ctx, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (ctx, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

let route = router();
//user Register, login and verify
route.post("/v1/register", userController.register);
route.post("/v1/verify", limiter, userController.verify);
route.post("/v1/login", userController.login);
route.post("/v1/loginOtp/:userId", userController.loginOtp);

//upload designs and create boards
route.post(
  "/v1/board",
  userAuth,
  errHandler,
  userController.makeBoard
);


route.post(
  "/v1/design/:boardId",
  // userAuth,
  // checkPermission,
  // upload.single("file"),
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

route.post("/v1/thread/:boardId", userAuth, checkPermission , errHandler, userController.makeThread);

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
  upload.single("file"),
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
