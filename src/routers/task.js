const express = require("express");
const router = new express.Router();
const ObjectId = require("mongoose").Types.ObjectId;
const Task = require("../models/task"); //import task model

//Route handler: Create a task using the "/tasks" endpoint
router.post("/tasks", async (req, res) => {
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
router.get("/tasks", async (req, res) => {
  //find() returns a promise
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// Route handler: Read a task with a specific id using the "/tasks/:id" endpoint
router.get("/tasks/:id", async (req, res) => {
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
router.patch("/tasks/:id", async (req, res) => {
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
    const task = await Task.findById(_id);
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

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

//Route handler: Delete a task using the "/tasks/:id" endpoint
router.delete("/tasks/:id", async (req, res) => {
  const _id = req.params.id;

  // must be a string of 12 bytes or a string of 24 hex characters or an integer
  if (!ObjectId.isValid(req.params)) {
    return res
      .status(406)
      .send({ error: "Task with that invalid id does not exist!" });
  }

  try {
    const task = await Task.findByIdAndDelete(_id);

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

module.exports = router;
