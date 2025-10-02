const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      followers: user.followers,
      following: user.following
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/unfollow user
router.put('/user/:id/follow', async (req, res) => {
  try {
    const { userId } = req.body;
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(userId);
    
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already following
    const isFollowing = userToFollow.followers.includes(userId);
    
    if (isFollowing) {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== userId);
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    } else {
      // Follow
      userToFollow.followers.push(userId);
      currentUser.following.push(req.params.id);
    }
    
    await userToFollow.save();
    await currentUser.save();
    
    res.json({
      _id: userToFollow._id,
      username: userToFollow.username,
      followers: userToFollow.followers,
      following: userToFollow.following
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
