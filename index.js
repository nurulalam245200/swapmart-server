const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//mideleware

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("SwapMart running on");
});
app.listen(port, console.log("Port running on", port));
