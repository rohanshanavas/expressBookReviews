const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios'); // Import Axios
const public_users = express.Router();

// Endpoint to fetch books from an external API (replace with your API URL)
const BOOKS_API_URL = 'http://localhost:5000/'; // URL to your server's books endpoint

public_users.post('/register', function (req, res) {
    const { username, password } = req.body; // Extract username and password from request body

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Add the new user to the users array
    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    const booksList = JSON.stringify(books, null, 4);
    return res.status(200).send(booksList);
    // return res.status(300).json({ message: "Yet to be implemented" });
});

// Get the book list available in the shop using async-await
public_users.get('/', async (req, res) => {
    try {
        // Fetch the book list from the API
        const response = await axios.get(BOOKS_API_URL);
        // Send the book list as a JSON response
        res.status(200).json(response.data);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: "Error fetching the book list" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extract the ISBN from the request parameters
    const book = books[isbn]; // Retrieve the book details using the ISBN
    
    if (book) {
        // If the book exists, return its details
        return res.status(200).json(book);
    } else {
        // If the book doesn't exist, return an error message
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params; // Extract ISBN from the request parameters

    try {
        // Fetch the book details from the API
        const response = await axios.get(`${BOOKS_API_URL}isbn/${isbn}`);
        // Send the book details as a JSON response
        res.status(200).json(response.data);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: "Error fetching book details" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author; // Extract the author from the request parameters
    const matchingBooks = []; // Array to hold books by the requested author

    // Iterate through the books object to find matching authors
    for (let isbn in books) {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
            matchingBooks.push({ isbn, ...books[isbn] });
        }
    }

    if (matchingBooks.length > 0) {
        // If matching books are found, return them
        return res.status(200).json(matchingBooks);
    } else {
        // If no books match the author, return an error message
        return res.status(404).json({ message: "No books found for the specified author" });
    }
});

// Get book details based on author using async-await
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params; // Extract author from the request parameters

    try {
        // Fetch books by the author from the API
        const response = await axios.get(`${BOOKS_API_URL}author/${author}`);
        // Send the book details as a JSON response
        res.status(200).json(response.data);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title; // Extract the title from the request parameters
    const matchingBooks = []; // Array to hold books matching the requested title

    // Iterate through the books object to find matching titles
    for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
            matchingBooks.push({ isbn, ...books[isbn] });
        }
    }

    if (matchingBooks.length > 0) {
        // If matching books are found, return them
        return res.status(200).json(matchingBooks);
    } else {
        // If no books match the title, return an error message
        return res.status(404).json({ message: "No books found with the specified title" });
    }
});

// Get book details based on title using async-await
public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params; // Extract title from the request parameters

    try {
        // Fetch books by the title from the API
        const response = await axios.get(`${BOOKS_API_URL}title/${title}`);
        // Send the book details as a JSON response
        res.status(200).json(response.data);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: "Error fetching books by title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extract the ISBN from the request parameters
    const book = books[isbn]; // Retrieve the book details using the ISBN
    
    if (book) {
        // If the book exists, return its reviews
        return res.status(200).json(book.reviews);
    } else {
        // If the book doesn't exist, return an error message
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
