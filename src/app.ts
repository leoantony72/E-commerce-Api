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
const paypal = require("./api-routes/admin/paypal");
const { redis } = require("./config/redis");
let RedisStore = require("connect-redis")(session);
const secret: string = process.env.SESSION_SECRET!;

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
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
app.use("/api", paypal);
app.use("/api", verifyEmail);
app.use("/api", getproducts);
app.use("/api", checkusername);
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
  res.json("Server started");
});

app.get("*", function (req, res) {
  res.status(404).json({ err: "Not Found" });
});

app.use(serverError);
//Server listen
app.listen(4000, () => {
  console.log(`Server Started at http://localhost:4000`);
});
