import React, { useState, useEffect } from 'react';
import Post from './Post';
import CreatePost from './CreatePost';

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch posts
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        // Toggle like status
        const isLiked = post.likes.includes(user._id);
        if (isLiked) {
          return {
            ...post,
            likes: post.likes.filter(id => id !== user._id)
          };
        } else {
          return {
            ...post,
            likes: [...post.likes, user._id]
          };
        }
      }
      return post;
    }));
  };

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));
  };

  return (
    <div className="home-container">
      <h1>Social Media Feed</h1>
      {user && <CreatePost user={user} onNewPost={handleNewPost} />}
      <div className="posts-feed">
        {posts.map(post => (
          <Post 
            key={post._id} 
            post={post} 
            currentUser={user} 
            onLike={handleLike}
            onComment={handleComment}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
