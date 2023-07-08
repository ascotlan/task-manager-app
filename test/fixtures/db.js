const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: "Kevin Scotland",
  email: "kevin@example.com",
  password: "56what!!",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();

const userTwo = {
  _id: userTwoId,
  name: "Duvern Scotland",
  email: "duvern@example.com",
  password: "MyCousin123!!",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First Task",
  completed: false,
  owner: userOneId,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second Task",
  completed: true,
  owner: userOneId,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third Task",
  completed: true,
  owner: userTwoId,
};

const setupDatabase = async () => {
  await User.deleteMany(); //delete all users using mongoose method on the User model
  await Task.deleteMany();
  await new User(userOne).save(); // save userOne to the db
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  setupDatabase,
  taskOne,
  taskTwo,
  taskThree,
  userTwo,
  userTwoId,
};
