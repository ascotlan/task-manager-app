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
app.post("/users", (req, res) => {
  const user = new User(req.body); // create new user passing in require object

  //.save() returns a promise. Save to db
  user
    .save()
    .then((userCreated) => {
      res.status(201).send(userCreated);
    })
    .catch((e) => {
      res.status(400).send(e.name);
    });
});

// Route handler: Read all users from the database using the '/users' endpoint
app.get("/users", (req, res) => {
  // .find() returns a promise
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch((e) => {
      res.status(500).send(e.name);
    });
});

// Route handler: Read a user with a specific id using the "/users/:id" endpoint
app.get("/users/:id", (req, res) => {
  const _id = req.params.id;

  // must be a string of 12 bytes or a string of 24 hex characters or an integer
  if (!ObjectId.isValid(req.params)) {
    return res.status(406).send("User with that invalid id does not exist!");
  }

  // .findById() returns a promise
  User.findById(_id)
    .then((user) => {
      if (!user) {
        return res.status(404).send("User not found or does not exist!");
      }

      res.send(user);
    })
    .catch((e) => res.status(500).send(e.name));
});

//Route handler: Create a task using the "/tasks" endpoint
app.post("/tasks", (req, res) => {
  const task = new Task(req.body); // create new task passing in the required object

  //.save() returns a promise. Save to db
  task
    .save()
    .then((taskCreated) => {
      //taskCreated the object echoed by the db after saving
      res.status(201).send(taskCreated);
    })
    .catch((e) => {
      res.status(400).send(e.name);
    });
});

// Route handler: Read all tasks from the database using the '/tasks' endpoint
app.get("/tasks", (req, res) => {
  //find() returns a promise
  Task.find({})
    .then((tasks) => res.send(tasks))
    .catch((e) => res.status(500).send(e.name));
});

// Route handler: Read a task with a specific id using the "/tasks/:id" endpoint
app.get("/tasks/:id", (req, res) => {
  const _id = req.params.id;
  if (!ObjectId.isValid(_id)) {
    return res.status(406).send("Task with that invalid id does not exist!");
  }

  // findById() returns a promise
  Task.findById(_id)
    .then((task) => {
      if (!task) {
        return res.status(404).send("Task not found or does not exist!");
      }

      res.send(task);
    })
    .catch((e) => res.status(500).send(e.name));
});

// listen on the port xxxx at the server
app.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
