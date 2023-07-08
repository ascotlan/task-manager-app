const { expect, assert } = require("chai");
const request = require("supertest");
const Task = require("../src/models/task");
const app = require("../src/app");
const { userOne, userTwo, setupDatabase, taskOne } = require("./fixtures/db");

describe("Route handler task testing for each endpoint", () => {
  beforeEach(setupDatabase);
  it("Should create task for user", async () => {
    const response = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: "From my tests",
      });

    assert.equal(response.status, 201);

    const task = await Task.findById(response.body._id);

    assert.isNotNull(task);
    assert.equal(task.completed, false);
  });

  it("Should request all tasks for user one", async () => {
    const response = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send();

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 2);
  });

  it("Should attempt to have userTwo delete userOne's first task and fail", async () => {
    const response = await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send();

    assert.equal(response.status, 404);

    const task = await Task.findById(taskOne._id);

    assert.isNotNull(task);
  });
});
