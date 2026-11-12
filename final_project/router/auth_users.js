const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username already exists
const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
}

// Check if the username and password match the records
const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0;
}

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in. Missing username or password." });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT token (secret key must match index.js)
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Save the token and username in the session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8: Add or Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let review = req.query.review; // Get the review from the query string
  
  // The username is available in the session because the user is authenticated
  let username = req.session.authorization['username']; 

  if (books[isbn]) {
    let book = books[isbn];
    // Add or update the review using the username as the key
    book.reviews[username] = review;
    return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated.` });
  }
  return res.status(404).json({ message: "Book not found" });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let username = req.session.authorization['username'];

  if (books[isbn]) {
    let book = books[isbn];
    // Check if this user has a review for this book
    if (book.reviews[username]) {
      // Delete only this user's review
      delete book.reviews[username];
      return res.status(200).json({ message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.` });
    } else {
      return res.status(404).json({ message: "Review not found for this user." });
    }
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;