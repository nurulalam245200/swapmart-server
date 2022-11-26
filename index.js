const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
//mideleware

app.use(cors());
app.use(express.json());

//oparation
app.get("/", async (req, res) => {
  res.send("SwapMart running on");
});

//database oparation

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3kkv8ke.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const productsCategoryCollection = client
      .db("swapMart")
      .collection("productsCategory");
    const productsCollection = client.db("swapMart").collection("products");

    //products category load
    app.get("/productsCategory", async (req, res) => {
      const query = {};
      const result = await productsCategoryCollection.find(query).toArray();
      res.send(result);
    });

    //get products
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { category_Id: id };
      const result = await productsCollection.find(filter).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.listen(port, console.log("Port running on", port));
