const express = require("express");
const bodyParser = require("body-parser");

const {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
} = require("./db");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(await createFavorite(req.params));
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:id/favorites/:id", async (req, res, next) => {
  try {
    res.status(204).send(await destroyFavorite(req.params));
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  console.log("conneting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log(`created tables`);
  const [ice, paper, james] = await Promise.all([
    createProduct({ name: "Ice" }),
    createProduct({ name: "Paper" }),
    createUser({ username: "James", password: "asdf" }),
  ]);
  console.log(await fetchUsers());
  console.log(await fetchProducts());

  const [favorite] = await Promise.all([
    createFavorite({
      product_id: paper.id,
      user_id: james.id,
    }),
  ]);
  console.log(await fetchFavorites());

  // destroyFavorite({ id: favorite.id, user_id: james.id, product_id: paper.id });
  console.log(await fetchFavorites());

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
