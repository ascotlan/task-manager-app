// REST API WITH NODE.JS, EXPRESS & MONGOOSE
const express = require("express"); //require express for CRUD operations in Node.js
require("./db/mongoose"); //require mongoose to ensure a connection between Mongo DB and this node.js runtime environment

const userRouter = require("./routers/user"); //get router from user route handling file
const taskRouter = require("./routers/task"); //get router from task route handling file

const app = express();

//Use this middleware to parse all incoming requests with JSON payloads into objects
app.use(express.json());

//Use this middleware to route requests to there corresponding endpoints
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
