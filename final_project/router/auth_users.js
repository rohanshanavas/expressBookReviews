const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to validate if the username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to authenticate a user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Login route
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Authenticate the user
    if (authenticatedUser(username, password)) {
        // Create a JWT token
        const token = jwt.sign({ username }, "access", { expiresIn: '1h' });

        // Save the token in the session
        req.session.authorization = { accessToken: token };

        return res.status(200).json({ message: "Login successful", token });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query; // Review should be sent as a query parameter

    // Validate review input
    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty" });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the review
    const username = req.user.username;
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully" });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    
    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review exists for the user
    const username = req.user.username;
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for the user" });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
