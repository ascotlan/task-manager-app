const express = require("express");
const router = new express.Router();
const User = require("../models/user"); //import user model
const ObjectId = require("mongoose").Types.ObjectId;

//Route handler: Create a user using the "/users" endpoint
router.post("/users", async (req, res) => {
  const user = new User(req.body); // create new user passing in require object

  //.save() returns a promise. Save to db
  try {
    await user.save();
    const token = await user.generateAuthtoken();
    res.status(201).send({
      user,
      token,
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Route handler: Login with an existing account
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthtoken();

    res.send({
      user,
      token,
    });
  } catch (e) {
    res.status(400).send();
  }
});

// Route handler: Read all users from the database using the '/users' endpoint
router.get("/users", async (req, res) => {
  // .find() returns a promise
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// Route handler: Read a user with a specific id using the "/users/:id" endpoint
router.get("/users/:id", async (req, res) => {
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
router.patch("/users/:id", async (req, res) => {
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
    const user = await User.findById(req.params.id);
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

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

//Route handler: Delete a user using the "/users/:id" endpoint
router.delete("/users/:id", async (req, res) => {
  const _id = req.params.id;

  // must be a string of 12 bytes or a string of 24 hex characters or an integer
  if (!ObjectId.isValid(req.params)) {
    return res
      .status(406)
      .send({ error: "User with that invalid id does not exist!" });
  }

  try {
    const user = await User.findByIdAndDelete(_id);

    if (!user) {
      return res
        .status(404)
        .send({ error: "User not found or does not exist!" });
    }

    res.send(user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
