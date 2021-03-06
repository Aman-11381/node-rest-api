const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User")

// create post
router.post("/", async(req, res)=>{
    const newPost = new Post(req.body);
    try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch(err) {
        res.status(500).json(err);
    }
});

// update post
router.put("/:id", async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        // check if the post to be updated is of the current user or not
        if(post.userId === req.body.userId){
            await post.updateOne({
                $set: req.body
            });
            res.status(200).json("Post updated successfully.");
        } else {
            res.status(403).json("You can update only your post.");
        }

    } catch(err) {
        res.status(500).json(err);
    }
});

// delete post
router.delete("/:id", async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        // check if the post to be updated is of the current user or not
        if(post.userId === req.body.userId){
            await post.deleteOne();
            res.status(200).json("Post deleted successfully.");
        } else {
            res.status(403).json("You can delete only your post.");
        }

    } catch(err) {
        res.status(500).json(err);
    }
});

// like and dislike post
router.put("/:id/like", async(req, res)=> {
    try {

        const post = await Post.findById(req.params.id);

        // check if the post is already liked by the current user
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({
                $push: {likes: req.body.userId}
            });
            res.status(200).json("Post liked successfully.");
        
        // dislike the post
        } else {
            await post.updateOne({
                $pull: {likes: req.body.userId}
            });
            res.status(200).json("Post disliked successfully.");
        }

    } catch(err) {
        res.status(500).json(err);
    }
})

// get a post
router.get("/:id", async(req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch(err) {
        res.status(500).json(err);
    }
})

// get timeline posts
router.get("/timeline/:userId", async(req, res)=>{
    try {

        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({userId: currentUser._id});
        
        // get all the posts of the users the current user is following
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({userId: friendId});
            })
        )

        // return posts of current user as well as the users he/she is following
        res.status(200).json(userPosts.concat(...friendPosts));

    } catch(err) {
        res.status(500).json(err);
    }
})

// get user's all posts
router.get("/profile/:username", async(req, res)=>{
    try {

        const user = await User.findOne({username:req.params.username});
        const posts = await Post.find({userId:user._id});
        res.status(200).json(posts);

    } catch(err) {
        res.status(500).json(err);
    }
})

module.exports = router