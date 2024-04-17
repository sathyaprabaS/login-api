var express = require("express");
var cookieParser = require("cookie-parser");
require("dotenv").config();
const mongoose = require("mongoose");
var cors = require("cors");


var app = express();

const port = process.env.PORT || 3001;
const connectionString = process.env.CONNECTION_STRING || "";

var userRouter = require("./routes/user");
app.use(cors()); // Set up CORS middleware first


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });


app.use("/user", userRouter);

app.use("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on the server`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

// app.use((req, res, next) => {
//   const allowedOriginsWithCredentials = [
//     "http://localhost:5173",
//     "http://localhost:5174", // Add the allowed URLs that require credentials
//   ];

//   const isAllowedWithCredentials = allowedOriginsWithCredentials.some(
//     (origin) => req.headers.origin === origin
//   );

//   if (isAllowedWithCredentials) {
//     cors({
//       origin: req.headers.origin,
//       credentials: true,
//     })(req, res, next);
//   } else {
//     cors()(req, res, next);
//   }
// });


app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  console.log(error);
  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    status: error.status,
    message: error.message,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
