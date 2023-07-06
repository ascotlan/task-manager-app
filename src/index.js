const app = require("./app");

const port = process.env.PORT; //Set port to value provided by environment or default to 3000

// listen on the port xxxx at the server
app.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
