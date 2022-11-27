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
//JWT TOKEN function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized Access");
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
    if (error) {
      return res.status(403).send(message, "Forbiden Accesss");
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const productsCategoryCollection = client
      .db("swapMart")
      .collection("productsCategory");
    const productsCollection = client.db("swapMart").collection("products");
    const sellersCollection = client.db("swapMart").collection("sellers");
    const usersCollection = client.db("swapMart").collection("users");
    const ordersCollection = client.db("swapMart").collection("orders");

    //jwt
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    //products category load
    app.get("/productsCategory", async (req, res) => {
      const query = {};
      const result = await productsCategoryCollection.find(query).toArray();
      res.send(result);
    });

    //get categoryproducts
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { category_Id: id };
      const result = await productsCollection.find(filter).toArray();
      res.send(result);
    });

    //user

    //post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //cartorder
    //add to cart
    app.post("/cart", verifyJWT, async (req, res) => {
      const cart = req.body;
      const result = await ordersCollection.insertOne(cart);
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.listen(port, console.log("Port running on", port));
