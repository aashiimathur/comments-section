const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { authenticate } = require("./auth");

router.use(authenticate);

// Helper function for nested replies
async function fetchReplies(parentId) {
  const [replies] = await db.execute("SELECT * FROM comments WHERE parent_id = ?", [parentId]);
  for (const reply of replies) {
    reply.replies = await fetchReplies(reply.id);
  }
  return replies;
}

/** ===================== CRUD OPERATIONS ===================== **/

// Add a comment
router.post("/comments", async (req, res) => {
  const { text, parentId } = req.body;
  const userId = req.user.id;

  if (!text.trim()) {
    return res.status(400).send({ error: "Comment text cannot be empty" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO comments (text, parent_id, user_id) VALUES (?, ?, ?)",
      [text, parentId || null, userId]
    );

    const [newComment] = await db.execute("SELECT * FROM comments WHERE id = ?", [result.insertId]);
    res.status(201).send(newComment[0]);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send({ error: "Failed to add comment" });
  }
});

// Edit a comment
router.put("/comments/:id", async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
  
    if (!text.trim()) {
      return res.status(400).send({ error: "Updated text is required" });
    }
  
    try {
      const [comment] = await db.execute("SELECT user_id FROM comments WHERE id = ?", [id]);
  
      if (comment.length === 0) {
        return res.status(404).send({ error: "Comment not found" });
      }
  
      if (comment[0].user_id !== userId) {
        return res.status(403).send({ error: "You can only edit your own comments." });
      }
  
      await db.execute("UPDATE comments SET text = ? WHERE id = ?", [text, id]);
      const [updatedComment] = await db.execute("SELECT * FROM comments WHERE id = ?", [id]);
      res.send(updatedComment[0]);
    } catch (error) {
      console.error("Error editing comment:", error);
      res.status(500).send({ error: "Failed to edit comment" });
    }
  });
  
  // Delete a comment
  router.delete("/comments/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const [comment] = await db.execute("SELECT user_id FROM comments WHERE id = ?", [id]);
  
      if (comment.length === 0) {
        return res.status(404).send({ error: "Comment not found" });
      }
  
      if (comment[0].user_id !== userId) {
        return res.status(403).send({ error: "You can only delete your own comments." });
      }
  
      await db.execute("DELETE FROM comments WHERE id = ?", [id]);
      res.send({ message: "Comment deleted successfully", id });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).send({ error: "Failed to delete comment" });
    }
  }); 

/** ===================== LIKE/DISLIKE ===================== **/

// Like a comment
router.post("/comments/:id/like", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.execute(
      "SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length > 0 && existing[0].like_status === "like") {
      return res.status(400).send({ error: "You already liked this comment." });
    }

    if (existing.length > 0) {
      await conn.execute(
        "UPDATE comment_likes SET like_status = 'like' WHERE comment_id = ? AND user_id = ?",
        [id, userId]
      );
      await conn.execute(
        "UPDATE comments SET likes = likes + 1, dislikes = dislikes - 1 WHERE id = ?",
        [id]
      );
    } else {
      await conn.execute(
        "INSERT INTO comment_likes (comment_id, user_id, like_status) VALUES (?, ?, 'like')",
        [id, userId]
      );
      await conn.execute("UPDATE comments SET likes = likes + 1 WHERE id = ?", [id]);
    }

    await conn.commit();

    const [[updatedComment]] = await conn.execute(
      "SELECT likes, dislikes FROM comments WHERE id = ?",
      [id]
    );
    res.send(updatedComment);
  } catch (error) {
    await conn.rollback();
    console.error("Error liking comment:", error);
    res.status(500).send({ error: "Failed to like comment" });
  } finally {
    conn.release();
  }
});

// Dislike a comment
router.post("/comments/:id/dislike", async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    const conn = await db.getConnection();
  
    try {
      await conn.beginTransaction();
  
      // Check if the user already has a like or dislike record for the comment
      const [existing] = await conn.execute(
        "SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?",
        [id, userId]
      );
  
      if (existing.length > 0 && existing[0].like_status === "dislike") {
        return res.status(400).send({ error: "You already disliked this comment." });
      }
  
      if (existing.length > 0) {
        // If there's an existing record, update it to "dislike" and adjust likes/dislikes accordingly
        await conn.execute(
          "UPDATE comment_likes SET like_status = 'dislike' WHERE comment_id = ? AND user_id = ?",
          [id, userId]
        );
        await conn.execute(
          "UPDATE comments SET dislikes = dislikes + 1, likes = likes - 1 WHERE id = ?",
          [id]
        );
      } else {
        // If no existing record, create a new dislike record
        await conn.execute(
          "INSERT INTO comment_likes (comment_id, user_id, like_status) VALUES (?, ?, 'dislike')",
          [id, userId]
        );
        await conn.execute("UPDATE comments SET dislikes = dislikes + 1 WHERE id = ?", [id]);
      }
  
      await conn.commit();
  
      const [[updatedComment]] = await conn.execute(
        "SELECT likes, dislikes FROM comments WHERE id = ?",
        [id]
      );
      res.send(updatedComment);
    } catch (error) {
      await conn.rollback();
      console.error("Error disliking comment:", error);
      res.status(500).send({ error: "Failed to dislike comment" });
    } finally {
      conn.release();
    }
  });
  
// Get likes and dislikes
router.get("/comments/:id/likes", async (req, res) => {
  const { id } = req.params;

  try {
    const [[comment]] = await db.execute(
      "SELECT likes, dislikes FROM comments WHERE id = ?",
      [id]
    );

    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }

    res.send({
      likes: comment.likes || 0,
      dislikes: comment.dislikes || 0,
      likeStatus: null,
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).send({ error: "Failed to fetch likes" });
  }
});

/** ===================== PAGINATION ===================== **/

router.get("/comments", async (req, res) => {
    let { limit = "5", offset = "0" } = req.query;
  
    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);
  
    if (isNaN(limit) || limit <= 0) limit = 5;
    if (isNaN(offset) || offset < 0) offset = 0;
  
    try {
      console.log("Fetching comments with limit:", limit, "offset:", offset);
  
      const [totalResult] = await db.execute(
        "SELECT COUNT(*) as total FROM comments WHERE parent_id IS NULL"
      );
      const total = totalResult[0]?.total || 0;
  
      const sqlQuery = `
        SELECT * 
        FROM comments 
        WHERE parent_id IS NULL 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
      const [comments] = await db.execute(sqlQuery, [limit, offset]);
  
      for (const comment of comments) {
        comment.replies = await fetchReplies(comment.id);
      }
  
      res.status(200).send({ comments, total });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).send({ error: "Failed to retrieve comments" });
    }
  });
module.exports = router;