import React, { useState } from 'react';

function Post({ post, currentUser, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUser._id })
      });
      
      if (response.ok) {
        onLike(post._id);
      } else {
        console.error('Error liking post');
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          text: commentText, 
          userId: currentUser._id,
          username: currentUser.username
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onComment(post._id, data);
        setCommentText('');
      } else {
        console.error('Error commenting on post:', data.message);
      }
    } catch (err) {
      console.error('Error commenting on post:', err);
    }
  };

  const isLiked = post.likes.includes(currentUser._id);

  return (
    <div className="post-container">
      <div className="post-header">
        <h3>{post.username}</h3>
      </div>
      <div className="post-content">
        <p>{post.text}</p>
      </div>
      <div className="post-actions">
        <button onClick={handleLike} className={isLiked ? 'liked' : ''}>
          Like ({post.likes.length})
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          Comments ({post.comments.length})
        </button>
      </div>
      
      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.map((comment, index) => (
              <div key={index} className="comment">
                <h4>{comment.username}</h4>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <button type="submit">Comment</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Post;
