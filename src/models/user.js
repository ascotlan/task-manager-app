const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Passowrd must not contain 'password'");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a postive number");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Use a virtual to set a property that is not stored in MongoDB on the User model. In this case it will be all the tasks associated with the user
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// define an instance method on a document. In this case , the document is the user instance object in the routing file. Because it acts solely on the instance of a created user
userSchema.methods.generateAuthtoken = async function () {
  const user = this;
  //signing the JWT. This is also where you can set teh exipration as an optional argument
  const token = await jwt.sign(
    { _id: user._id.toString() },
    "thisismynewskill"
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// define an instance method on a document. In this case, the document is the user intance object in the routing file. This method edits the user object fields/properties
userSchema.methods.toJSON = function () {
  //whatever the toJSON methon on an object returns is what will be stringified when we call JSON.stringify on the object
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  return userObject; //return user object with the password or token feilds
};

// define a static function on the model. In this case the model is User model object in the routing file. For customizing a predefined method (findOne) on the model prototype.
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// Middleware: Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//Middlwware: Delete user tasks when user is removed
// Note: Mongoose has more than one middleware that uses deleteOne(). To ensure that this is referencing a user document in the pre hook middleware we need to set the options object with a document: true property.
userSchema.pre("deleteOne", { document: true }, async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

// Create a user model
const User = mongoose.model("User", userSchema);

module.exports = User;
