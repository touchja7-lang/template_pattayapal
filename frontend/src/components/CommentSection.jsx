import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentAPI } from '../services/api';
import { Link } from 'react-router-dom';
import './CommentSection.css';

// ✅ แก้ไข: รับ newsId เป็น props ปกติ
function CommentSection({ newsId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ป้องกันการเรียก API ถ้า newsId ยังไม่มีค่า หรือค่าผิดรูปแบบ
    if (newsId && newsId.length > 10) {
      fetchComments();
    }
  }, [newsId]);

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getByNewsId(newsId);
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('กรุณาใส่ข้อความคอมเมนต์');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await commentAPI.create({
        newsId: newsId, // ✅ มั่นใจว่าส่ง ID ที่มาจาก MongoDB (_id)
        content: newComment
      });
      
      // อัปเดตลิสต์คอมเมนต์ทันที
      if (response.data.comment) {
         setComments([response.data.comment, ...comments]);
      } else {
         fetchComments(); // fallback ถ้า backend ส่งข้อมูลมาไม่ครบ
      }
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มคอมเมนต์');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('คุณต้องการลบคอมเมนต์นี้หรือไม่?')) return;
    try {
      await commentAPI.delete(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบคอมเมนต์');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="comment-section">
      <h3 className="comment-title">ความคิดเห็น ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          {error && <div className="comment-error" style={{color: 'red'}}>{error}</div>}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="แสดงความคิดเห็น..."
            rows="4"
            className="comment-textarea"
          />
          <button type="submit" className="comment-submit-btn" disabled={loading}>
            {loading ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p><Link to="/login">เข้าสู่ระบบ</Link> เพื่อแสดงความคิดเห็น</p>
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">ยังไม่มีความคิดเห็น</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <strong>{comment.userId?.fullName || 'ผู้ใช้'}</strong>
                  <span className="comment-username"> @{comment.userId?.username || 'unknown'}</span>
                </div>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
              {user && (user.id === comment.userId?._id || user._id === comment.userId?._id) && (
                <button onClick={() => handleDelete(comment._id)} className="comment-delete-btn">ลบ</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;