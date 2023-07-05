const mongoose = require("mongoose");

//Connect to the Mongodb database
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("mongodb is connected"))
  .catch((error) => console.log(error));
