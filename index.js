const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
          expiresIn: "5h",
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
    // product insert by seller
    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await productsCollection.insertOne(products);
      res.send(result);
    });
    //product show for email
    // app.get("/users/:role", async (req, res) => {
    //   const role = req.params.role;
    //   const query = { role: role };
    //   const result = await usersCollection.find(query).toArray();
    //   res.send(result);
    // });
    app.get("/users/:role", async (req, res) => {
      const role = req.params.role;
      const query = { role: role };
      const user = await usersCollection.find(query).toArray();
      res.send(user);
    });

    //make verified
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          isVerified: "yes",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // product show in manage products
    app.get("/products", async (req, res) => {
      const query = {};
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    //product add verified by admin --
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          isVerified: "yes",
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // for seller data
    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    //info for seller add product
    app.get("/productInfo", async (req, res) => {
      const query = {};
      const result = await productsCollection
        .find(query)
        .project({ email: 1 })
        .toArray();
      res.send(result);
    });
    //user
    //allusers get
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    //post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //delete user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    //access oparation
    //admin for access
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //buyer for access
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "buyer" });
    });
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "seller" });
    });
    //cartorder
    //add to cart
    app.post("/cart", async (req, res) => {
      const cart = req.body;
      const result = await ordersCollection.insertOne(cart);
      res.send(result);
    });

    //cart or order show
    app.get("/cart", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });
    //for payment
    app.get("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.listen(port, console.log("Port running on", port));
