import React, { useState } from 'react';

function CreatePost({ user, onNewPost }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, userId: user._id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onNewPost(data);
        setText('');
      } else {
        console.error('Error creating post:', data.message);
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}

export default CreatePost;
