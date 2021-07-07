/* eslint-disable no-unused-vars */
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const app = require("./app");
const port = process.env.PORT;
const db = process.env.DB_URI 
mongoose.connect(db, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const dbc = mongoose.connection;
dbc.on("error", console.error.bind(console, "Connection error:"));
dbc.once("open", function () {
  console.log("Database Connected");
});

app.listen(port, (req, res) => {
  console.log(`listening at port ${port}`);
});
