const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Custom middleware to authenticate a user by capturing, verifying & decoding the token, then find user with the decoded _id in the token
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token; //make specific token created during authentication a property of the req object
    req.user = user; //make user a property of the req object
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
