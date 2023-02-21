const express = require("express");
const app = express();
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const PORT = process.env.PORT || 3500;
const { logger } = require("./middleware/logger");

// Our custom middleware imported above:
app.use(logger);

app.use(cors(corsOptions));

// Middleware for json:
app.use(express.json());

// Parse cookies we receive:
app.use(cookieParser());

// Static middleware:
app.use("/", express.static(path.join(__dirname, "public")));
// path.join: global variable from node to look in the folder we are in

app.use("/", require("./routes/root"));

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
