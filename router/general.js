const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  
  // Extract username and password
  const username = req.body.username
  const password = req.body.password
  
  // verify if username and password not empty
  if (!username || !password) {
    return res.status(404).send('Unable to register user')
  }
  
  // if user already exists
  if (isValid(username)) {
    return res.status(409).send("User already exists!")
  }
  // register user
  else {
    users.push({
      username,
      password
    })
    return res.status(201).json("User registered successfully");
  }
});

const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    if (Object.keys(books).length >0) {
      resolve(books)
    } else {
      reject('Books not available!')
    }
  })
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  getAllBooks().then(books => {
    res.status(200).send(JSON.stringify(books, null, 2))
  }).catch(err => {
    res.status(404).send(err.message);
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  try { 
    const isbn = req.params.isbn;
    // fetch books
    const response = await axios.get('http://localhost:5000/');
    
    //find book by isbn
    const bookFound = response.data[isbn];

    // return response if book available 
    if (bookFound) return res.status(200).send(bookFound)

    // else return not found
    return res.status(404).send({
      message: `Book not found by isbn: ${isbn}`
    })
  } catch (err) {
    return res.status(404).send({
      message: 'Error fetching book by isbn',
      error: err.message
    })
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  try {
    const author = req.params.author
    // fetch books
    const response = await axios.get('http://localhost:5000/')
    const bookList = response.data

    // filter book by author
    const bookFoundByAuthor = Object.values(bookList).filter(book => book.author?.toLowerCase() === author?.toLowerCase())

    if (bookFoundByAuthor.length > 0) {
      return res.status(200).send(bookFoundByAuthor);
    }
    return res.status(404).send(`book by author: ${author} not found!`)
  } catch (err) {
    return res.status(404).send({
      message: 'Error fetching book by author',
      error: err.message
    })
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  //Write your code here
  try {
    const title = req.params.title
    // fetch books
    const response = await axios.get('http://localhost:5000/')
    const bookList = response.data
     // filter book by title  
    const bookFoundByTitle = Object.values(bookList).find(book => book.title?.toLowerCase() === title?.toLowerCase())

    if (bookFoundByTitle) {
      return res.status(200).send(bookFoundByTitle);
    }
    return res.status(404).send(`book by title: ${title} not found!`)
  } catch (err) {
    return res.status(404).send({
      message: 'Error fetching book by title',
      error: err.message
    })
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn
  const bookFoundByISBN = books[isbn].reviews
  if (bookFoundByISBN) {
    return res.status(300).send(JSON.stringify(bookFoundByISBN, null, 2));
  }
  return res.status(404).send(`No reviews found for book by isbn: ${isbn}`)
});

module.exports.general = public_users;
