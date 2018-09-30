const express = require("express");
const mongoose = require("mongoose");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const passport = require("passport");
const router = express.Router();
const validatePostInput = require("../../validations/posts");

router.get("/test", (req, res) => res.json({ msg: "it works" }));

// @route   GET api/posts
// @desc    fetch all posts
// @access  Public

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(500).json(err));
});

// @route   GET api/posts/:id
// @desc    fetch posts by id
// @access  Public

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(500).json(err));
});

// @route   POST api/posts
// @desc    create new post
// @access  Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      user: req.user.id,
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar
    });
    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => console.log(err));
  }
);

// @route   DELETE api/posts/:id
// @desc    delete a post
// @access  Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ unauthorized: "can't delete post user unauthorized" });
          }
          post
            .remove()
            .then(res.json({ success: true }))
            .catch(err => {
              res.status(500).json(err);
            });
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
);

// @route   POST api/likes/:id
// @desc    like a post
// @access Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @route   POST api/likes/:id
// @desc    like a post
// @access Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this post" });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @route   POST api/comment/:id
// @desc    add a comment
// @access Private

//validate input
//find if post exixts
//create new comment object
//put it into post object
//save in db

router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          user: req.user.id,
          avatar: req.body.avatar
        };
        post.comments.unshift(newComment);
        post
          .save()
          .then(post => res.json(post))
          .catch(err =>
            res.status(500).json({ dbError: "data base error occured" })
          );
      })
      .catch(err => res.status(404).json({ nopost: "no such post exists" }));
  }
);

// @route   POST api/:id/:comment_id
// @desc    delete a comment
// @access Private

//authenticate
//find if post exixts
//find if comment exists in the post
//find the position of comment to be deleted
//save in db

router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res.status(404).json({ noComment: "no such comment exists" });
        }
        const removeIndex = post.comments
          .map(comment => comment._id.toString())
          .indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        post
          .save()
          .then(posts => res.json(post))
          .catch(err =>
            res
              .status(500)
              .json({ dbError: `following DB error occured : ${err}` })
          );
      })
      .catch(err => res.status(404).json({ noPost: "no such post exixts" }));
  }
);

module.exports = router;
