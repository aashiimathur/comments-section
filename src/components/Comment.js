import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Typography, TextField, Collapse } from "@mui/material";
import LikeDislike from "./LikeDislike";

const Comment = ({ comment, comments, setComments, currentUser }) => {
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text || "");
  const [isReplying, setIsReplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update comments recursively when edits/replies occur
  const updateCommentsRecursively = (comments, updatedComment) => {
    return comments.map((c) =>
      c.id === updatedComment.id
        ? updatedComment
        : {
            ...c,
            replies: updateCommentsRecursively(c.replies || [], updatedComment),
          }
    );
  };
  
  // Add a reply to a comment
  const addReply = async () => {
    if (!replyText.trim()) return;

    setIsReplying(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/comments",
        { text: replyText, parentId: comment.id },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      setComments((prev) =>
        updateCommentsRecursively(prev, {
          ...comment,
          replies: [...(comment.replies || []), res.data],
        })
      );
      setReplyText("");
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setIsReplying(false);
    }
  };

  // Handle Edit
  const handleEdit = async () => {
    if (!editText.trim() || isSaving) return;
    setIsSaving(true);

    try {
      const res = await axios.put(
        `http://localhost:5000/api/comments/${comment.id}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );

      setComments((prev) => updateCommentsRecursively(prev, res.data));
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing comment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${comment.id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });

      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <Box
      sx={{
        marginLeft: comment.parentId ? 4 : 0,
        borderLeft: comment.parentId ? "1px solid #ccc" : "none",
        padding: 2,
      }}
    >
      {isEditing ? (
        <>
          <TextField
            size="small"
            fullWidth
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            sx={{ marginBottom: 1 }}
          />
          <Button size="small" onClick={handleEdit} disabled={isSaving}>
            Save
          </Button>
          <Button size="small" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Typography variant="body1">{comment.text}</Typography>
          <LikeDislike commentId={comment.id} currentUser={currentUser} />

          {currentUser?.id === comment.user_id && (
            <>
              <Button size="small" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button size="small" color="error" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </>
      )}

      <Button
        onClick={() => setShowReplies(!showReplies)}
        sx={{ marginTop: 1 }}
      >
        {showReplies ? "Hide Replies" : "Show Replies"}
      </Button>

      {showReplies && (
        <>
          <TextField
            size="small"
            placeholder="Reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            sx={{ marginTop: 1 }}
          />
          <Button
            size="small"
            onClick={addReply}
            disabled={isReplying}
            sx={{ marginLeft: 1 }}
          >
            Reply
          </Button>

          <Collapse in={showReplies}>
            {Array.isArray(comment.replies) &&
              comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  comments={comments}
                  setComments={setComments}
                  currentUser={currentUser}
                />
              ))}
          </Collapse>
        </>
      )}
    </Box>
  );
};

export default Comment;