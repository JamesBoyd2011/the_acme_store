const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store"
);
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;
    
    CREATE TABLE users(
        id UUID PRIMARY KEY,
        username varchar(100) NOT NULL UNIQUE,
        password VARCHAR(100)
    );

    CREATE TABLE products(
        id UUID PRIMARY KEY,
        name VARCHAR(100)
    );

    CREATE TABLE favorites(
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES products(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT userFavorite UNIQUE (product_id, user_id)

    );
    `;
  await client.query(SQL);
};

const createProduct = async (name) => {
  const SQL = `
        INSERT INTO products(id,name) values ($1,$2) RETURNING *;
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createUser = async ({ username, password }) => {
  const SQL = `
        INSERT INTO users(id,username,password) values ($1,$2,$3) RETURNING *;
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = `
        Select * from users;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async () => {
  const SQL = `
        Select * from products;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchFavorites = async () => {
  const SQL = `
          Select * from favorites;
      `;
  const response = await client.query(SQL);
  return response.rows;
};

const createFavorite = async ({ product_id, user_id }) => {
  const SQL = `
        INSERT INTO favorites(id,product_id,user_id) values ($1,$2,$3) RETURNING *;
    `;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0];
};

const destroyFavorite = async ({ id, product_id, user_id }) => {
  const SQL = `
        DELETE FROM favorites where id = $1 and user_id = $2 and product_id = $3;
    `;
  const response = await client.query(SQL, [id, user_id, product_id]);
};
module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
};
