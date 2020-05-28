////////////////////////////////////////////////////////////////////////////////////////
// Imports section 
////////////////////////////////////////////////////////////////////////////////////////
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { check } = require('express-validator');

require('./globals');
const getAuth    = require('./auth');
const HttpError  = require('./http-error');
const userRoutes = require('./controller-user');
const toolRoutes = require('./controller-tool');


////////////////////////////////////////////////////////////////////////////////////////
// Web Server Initializations
////////////////////////////////////////////////////////////////////////////////////////


// Creates express webserver
const webServer = express();

// body content is mostly in json format (except in image uploads)
webServer.use(bodyParser.json()); 

// This webserver serves static files in the paths below
webServer.use(express.static(path.join(__dirname, './public')))

// CORS Headers => Required for cross-origin/ cross-server communication
webServer.use( (req, res, next) => {
  // Here we specify:

  //Which domains can send requests to this webserver: '*' -> all
  res.setHeader("Access-Control-Allow-Origin", "*" );

  // The headers accepted in the requests sent to this webserver
  res.setHeader( 
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // The methods accepted in the requests sent to this webserver
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

  next();
});


///////////////////////////////////////////////////////////////////////////////////////
// Endpoints definition
///////////////////////////////////////////////////////////////////////////////////////

const router = express.Router();
// The use of a Router object may seem unnecessary here, but it is needed so that the routes
// below can be registered using webServer.use(...), in the line that follows the routes definitions.
// This ensures they are registered BEFORE general error treatment routes, that follows afterwards.
// If we simply register these routes with webServer.get, post, etc., these routes end up
// being registered AFTER error treatment routes


// This is just an online check endpoint for confirming the backend is online, 
// when you type just the 'domain' in the browser address field
router.get('/', (req, res, next ) => { res.status(OK).json({ message: 'apivuttr online'}); });


// User endpoints --------------------------------------------------------------------
router.post('/users/signup',                                 // name, email, password   (in body)
  [ // Validates parameters comming from frontend
    check('name').not().isEmpty(),                           
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 4 })
  ],                              userRoutes.signup
);

router.post('/users/login',       
  [ // Validates parameters comming from frontend
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 4 })
  ]                         ,     userRoutes.login );        // email, password         (in body)

router.get('/users/all',          userRoutes.getAll );       // no parameters            NOT USED


// Tool endpoints --------------------------------------------------------------------
router.use(getAuth);  // All endpoints below require authentication,
                      // A token must be provided in request header

router.post('/tools',
[ // Validates parameters comming from the frontend
  check('userId').not().isEmpty(),                            
  check('title').not().isEmpty(),                            
  check('link').isLength({ min: 5 }),
  check('description').isLength({ min: 1 }),
  check('description').isLength({ max: 1024 }),
  check('tags').not().isEmpty()
],                                toolRoutes.addUserTool );         // userId, title, link, description, tags: []  (in body)

router.get('/tools/all/:userId',  toolRoutes.getUserAllTools );     // userId         (in path)

router.get('/tools',              toolRoutes.getUserToolsByTag );   // ?tag, ?userId  (in query)

router.delete('/tools/:id',       toolRoutes.removeUserTool );      // id             (in path)

// ------------------------------------------------------------------------------------

webServer.use('/', router);   // Registers router in webserver


////////////////////////////////////////////////////////////////////////////////////////
// General Error treatment
////////////////////////////////////////////////////////////////////////////////////////

// Treats a route not serviced by this web server
webServer.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', NOT_FOUND );
  throw error;
});


webServer.use((error, req, res, next) => {
  
  if (res.headerSent) {
     return next(error);
  }
  
  // Sends the error occurred to the frontend
  res.status(error.code || INTERNAL_ERROR);
  res.json({ message: error.message || 'An unknown error occurred!' });
});


////////////////////////////////////////////////////////////////////////////////////////
// Connects to mongodb, and then starts listening to port PORT
////////////////////////////////////////////////////////////////////////////////////////
const mongodbUrl = 'mongodb+srv://' + 
                    DB_USER + ':' + 
                    DB_PASSWORD + '@cluster0-g7x23.mongodb.net/' + 
                    DB_NAME + '?retryWrites=true&w=majority';

console.log('Connecting to database...pls wait');
mongoose.connect(mongodbUrl,{ useNewUrlParser: true }).then(() => {
    console.log('Connected to database successfully!');
    webServer.listen( PORT, () => console.log('Listening on port ' + PORT ));

}).catch(err => {
    console.log(err);
});
