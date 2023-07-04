const express = require("express");
const router = new express.Router();
const User = require("../models/user"); //import user model
const auth = require("../middleware/auth");
const multer = require("multer"); // require Multer middleware for file uploads

//Route handler: Sign up i.e. Create a user using the "/users" endpoint
router.post("/users", async (req, res) => {
  const user = new User(req.body); // create new user passing in require object

  //.save() returns a promise. Save to db
  try {
    await user.save();
    const token = await user.generateAuthtoken(); //generate a new JWT
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

    const token = await user.generateAuthtoken(); //generate a new JWT

    //when we call res.send() it calls JSON.stringify on the objects passed as arguments
    res.send({
      user,
      token,
    });
  } catch (e) {
    res.status(400).send();
  }
});

//Route handler: Logout from an existing single user account
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token; //filter out the tokens that are not the one that was just used to authenticate, effectively removing the current authentication token
    });

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//Route handler: Logout from all user sessions for a particular user
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = []; //remove all tokens from User model
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Route handler: Read a user profile from the database using the '/users/me' endpoint
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//Route handler: Update a user with a specific id using the "users/:id" endpoint
router.patch("/users/me", auth, async (req, res) => {
  //compare requested updates to allowed updated per the model schema
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//Route handler: Delete a user using the "/users/:id" endpoint
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// set destination directory, filesize, and file extention for multer middleware uploads
const upload = multer({
  dest: "avatars/",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(
        new Error(
          "Please upload an image file with .png, .jpg or .jpeg extention"
        )
      );
    }

    cb(undefined, true);
  },
});

// Route handler: Post to /users/me/avatar to upload a file
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  (req, res) => {
    res.send();
  },
  (error, req, res, next) => {
    // error first callback that captures error thrown by multer middleware
    res.status(400).send({ error: error.message });
  }
);

module.exports = router;
