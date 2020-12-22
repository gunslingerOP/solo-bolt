import userController from "../controllers/user.controller";
import limiter from "../middleware/rateLimiter";
import userAuth from "../middleware/userAuth";
import errHandler from "../middleware/errHandler";


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
  "/v1/design/:boardId",
  userAuth,
 errHandler,
  upload.single("file"),
  userController.uploadDesign
);

route.post(
  "/v1/board",
  userAuth,
  errHandler,
  upload.single("file"),
  userController.makeBoard
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

//Admin routes
route.post("/v1/plan", userController.login);



export default route;
