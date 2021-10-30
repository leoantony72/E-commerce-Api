import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import {
  active,
  Adminvalidate,
  Usersvalidate,
} from "./middlewares/authorization";
import { serverError } from "./middlewares/errhandler";
const session = require("express-session");
require("dotenv").config();
const app = express();
const fs = require("fs");
const fileUpload = require("express-fileupload");
const register = require("./api-routes/auth/register");
const getproducts = require("./api-routes/users/getProducts");
const ShoppingCart = require("./api-routes/users/shoppingCart");
const verifyEmail = require("./api-routes/auth/verifyemail");
const login = require("./api-routes/auth/login");
const logout = require("./api-routes/auth/logout");
const forgotPassword = require("./api-routes/auth/forgotPassword");
const product = require("./api-routes/admin/Product");
const updateproduct = require("./api-routes/admin/updateProduct");
const deleteproduct = require("./api-routes/admin/deleteProduct");
const add_discount = require("./api-routes/admin/discount");
const checkusername = require("./api-routes/users/checkUsername");
const { redis } = require("./config/redis");
let RedisStore = require("connect-redis")(session);
const secret: string = process.env.SESSION_SECRET!;
const client = require("./config/database");
const stripe = require("./api-routes/users/stripe");
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
//Middlewares
app.use(cors());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));
app.use("/images", express.static("images/"));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.use(
  session({
    store: new RedisStore({ client: redis }),
    secret: secret,
    name: "SESSION",
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      maxAge: 3600000 * 60 * 10,
      httpOnly: true,
      secure: false,
    },
  })
);

//Routes
app.use(active);
app.use("/api/auth", register);
app.use("/api/auth", login);
app.use("/api/auth", logout);
app.use("/api/auth", forgotPassword);
app.use("/api", verifyEmail);
app.use("/api", getproducts);
app.use("/api", checkusername);
app.use("/api", Usersvalidate, stripe);
app.use("/api", Usersvalidate, ShoppingCart);
app.use("/api/admin", Adminvalidate, product);
app.use("/api/admin", Adminvalidate, updateproduct);
app.use("/api/admin", Adminvalidate, deleteproduct);
app.use("/api/admin", Adminvalidate, add_discount);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.status === 400) {
    return res.status(400).json({ err: err.message });
  }
  if (err.status === 401) {
    return res.status(401).json({ err: err.message });
  }
  if (err.status === 403) {
    return res.status(403).json({ err: err.message });
  }
  if (err.status === 404) {
    return res.status(404).json({ err: "Not Found" });
  }

  next();
});

app.get("/", (req: Request, res: Response) => {
  let userid = req.session.userid;
  if (!userid) {
    return res.json("Not logged IN");
  }
  return res.json(userid);
});

//Ejs Store
app.get("/store", async (req, res) => {
  var limit = Number(req.query.limit);
  if (!limit) var limit = 11;
  try {
    await client.query("BEGIN");

    let query = "SELECT * FROM products LIMIT $1";
    let getproducts = await client.query(query, [limit]);
    await client.query("COMMIT");
    //render store page
    res.render("store.ejs", {
      stripePublicKey: stripePublicKey,
      items: { products: getproducts.rows },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    res.status(400).json({ err: err });
  }
});

app.get("*", function (req, res) {
  res.status(404).json({ err: "Not Found" });
});

app.use(serverError);
//Server listen
app.listen(4000, () => {
  console.log(`Server Started at http://localhost:4000`);
});
