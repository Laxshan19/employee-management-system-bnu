const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("EMS Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});