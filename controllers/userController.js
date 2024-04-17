const bcrypt = require("bcrypt");
const { randomBytes } = require("crypto");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const {
  ExpirationInMilliSeconds,
  SECRET_KEY,
  ACCESS_TOKEN,
} = require("../constant/constant");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.login = async (req, res, next) => {
  let { email, password } = req.body;

  if (email === "" || password === "") {
    const error = new Error("Empty credentials supplied");
    error.statusCode = 454;
    throw error;
  } else {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        const error = new Error("User Not Available Please Signup to continue");
        error.statusCode = 401;
        throw error;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        const error = new Error("Invalid credentials entered!");
        error.statusCode = 400;
        throw error;
      }

      if (user.role !== "customer") {
        const error = new Error("Invalid credentials entered!");
        error.statusCode = 500;
        throw error;
      }

      var userObj = {
        userId: user._id,
        email: user.email,
        name: user.name,
      };

      const token = jwt.sign(userObj, SECRET_KEY);

      res.cookie(ACCESS_TOKEN, token, {
        httpOnly: true,
        maxAge: ExpirationInMilliSeconds, //2 days
      });

      res.status(200).json({
        message: "Signin successful",
        data: userObj,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.signup = async (req, res, next) => {
  let { name, phoneNumber, email, password, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      const error = new Error(
        "Invalid User with provided email already exists entered!"
      );
      error.statusCode = 409;
      throw error;
    } else {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new UserModel({
        name,
        phoneNumber,
        email,
        password: hashedPassword,
        role,
      });
      const savedUser = await newUser.save();
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: savedUser._id,
          email: savedUser.email,
          name: savedUser.name,
        },
        SECRET_KEY
      );

      res
        .cookie(ACCESS_TOKEN, token, {
          httpOnly: true,
          maxAge: ExpirationInMilliSeconds, //2days
        })
        .status(200)
        .json({
          message: "Signup Successful",
          data: {
            userId: savedUser._id,
            email: savedUser.email,
            name: savedUser.name,
          },
        });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.logout = async (req, res) => {
  res.clearCookie(ACCESS_TOKEN);
  res.status(200).json({
    status: true,
    message: "Logged out successfully",
    data: null,
  });
};
