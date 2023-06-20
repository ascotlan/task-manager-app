// REST API WITH NODE.JS, EXPRESS & MONGOOSE

const express = require("express"); //require express for CRUD operations in Node.js
require("./db/mongoose"); //require mongoose to ensure a connection between Mongo DB and this node.js runtime environment
const User = require("./models/user"); //import user model
const Task = require("./models/task"); //import task model
const ObjectId = require("mongoose").Types.ObjectId;

const app = express();
const port = process.env.PORT || 3000; //Set port to value provided by environment or default to 3000

//parse all incoming JSON requests into an object
app.use(express.json());

//Route handler: Create a user using the "/users" endpoint
app.post("/users", async (req, res) => {
  const user = new User(req.body); // create new user passing in require object

  //.save() returns a promise. Save to db
  try {
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Route handler: Read all users from the database using the '/users' endpoint
app.get("/users", async (req, res) => {
  // .find() returns a promise
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// Route handler: Read a user with a specific id using the "/users/:id" endpoint
app.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  // must be a string of 12 bytes or a string of 24 hex characters or an integer
  if (!ObjectId.isValid(req.params)) {
    return res
      .status(406)
      .send({ error: "User with that invalid id does not exist!" });
  }

  // .findById() returns a promise
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(404)
        .send({ error: "User not found or does not exist!" });
    }

    res.send(user);
  } catch (e) {
    res.status(500).send(e.name);
  }
});

//Route handler: Update a user with a specific id using the "users/:id" endpoint
app.patch("/users/:id", async (req, res) => {
  //compare requested updates to allowed updated per the model schema
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  const _id = req.params.id;

  // must be a string of 12 bytes or a string of 24 hex characters or an integer
  if (!ObjectId.isValid(req.params)) {
    return res
      .status(406)
      .send({ error: "User with that invalid id does not exist!" });
  }

  try {
    const user = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res
        .status(404)
        .send({ error: "User not found or does not exist!" });
    }

    res.send(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//Route handler: Create a task using the "/tasks" endpoint
app.post("/tasks", async (req, res) => {
  const task = new Task(req.body); // create new task passing in the required object

  //.save() returns a promise. Save to db
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Route handler: Read all tasks from the database using the '/tasks' endpoint
app.get("/tasks", async (req, res) => {
  //find() returns a promise
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// Route handler: Read a task with a specific id using the "/tasks/:id" endpoint
app.get("/tasks/:id", async (req, res) => {
  const _id = req.params.id;
  if (!ObjectId.isValid(_id)) {
    return res
      .status(406)
      .send({ error: "Task with that invalid id does not exist!" });
  }

  // findById() returns a promise
  try {
    const task = await Task.findById(_id);
    if (!task) {
      return res
        .status(404)
        .send({ error: "Task not found or does not exist!" });
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

//Route handler: Update a task with a specific id using the "tasks/:id" endpoint
app.patch("/tasks/:id", async (req, res) => {
  //compare requested updates to allowed updated per the model schema
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  const _id = req.params.id;

  // must be a string of 12 bytes or a string of 24 hex characters or an integer
  if (!ObjectId.isValid(req.params)) {
    return res
      .status(406)
      .send({ error: "Task with that invalid id does not exist!" });
  }

  try {
    const task = await Task.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res
        .status(404)
        .send({ error: "Task not found or does not exist!" });
    }

    res.send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// listen on the port xxxx at the server
app.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
