import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Post from './Post';

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    // Fetch user profile
    fetchUserProfile();
    
    // Fetch user's posts
    fetchUserPosts();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/user/${id}`);
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/user/${id}`);
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/user/${id}/follow`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUser._id })
      });
      
      if (response.ok) {
        // Update user data
        fetchUserProfile();
      } else {
        console.error('Error following user');
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        // Toggle like status
        const isLiked = post.likes.includes(currentUser._id);
        if (isLiked) {
          return {
            ...post,
            likes: post.likes.filter(id => id !== currentUser._id)
          };
        } else {
          return {
            ...post,
            likes: [...post.likes, currentUser._id]
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{user.username}</h1>
        <p>{user.followers.length} followers</p>
        <p>{user.following.length} following</p>
        {currentUser && currentUser._id !== user._id && (
          <button onClick={handleFollow}>
            {user.followers.includes(currentUser._id) ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
      <div className="profile-posts">
        <h2>Posts</h2>
        {posts.map(post => (
          <Post 
            key={post._id} 
            post={post} 
            currentUser={currentUser} 
            onLike={handleLike}
            onComment={handleComment}
          />
        ))}
      </div>
    </div>
  );
}

export default Profile;
