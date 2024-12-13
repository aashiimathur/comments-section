import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Comment from "./Comment";
import Pagination from "./Pagination";
import { TextField, Button, Box, CircularProgress, Typography } from "@mui/material";

const Comments = ({ currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalComments, setTotalComments] = useState(0);

  const limit = 5;

  // Fetch comments from backend
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = currentUser?.token;

      if (!token) {
        setError("User not authenticated.");
        return;
      }

      const offset = (page - 1) * limit;
      const res = await axios.get("http://localhost:5000/api/comments", {
        params: { limit, offset },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComments(res.data.comments);
      setTotalComments(res.data.total);
    } catch (err) {
      setError("Failed to fetch comments. Please try again later.");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, currentUser]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser?.token) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/comments",
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );

      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      setError("Failed to add comment. Please try again.");
      console.error("Error adding comment:", err);
    }
  };

  // Fetch comments when the component is mounted or page changes
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <Box sx={{ maxWidth: "800px", margin: "0 auto", padding: 2 }}>
      {/* Header with Logout Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Typography variant="h5">Comments Section</Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            localStorage.clear(); // Clear all stored data
            window.location.href = "/login"; // Redirect to login
          }}
        >
          Logout
        </Button>
      </Box>

      {/* New Comment Input */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
        <TextField
          variant="outlined"
          placeholder="Write a comment..."
          fullWidth
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddComment}>
          Add Comment
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: "center", marginY: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ color: "red", textAlign: "center", marginBottom: 2 }}>{error}</Box>
      )}

      {/* No Comments Message */}
      {!loading && !error && comments.length === 0 && (
        <Box sx={{ textAlign: "center", color: "gray", marginBottom: 4 }}>
          No comments yet. Be the first to comment!
        </Box>
      )}

      {/* Render Comments */}
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          comments={comments}
          setComments={setComments}
          currentUser={currentUser}
        />
      ))}

      {/* Pagination Control */}
      {totalComments > limit && (
      <Box sx={{ marginTop: 4 }}> {/* Add margin here */}
        <Pagination
          currentPage={page}
          total={totalComments}
          pageSize={limit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Box>
    )}
    </Box>
  );
};

export default Comments;