const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { text, userId } = req.body;
    
    // Create new post
    const post = new Post({
      user: userId,
      text
    });
    
    await post.save();
    
    // Populate the user field
    await post.populate('user', 'username');
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a post
router.put('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user already liked the post
    if (post.likes.includes(userId)) {
      // Unlike the post
      post.likes = post.likes.filter(like => like.toString() !== userId);
    } else {
      // Like the post
      post.likes.push(userId);
    }
    
    await post.save();
    
    // Populate the user field
    await post.populate('user', 'username');
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on a post
router.put('/:id/comment', async (req, res) => {
  try {
    const { text, userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Add comment
    const comment = {
      user: userId,
      text
    };
    
    post.comments.push(comment);
    await post.save();
    
    // Populate the user field
    await post.populate('user', 'username');
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a user
router.put('/follow/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if user is trying to follow themselves
    if (userId === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(userId);
    
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already following
    if (userToFollow.followers.includes(userId)) {
      // Unfollow the user
      userToFollow.followers = userToFollow.followers.filter(follower => follower.toString() !== userId);
      currentUser.following = currentUser.following.filter(following => following.toString() !== req.params.id);
    } else {
      // Follow the user
      userToFollow.followers.push(userId);
      currentUser.following.push(req.params.id);
    }
    
    await userToFollow.save();
    await currentUser.save();
    
    res.json({ message: 'Follow status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
