////////////////////////////////////////////////////////////////////////////////////////
// This file contains the functions that treat endpoints associated with the User model
////////////////////////////////////////////////////////////////////////////////////////

//--------------------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

require('./globals');
const HttpError = require('./http-error');
const User      = require('./model-user');
//--------------------------------------------------------------------------------------


// Creates a new user in the database,  with the name, email, 
// and password passed as parameters in the message body
// Returns userId, user name and a token
const signup = async (req, res, next) => {

    // Gets results from parameters validation done by check() in webserver.js 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next( new HttpError('Invalid parameters. Please check the data you informed.', INVALID_PARAMETERS) );
    }

    const { name, email, password } = req.body;  // Gets params from the post message
    
    var existingUser;
    try {
        // tries to find a user with this email in the database
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        // Problems accessing the database
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR) );
    }

    if (existingUser) {  // A user with the specified email already exists
        return next( new HttpError('Email already exists, please login instead.',  EXISTS_IN_DB ) );
    }

    // Hashes the password before persisting it in the User document
    var hashed;
    try {
        hashed = await bcrypt.hash(password, 12);
    } catch (err) {
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR) );
    }
      
    // Creates a new User document
    const createdUser = new User({
        name: name,
        email: email,
        password: hashed,
        tools: []
    });

    // Adds the new User document to the database
    try {
        await createdUser.save();
    } catch (err) {            
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR) );
    }            
        
    // Creates a new token with the payload data
    var token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            VUTTR_AUTH_KEY,
            { expiresIn: '1h' }  // Sets this token to expire in 1 hour
        );
    } catch (err) {        
        return next( new HttpError('Sign up failed, please try again later.', INTERNAL_ERROR) );
    }
  
    // Print for debug purposes only
    console.log('sign up');
    console.log({ userId: createdUser.id, email: createdUser.email, token: token });

    // Sends user information back to frontend
    res
        .status(CREATED)
        .json({ userId: createdUser.id, name: createdUser.name, token: token });
}

// Tries to login the user which email and password 
// are passed as parameters in the request body
// Returns userId, user name and a token
const login = async (req, res, next) => {

    // Gets results from parameters validation done by check() in webserver.js 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next( new HttpError('Invalid parameters. Please check the data you informed.', INVALID_PARAMETERS) );
    }

    const { email, password } = req.body;

    var existingUser;
    try {
        // tries to find this email in the database
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        // Problems accessing the database
        return next( new HttpError('Login in failed, please try again.', INTERNAL_ERROR) );
    }

    if (!existingUser) {
        // The email does not exists in the database
        return next( new HttpError('Invalid email, could not log you in.', INVALID_PARAMETERS) );
    }

    var isValidPassword = false;
    try {
        // Verifies if hashed password in User document matches password received
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next( new HttpError('Login in failed, please try again.', INTERNAL_ERROR) );
    }
  
    if (!isValidPassword) {
        return next( new HttpError('Could not log you in. Invalid credentials.', UNAUTHENTICATED) );
    }
  
    var token;
    try {
        // Creates a new token with the payload data
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            VUTTR_AUTH_KEY,
            { expiresIn: '1h' }  // Sets this token to expire in 1 hour
        );
    
    } catch (err) {
        return next( new HttpError('Login in failed, please try again.', INTERNAL_ERROR) );
    }
  
    // Print for debug purposed only
    console.log('login');
    console.log({ userId: existingUser.id, email: existingUser.email, token: token });
            
    // Sends user information back to client
    res
        .status(ACCEPTED)
        .json({ userId: existingUser.id, name: existingUser.name, token: token });
}

// Returns all users in the database, if any
const getAll = async (req, res, next) => {
    
    // Reads all users from database, without reading the passwords
    User.find({}, '-password').then( (users) => {

        if(users) {
            // Replies with the list of users
            res.status(201).json({ Users: users.map(user => user.toObject({ getters: true })) });
        }
        else {
            return next( new HttpError('Found no user in database.', INTERNAL_ERROR) );
        }
    }).catch( (err) => {
        return next( new HttpError('Accessing database failed, please try again.', INTERNAL_ERROR) );
    });
}


exports.signup  = signup;
exports.login   = login;
exports.getAll  = getAll;
