const { expect, assert } = require("chai");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

describe("Route handler user testing for each endpoint ", () => {
  beforeEach(setupDatabase);

  it("Should signup a new user", async () => {
    const response = await request(app).post("/users").send({
      name: "Antonio",
      email: "antonio@example.com",
      password: "MyPass777!",
    });

    // Assert that response status is 201
    assert.equal(response.status, 201);

    //Assert that the user created in the db is not null i.e. user created
    const user = await User.findById(response.body.user._id);
    assert.isNotNull(user);

    //Assertions about the plain text password hashing in db
    assert.notEqual(user.password, "MyPass777!");
  });

  it("Should login existing user", async () => {
    const response = await request(app).post("/users/login").send({
      email: userOne.email,
      password: userOne.password,
    });

    assert.equal(response.status, 200);

    //fetch user from the db
    const user = await User.findById(response.body.user._id);

    //Assert that token in response matches users second token that created upon first login after user creation
    assert.equal(response.body.token, user.tokens[1].token);
  });

  it("Should not login nonexistent user", async () => {
    const response = await request(app).post("/users/login").send({
      email: "antonio@example.com",
      password: "MyPass777!",
    });

    assert.equal(response.status, 400);
  });

  it("Should get profile for user", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`) //set authorization header. Token in header must match token in user document, token array in the database, and the token must not be expired inorder to fetch user profile
      .send();
    assert.equal(response.status, 200);
  });

  it("Should not get profile for unauthenticated user", async () => {
    const response = await request(app).get("/users/me").send();
    assert.equal(response.status, 401);
  });

  it("Should delete account for user", async () => {
    const response = await request(app)
      .delete("/users/me")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send();

    assert.equal(response.status, 200);

    //fetch user from the db
    const user = await User.findById(userOneId);

    //Assert that user object is null i.e. it is deleted from the db
    assert.isNull(user);
  });

  it("Should not delete account for unauthenticated user", async () => {
    const response = await request(app).delete("/users/me").send();

    assert.equal(response.status, 401);
  });

  it("Should upload avatar image", async () => {
    const response = await request(app)
      .post("/users/me/avatar")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .attach("avatar", "test/fixtures/profile-pic.jpg");

    assert.equal(response.status, 200);

    const user = await User.findById(userOneId);

    expect(user.avatar).to.be.instanceof(Buffer);
  });

  it("Should update valid user fields", async () => {
    const response = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({
        name: "John",
      });

    assert.equal(response.status, 200);

    const user = await User.findById(userOneId);
    assert.equal(user.name, "John");
  });

  it("Should not update invalid user fields", async () => {
    const response = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({
        location: "Waterloo, ON",
      });

    assert.equal(response.status, 400);

    const user = await User.findById(userOneId);
    assert.equal(user.location, undefined);
  });
});
