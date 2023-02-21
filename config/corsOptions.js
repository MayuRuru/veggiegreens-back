const allowedOrigins = require("./allowedOrigins");

// Third party middleware:
const corsOptions = {
  origin: (origin, callback) => {
    // a way to restrict to only the array of allowed
    // or no origin to allow postman to access our REST API
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // sets the access header
  credentials: true,
  // set just in case
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
