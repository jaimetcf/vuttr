////////////////////////////////////////////////////////////////////////////////////////
// This file contains the functions that treat endpoints associated with the Tool model
////////////////////////////////////////////////////////////////////////////////////////

//--------------------------------------------------------------------------------------
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

require('./globals');
const HttpError = require('./http-error');
const User      = require('./model-user');
const Tool      = require('./model-tool');
//--------------------------------------------------------------------------------------


// Creates a new Tool instance in the database, with parameters received in the message body
const addUserTool = async (req, res, next) => {

    // Gets results from parameters validation done by check() in webserver.js 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next( new HttpError('Invalid parameters. Please check the data you informed.', INVALID_PARAMETERS) );
    }

    // Gets params from the post request body
    const { userId, title, link, description, tags } = req.body;  
    
    // Reads the specified User document from database
    var user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR) );
    }

    if (!user) {
        // currentUser was not found in database
        return next( new HttpError('Current user not found in database.',  NOT_FOUND ) );
    }

    const createdTool = new Tool({
        user_id: user.id,
        title: title,
        link: link,
        description: description,
        tags: tags
    });

    // Adds the new Tool document into the database
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        // ATTENTION: ENSURE THERE IS A COLLECTION NAMED 'tools' in mongodb.
        // Otherwise, the line immediately bellow will throw an error
        await createdTool.save({ session: sess });
        user.tools.push(createdTool);
        await user.save({ session: sess });
        await sess.commitTransaction();

    } catch (err) {
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR ) );
    }

    console.log('addTool => status 201');
    console.log(createdTool);
    res.status(201).json( createdTool.toObject({ getters: true }) );
  
}

// Returns all Tool documents under the userId passed as parameter, if any
const getUserAllTools = async (req, res, next) => {
    
    // Gets userId parameter from the path
    const userId = req.params.userId;
    if(userId == '') {
        return next( new HttpError('Invalid user id parameter. Please check the data you informed.', 
                     INVALID_PARAMETERS) );
    }

    // Reads the specified User document, and the Tool documents in user.tools list
    var user;
    try {
        user = await User.findById(userId).populate('tools');
    } catch (err) {
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR) );
    }

    if (!user) {
        // Found no user, or user.tools list is empty
        return next( new HttpError('User not found.', NOT_FOUND ) );
    }

    const tools = user.tools;
    if(tools && (tools.length>0) ) {
        // Replies with the list of tools
        console.log('getUserAllTools => status ' + OK );
        res.status(OK).json( tools.map(tool => tool.toObject({ getters: true })) );
    }
    else {
        // Found the user, but he(she) has no tools
        console.log('getUserAllTools => status ' + OK + ' returned empty tools list' );
        res.status(OK).json([]);
    }
};

// Returns all Tool documents that have the userId and the tag passed as parameters
const getUserToolsByTag = async (req, res, next) => {

    // Gets tag parameter from the request query
    const tagName = req.query.tag;
    if (tagName == '') {
        return next( new HttpError('Invalid tag parameter. Please check the data you informed.', INVALID_PARAMETERS) );
    }

    // Gets userId parameter from request query
    const userId = req.query.userId;
    if(userId == '') {
        return next( new HttpError('Invalid user id parameter. Please check the data you informed.', 
                     INVALID_PARAMETERS) );
    }

    // Returns all Tool documents that contain user_id equal to userId, 
    // and tagName in its tag list
    Tool.find({ user_id: userId, tags: tagName }).then( (tools) => {

        if(tools) {
            // Replies with the list of tools
            console.log('getByTag => status 200');
            res.status(OK).json( tools.map(tool => tool.toObject({ getters: true })) );
        }
        else {
            return next( new HttpError('No tool found in the specified tag. Please try another tag.', NO_CONTENT) );
        }

    }).catch( (err) => {
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR) );
    });
}

// Removes the Tool document referenced by the tool id passed as parameter
const removeUserTool = async (req, res, next) => {
    
    // Gets id parameter from the path
    const toolId = req.params.id;
    if (toolId == '') {
        return next( new HttpError('Invalid tool id parameter. Please check the data you informed.', INVALID_PARAMETERS) );
    }
  
    // Reads Tool document from the database.
    var tool;
    try {
        tool = await Tool.findById(toolId);
    } catch (err) {
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR) );
    }

    if (!tool) {
        return next( new HttpError('Found no tool with the specified id.', NOT_FOUND) );
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        const user = await User.findById(tool.user_id);  // gets the user this tool belongs to
        if(!user)  { return next( new HttpError('Could not remove tool. Did not find the user.', INTERNAL_ERROR) ); }
        user.tools.pull(tool);                           // Removes this tool from user.tools list
        await user.save({ session: sess });              // updates User in database
        await tool.remove({ session: sess });            // removes the tool from database
        await sess.commitTransaction();

    } catch (err) {
        return next( new HttpError('Database access error. Please try again.', INTERNAL_ERROR) );
    }

    console.log('removeUserTool => status ' + NO_CONTENT );
    res.status(NO_CONTENT).json({});
}
  

exports.addUserTool       = addUserTool;
exports.getUserAllTools   = getUserAllTools;
exports.getUserToolsByTag = getUserToolsByTag;
exports.removeUserTool    = removeUserTool;