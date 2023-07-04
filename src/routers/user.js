const express = require("express");
const router = new express.Router();
const User = require("../models/user"); //import user model
const auth = require("../middleware/auth");
const multer = require("multer"); // require Multer middleware for file uploads
const sharp = require("sharp"); // require sharp Node.js module for image file formating
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../emails/account");

//Route handler: Sign up i.e. Create a user using the "/users" endpoint
router.post("/users", async (req, res) => {
  const user = new User(req.body); // create new user passing in require object

  //.save() returns a promise. Save to db
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name); //send welcome email
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
    sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// Pass file to route handler after validating, filesize, and file extention for multer middleware uploads
const upload = multer({
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

// Route handler: Post to /users/me/avatar to upload/update an avatar file
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    // error first callback that captures error thrown by multer middleware
    res.status(400).send({ error: error.message });
  }
);

// Route handler: Delete to /users/me/avatar to delete avatar file
router.delete("/users/me/avatar", auth, async (req, res) => {
  if (req.user.avatar) {
    req.user.avatar = undefined;
    await req.user.save();
    return res.send();
  }

  res.status(400).send();
});

//Route handler: GET to /users/:id/avatar to fetch avatar image by user id
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
