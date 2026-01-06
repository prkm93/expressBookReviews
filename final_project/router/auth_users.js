const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const SECRET_KEY = 'H34CDS24325'

const isValid = (username) => { //returns boolean
//write code to check is the username is valid
  return users.filter(user => user.username === username).length > 0
}

const authenticatedUser = (username,password) => { //returns boolean
//write code to check if username and password match the one we have in records.
 return users.filter(user => user.username === username && user.password === password).length > 0
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  // extract username and password
  const username = req.body.username
  const password = req.body.password

  // validate username/password
  if (!username || !password) {
    return res.status(404).json({ message: 'Error loggin in'})
  }

  // check authentication of user
  if(authenticatedUser(username, password)) {
    // create JWT token
    const accessToken = jwt.sign({
      password
    }, SECRET_KEY, {
      expiresIn: '1h'
    })

    req.session.authorization = {
      accessToken,
      username
    }

    return res.status(200).send('User logged in successfully')
  } else {
    return res.status(401).send('User not authorised')
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn
  const reviewComment = req.query.comment
  const { accessToken, username } = req.session.authorization
  console.log("authorization modify", req.session.authorization)
  if (accessToken) {
     books[isbn].reviews = {
      ...books[isbn].reviews,
      [username]: reviewComment
     }
     console.log("books", books)
     return res.status(200).send(`Review added by user: ${username}`)
  } 
  console.log("userDetails", userDetails)
  return res.status(400).json({message: "User not authorised to add/update review"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const { accessToken, username } = req.session.authorization
  if (accessToken) {
    const bookReviews = books[isbn].reviews
    for (let user in bookReviews) {
      console.log("user", user)
      if (user === username) {
        delete bookReviews[username]
      }
    }
    console.log("books deleted", books)
    return res.sendStatus(204) 
     // OR return res.status(204).send()
  }
  return res.status(400).send({ message: "User not authorised to delete review. Please login first" })
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.SECRET_KEY = SECRET_KEY