const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Post = require("../models/post.models");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config("../.env");
const fs = require("fs");
const path = require("path");
const savedStoryPath = path.join(__dirname, "../img/post");

function isEmail(email) {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (email !== "" && email.match(emailFormat)) {
    return true;
  }
  return false;
}

function isPassword(password) {
  var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (password !== "" && password.match(passwordFormat)) {
    return true;
  }
  return false;
}

const getToken = (headerToken) => {
  try {
    let token = headerToken;
    token = token.split("Bearer ")[1];
    let decoded = jwt.decode(token);
    return decoded.id;
  } catch (err) {
    console.log(err);
  }
};

const addUser = async (req, res) => {
  console.log(req.body);
  try {
    if (
      req.body.name !== "" &&
      req.body.username !== "" &&
      req.body.mobile !== "" &&
      req.body.gender !== ""
    ) {
      if (isEmail(req.body.email)) {
        if (isPassword(req.body.password)) {
          const checkUser = await User.findOne({ username: req.body.username });
          if (checkUser) {
            res.json({ message: "username is already taken" });
          } else {
            const data = new User(req.body);
            const response = await data.save();
            res.status(201).json({
              message: "Registration Done",
              _id: response._id,
              userName: response.username,
              name: response.name,
              email: response.email,
            });
          }
        } else {
          res.json({
            message:
              "Password Must be minimum 8 letters and at least a symbol, upper and lower case letters and a number",
          });
        }
      } else {
        res.json({
          message: "Enter Proper Email..",
        });
      }
    } else {
      res.json({
        message: "Enter Proper Credentials..",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  try {
    if (req.body.username !== "" && req.body.password !== "") {
      const checkUser = await User.findOne({ username: req.body.username });
      console.log(checkUser);
      if (checkUser) {
        let matchPassword = await bcrypt.compare(
          req.body.password,
          checkUser.password
        );
        if (matchPassword) {
          let Token = jwt.sign(
            {
              username: checkUser.username,
              id: checkUser._id,
              email: checkUser.email,
            },
            process.env.ACCESS_TOKEN_SECRET_kEY,
            {
              expiresIn: "1d", // 900s - 15 Min || 1800s - 30 Min
            }
          );
          return res.status(201).json({
            message: "Login Successful",
            userToken: Token,
            User: checkUser.username,
          });
        } else {
          return res.json({ message: "Invalid Password" });
        }
      } else {
        res.status(404).json({ message: "User is not Registered" });
      }
    } else {
      res.json({
        message: "Enter Proper Credentials..",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const getUser = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const getUserDetail = await User.findById({ _id: tokenId }).select(
      "-password"
    );
    res.json({ userDetail: getUserDetail });
  } catch (err) {
    console.log(err);
  }
};

const updateUser = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const getUserDetail = await User.findById({ _id: tokenId }).select(
      "-password"
    );
    if (!getUserDetail)
      return res.status(404).json("The User with the given ID was not found.");
    const updateUserDetail = await User.findByIdAndUpdate(tokenId, req.body, {
      new: true,
    }).select("-password");
    res.json({
      message: "User updated successful",
      updated: updateUserDetail,
    });
  } catch (err) {
    console.log(err);
  }
};

const deleteUser = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const getUserDetail = await User.findById({ _id: tokenId }).select(
      "-password"
    );
    if (!getUserDetail)
      return res
        .status(404)
        .json({ message: "The User with the given ID was not found." });
    const deletedUserDetail = await User.findByIdAndDelete({ _id: tokenId });
    res.json({
      message: "User deleted successful",
      deleted: deletedUserDetail,
    });
  } catch (err) {
    console.log(err);
  }
};

const follow = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const { profileId } = req.body;
    try {
      const checkFollowId = await User.findById({ _id: tokenId }).select(
        "following"
      );
      let followingList = checkFollowId.following;
      console.log(followingList);
      const checkProfileId = followingList.find((elm) => elm == profileId);
      console.log(`this is find element from array ${checkProfileId}`);

      if (checkProfileId) {
        // console.log(`this is in if Condition ${checkProfileId}||${profileId}`);

        console.log(`you are already following this user`);
        res.json({
          message: `you are already following this user ${profileId}`,
        });
      } else {
        let updateFollowing = await User.findOneAndUpdate(
          { _id: tokenId },
          { $push: { following: profileId } }
        );

        let updateFollowers = await User.findOneAndUpdate(
          { _id: profileId },
          { $push: { followers: tokenId } }
        );

        res.json({
          message: `following to ${profileId}`,
          following: updateFollowing._id,
          followers: updateFollowers._id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    console.log(err);
  }
};

const unfollow = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const { profileId } = req.body;
    const checkFollowId = await User.findById({ _id: tokenId }).select(
      "following"
    );
    let followingList = checkFollowId.following;
    console.log(followingList);
    const checkProfileId = followingList.find((elm) => elm == profileId);
    // console.log(`this is find element from array ${checkProfileId}`);
    if (checkProfileId) {
      let updateUnfollwing = await User.findOneAndUpdate(
        { _id: tokenId },
        { $pull: { following: profileId } }
      );
      res.json({
        message: `Unfollow to ${profileId}`,
        following: updateUnfollwing,
      });
    } else {
      res.json({
        message: `You are not following to ${profileId} user, So you can't click on unfollow.`,
        // following: updateUnfollwing,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const addPost = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    // console.log(`decoded: ${decoded.id}`);
    let postFileName, postContent, postText;
    if (req.file === undefined) {
      return res.json({ message: "Something went wrong." });
    } else {
      postFileName = req.file.filename;
      postContent = req.file.mimetype;
      postText = req.body.posttext;
    }
    const obj = {
      text: postText,
      post: { data: postFileName, contentType: postContent },
      user: tokenId,
    };
    try {
      const postData = new Post(obj);
      const response = await postData.save();
      console.log(`response ${response}`);
      // res.send("upload")
      res.status(200).json({ message: "post Uploaded", response: response });
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    console.log(err);
  }
};

const likePost = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const { postId } = req.body;
    try {
      const checkLikeId = await Post.findById({ _id: postId }).select("like");
      let likeList = checkLikeId.like;
      console.log(likeList);
      const checkProfileId = likeList.find((elm) => elm == tokenId);
      if (checkProfileId) {
        console.log(`this is find element from array ${checkProfileId}`);
        console.log(`you are already liked this POST`);
        res.json({
          message: `you are already liked this POST ${postId}`,
        });
      } else {
        let updateLike = await Post.findOneAndUpdate(
          { _id: postId },
          { $push: { like: tokenId } }
        );

        res.json({
          message: `like to ${postId}`,
          like: updateLike._id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    console.log(err);
  }
};

const dislikePost = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const { postId } = req.body;
    try {
      const checkLikeId = await Post.findById({ _id: postId }).select("like");
      let likeList = checkLikeId.like;
      console.log(likeList);
      const checkProfileId = likeList.find((elm) => elm == tokenId);
      if (checkProfileId) {
        let updateLike = await Post.findOneAndUpdate(
          { _id: postId },
          { $pull: { like: tokenId } }
        );
        res.json({
          message: `dislike to ${postId}`,
          like: updateLike.like,
        });
      } else {
        console.log(`this is find element from array ${checkProfileId}`);
        console.log(`you are already Unliked this POST`);
        res.json({
          message: `you are already Un liked this POST ${postId}`,
        });
      }
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    console.log(err);
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.body;
    let tokenId = getToken(req.headers.authorization);
    const getPostDetail = await Post.findById({ _id: postId });
    console.log(getPostDetail);
    if (!getPostDetail)
      return res.status(404).json("The Post with the given ID was not found.");
    const updatePostDetail = await Post.findByIdAndUpdate(postId, req.body, {
      new: true,
    });
    res.json({
      message: "Post updated successful",
      updated: updatePostDetail,
    });
  } catch (err) {
    console.log(err);
  }
};

const deletePost = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const { postId } = req.body;
    const getPostDetail = await Post.findById({ _id: postId });
    if (!getPostDetail) {
      return res
        .status(404)
        .json({ message: "The Post with the given ID was not found." });
    } else {
      fileName = getPostDetail.post.data.toString();
      fs.unlink(
        `${savedStoryPath}/${getPostDetail.user}/${fileName}`,
        (err) => {
          if (err) throw err;
          // if no error, file has been deleted successfully
          console.log(
            `${savedStoryPath}/${getPostDetail.user}/${fileName} File deleted!`
          );
        }
      );
      const deletedPost = await Post.findByIdAndDelete({ _id: postId });
      res.json({
        message: "Post deleted successful",
        deleted: deletedPost,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const getPosts = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const result = {};
    const totalPosts = await Post.countDocuments().exec();
    let startIndex = pageNumber * limit;
    const endIndex = (pageNumber + 1) * limit;
    result.totalPosts = totalPosts;
    if (startIndex > 0) {
      result.previous = {
        pageNumber: pageNumber - 1,
        limit: limit,
      };
    }
    if (endIndex < (await Post.countDocuments().exec())) {
      result.next = {
        pageNumber: pageNumber + 1,
        limit: limit,
      };
    }
    result.data = await Post.find()
      .sort("-_id")
      .skip(startIndex)
      .limit(limit)
      .exec();
    result.rowsPerPage = limit;
    return res.json({ msg: "Posts Fetched successfully", data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Sorry, something went wrong" });
  }
};

module.exports = {
  getUser,
  addUser,
  loginUser,
  updateUser,
  deleteUser,
  follow,
  unfollow,
  addPost,
  likePost,
  dislikePost,
  updatePost,
  deletePost,
  getPosts,
};
