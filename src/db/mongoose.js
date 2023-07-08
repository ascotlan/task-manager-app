const mongoose = require("mongoose");

//Connect to the Mongodb database
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Mongodb connected!"))
  .catch((error) => console.log(error));
