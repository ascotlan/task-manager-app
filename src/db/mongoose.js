const mongoose = require("mongoose");

//Connect to the Mongodb database
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log(process.env.MONGODB_URL))
  .catch((error) => console.log(error));
