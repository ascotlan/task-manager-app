const express = require("express");
const router = new express.Router();
const Task = require("../models/task"); //import task model
const auth = require("../middleware/auth");

//Route handler: Create a task using the "/tasks" endpoint
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  }); // create new task passing in the required object

  //.save() returns a promise. Save to db
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// GET /tasks?completed=true OR /tasks?completed=false
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:asc OR /tasks?sortBy=createdAt:desc
// Route handler: Read all tasks from the database using the '/tasks' endpoint with optional queries
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const [key, order] = req.query.sortBy.split(":");
    sort[key] = order === "asc" ? 1 : -1;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    }); //populate virtual tasks file on user document
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// Route handler: Read a task with a specific id using the "/tasks/:id" endpoint
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

//Route handler: Update a task with a specific id using the "tasks/:id" endpoint
router.patch("/tasks/:id", auth, async (req, res) => {
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

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//Route handler: Delete a task using the "/tasks/:id" endpoint
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
