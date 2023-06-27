// REST API WITH NODE.JS, EXPRESS & MONGOOSE

const express = require("express"); //require express for CRUD operations in Node.js
require("./db/mongoose"); //require mongoose to ensure a connection between Mongo DB and this node.js runtime environment

const userRouter = require("./routers/user"); //get router from user route handling file
const taskRouter = require("./routers/task");//get router from task route handling file

const app = express();
const port = process.env.PORT || 3000; //Set port to value provided by environment or default to 3000

//Use this middleware to parse all incoming JSON requests into an object
app.use(express.json());

//Use this middleware to route requests to there corresponding endpoints
app.use(userRouter);
app.use(taskRouter);



// listen on the port xxxx at the server
app.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
