# **Comments Section Component**

## **Project Overview**
This project implements a nested comments section similar to platforms like LinkedIn or Reddit. It supports parent and child comments, CRUD operations, likes/dislikes, expand/collapse replies, and pagination.

---

## **Tech Stack**
- **Frontend:** React  
- **Backend:** Node.js with Express  
- **Database:** MySQL  

---

## **Features Breakdown**

### **1. Core Features Overview**
- **Nested Comments Structure:** Supports parent and child comments.
- **CRUD Operations:** Create, Read, Update, and Delete comments.
- **Like/Dislike Functionality:** Tracks user reactions.
- **Expand/Collapse Replies:** Improves readability.
- **Pagination:** Loads older comments in batches.

---

### **2. Backend Features (Node.js + Express)**

#### **a. Server Configuration (`server.js`)**
- **Express Server Setup:** Handles incoming requests and routes.
- **Database Connection:** Uses MySQL for persistent data storage.
- **Middlewares:** CORS, JSON parsing, and API routes.

#### **b. API Endpoints**

1. **Authentication (`auth.js`)**
   - **Register/Login:** Uses JWT for authentication.
   - **Password Hashing:** Secure password storage.

2. **Comments API (`comments.js`)**

| Endpoint              | Method | Description                |
|----------------------|--------|----------------------------|
| `/comments`          | POST   | Adds a new comment/reply   |
| `/comments`          | GET    | Retrieves comments         |
| `/comments/:id`      | PUT    | Edits an existing comment  |
| `/comments/:id`      | DELETE | Deletes a comment/replies  |
| `/comments/:id/like` | POST   | Likes/Dislikes a comment   |

#### **c. Database Schema (`db.js`)**
1. **`users` Table:** Stores user accounts with secure password hashes.  
2. **`comments` Table:** Manages comments, with `parent_id` for nesting.  
3. **`comment_likes` Table:** Tracks likes/dislikes using unique constraints.

---

### **3. Frontend Features (React)**

#### **a. Main App Component (`App.js`)**
- **React Router Integration:** Manages routing between login, register, and comment pages.
- **State Management:** Manages comments using `useState` and `useEffect`.

#### **b. Comments Component (`Comments.js`)**
- **API Integration:** Fetches comments from the backend using Axios.
- **Add/Edit/Delete Functionality:** Updates the UI dynamically using API requests.
- **Comment Rendering:** Displays nested comments in a tree-like structure.

#### **c. Comment Component (`Comment.js`)**
- **Rendering Each Comment:** Displays comments with user details, timestamp, likes, and dislikes.
- **Expand/Collapse Replies:** Toggle functionality for better readability.
- **Like/Dislike Integration:** Updates like/dislike counts dynamically.

---

### **4. Extra Features**

#### **Authentication:**
- **Login & Register Pages:** JWT-based authentication with form validation.

#### **Pagination:**
- Efficiently loads older comments in batches to improve page performance.

---

## **Database Schema**

```sql
USE commentsdb;

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    parent_id INT DEFAULT NULL,
    text VARCHAR(255) NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    like_status ENUM('like', 'dislike') NOT NULL,
    UNIQUE (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## **Setup Instructions**

### **1. Clone the Repository**
```bash
git clone https://github.com/aashiimathur/comments-section.git
```

### **2. Install Dependencies**
```bash
# Backend
cd comments-backend
npm install

# Frontend
cd ..
npm install
```

### **3. Configure the `.env` File**
Create a `.env` file in the `comments-backend` folder with the following content:
```plaintext
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=commentsdb
JWT_SECRET=your_secret_key
```

### **4. Run the Backend Server**
```bash
cd comments-backend
node server.js
```

### **5. Run the Frontend Application**
```bash
npm start
```

---
