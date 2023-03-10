require("dotenv").config();
//console.log(process.env.NODE_ENV);

const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

// middlewares:
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");

// connections:
const connectDB = require("./config/dbConnection");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;

connectDB();

// Our custom middleware imported above:
app.use(logger);

// Third party middleware to use cors:
app.use(cors(corsOptions));

// Middleware for json:
app.use(express.json());

// Parse cookies we receive:
app.use(cookieParser());

// Static middleware:
app.use("/", express.static(path.join(__dirname, "public")));
// [path.join: global variable from node to look in the folder we are in]

// Routing:
app.use("/", require("./routes/root"));

// Auth:
app.use("/auth", require("./routes/authRoutes"));

// Users endpoint:
app.use("/users", require("./routes/userRoutes"));

// Orders endpoint:
app.use("/orders", require("./routes/orderRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Listener to an error:
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
