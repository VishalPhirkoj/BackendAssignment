const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authorization = require("../middlewares/auth.middleware");

router.post("/userAdd", userController.addUser);

router.post("/userLogin", userController.loginUser);

router.get("/userDetail", authorization.authorization, userController.getUser);

router.patch(
  "/userUpdate",
  authorization.authorization,
  userController.updateUser
);

router.delete(
  "/userDelete",
  authorization.authorization,
  userController.deleteUser
);

router.post("/userFollow", authorization.authorization, userController.follow);

router.post(
  "/userUnfollow",
  authorization.authorization,
  userController.unfollow
);

router.post(
  "/userDetailUpdate",
  authorization.authorization,
  userController.updateUser
);

router.post(
  "/postAdd",
  authorization.authorization,
  authorization.uploadPost.single("post"),
  userController.addPost
);

router.post("/postLike", authorization.authorization, userController.likePost);

router.post(
  "/postDislike",
  authorization.authorization,
  userController.dislikePost
);

router.patch(
  "/postUpdate",
  authorization.authorization,
  userController.updatePost
);

router.delete(
  "/postDelete",
  authorization.authorization,
  userController.deletePost
);

router.get("/postsGet", userController.getPosts);

module.exports = router;
