// Http codes
global.OK                 = 200
global.CREATED            = 201
global.ACCEPTED           = 202
global.NO_CONTENT         = 204

global.BAD_REQUEST        = 400
global.UNAUTHENTICATED    = 401
global.FORBIDDEN          = 403
global.NOT_FOUND          = 404
global.REQUEST_TIMEOUT    = 408

global.INVALID_PARAMETERS = 470
global.EXISTS_IN_DB       = 471

global.INTERNAL_ERROR     = 500


// The variables below need to be set differently, according to
// the environment you're deploying this app

// If deployng locally, on localhost, set these environment
// variables on file nodemon.json, included in this package

// If deploying on heroku, for example, you need to set these
// variables on https://dashboard.heroku.com/apps/apivuttr/settings,
// where apivuttr is the app name set in heroku, in this case.

// Mongo DB credentials, obtained from environment variables
global.DB_USER     = process.env.DB_USER;
global.DB_PASSWORD = process.env.DB_PASSWORD;
global.DB_NAME     = process.env.DB_NAME;

// Authentication/Authorization server JWT key for generatiing the token,
// obtained from environment variable
global.VUTTR_AUTH_KEY = process.env.VUTTR_AUTH_KEY;

// Port where this webserver exposes the endpoints,
// obtained from environment variable

// If deploying on heroku, this variable PORT do not need to be set on heroku
// Config Vars (on https://dashboard.heroku.com/apps/apivuttr/settings),
// because heroku creates this variable automatically
global.PORT = process.env.PORT;