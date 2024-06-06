const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Authenticate user based on username and password
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  } else if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Incorrect username or password" });
  } else {
    const accessToken = jwt.sign({ data: password }, "access", { expiresIn: 3600 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in." });
  }
});

// Task 8: Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const review = req.body.review;
  const isbn = req.params.isbn;

  if (!review) {
    return res.status(400).json({ message: "Review is empty!" });
  }

  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review successfully posted" });
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(400).json({ message: "Invalid ISBN." });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(400).json({ message: `${username} hasn't submitted a review for this book.` });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review successfully deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
