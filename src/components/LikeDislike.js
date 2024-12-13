import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import axios from "axios";

const LikeDislike = ({ commentId, currentUser }) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [likeStatus, setLikeStatus] = useState(null); // 'like', 'dislike', or null

  // Fetch likes and dislikes from the backend
  const fetchLikes = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${commentId}/likes`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`, 
        },
      });

      if (res.data) {
        setLikes(res.data.likes || 0);
        setDislikes(res.data.dislikes || 0);
        setLikeStatus(res.data.likeStatus || null); 
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [commentId, currentUser.token]);

  // Initialize on mount
  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  // Handle Like Action
  const handleLike = async () => {
    if (likeStatus === "like") return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
      setLikeStatus("like");
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  // Handle Dislike Action
  const handleDislike = async () => {
    if (likeStatus === "dislike") return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${commentId}/dislike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
      setLikeStatus("dislike");
    } catch (error) {
      console.error("Failed to dislike comment:", error);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Button
        onClick={handleLike}
        disabled={likeStatus === "like"}
        startIcon={<ThumbUpIcon />}
      >
        {likes}
      </Button>

      <Button
        onClick={handleDislike}
        disabled={likeStatus === "dislike"}
        startIcon={<ThumbDownIcon />}
      >
        {dislikes}
      </Button>
    </div>
  );
};

export default LikeDislike;