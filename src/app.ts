import express, { Request, Response, NextFunction } from "express";
const app = express();
import cors from "cors";
import morgan from "morgan";
import {
  active,
  Adminvalidate,
  Usersvalidate,
  Managervalidate,
  Shippervalidate,
} from "./middlewares/authorization";
import { serverError } from "./middlewares/errhandler";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
const RedisStore = require("connect-redis")(session);
import fileUpload from "express-fileupload";
import { redis } from "./config/redis";
import { register } from "./api-routes/auth/register";
import { getproducts } from "./api-routes/users/getProducts";
import { ShoppingCart } from "./api-routes/users/shoppingCart";
import { verifyEmail } from "./api-routes/auth/verifyemail";
import { login } from "./api-routes/auth/login";
import { logout } from "./api-routes/auth/logout";
import { forgotPassword } from "./api-routes/auth/forgotPassword";
import { sentotp } from "./api-routes/manager/orderManagement/updateOrderstatus";
import { confirmDelivery } from "./api-routes/manager/orderManagement/confirmOrder";
import { addBillingdetail } from "./api-routes/users/addbillingAddress";
import { rating } from "./api-routes/users/ratings";
import { product } from "./api-routes/admin/Product";
import { getOrders } from "./api-routes/manager/orderManagement/getOrders";
import { updateproduct } from "./api-routes/admin/updateProduct";
import { deleteproduct } from "./api-routes/admin/deleteProduct";
import { add_discount } from "./api-routes/admin/discount";
import { checkusername } from "./api-routes/users/checkUsername";
import { pool as client } from "./config/database";
import { stripe } from "./api-routes/users/stripe";
const { transactionLogger } = require("./config/winston");
const secret: string = process.env.SESSION_SECRET!;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

//Middlewares
app.use(cors());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
const accessLogStream = fs.createWriteStream("./logs/http.log", { flags: "a" });

// Setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

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
    proxy: true,
    cookie: {
      path: "/",
      maxAge: 3600000 * 60 * 10,
      httpOnly: false,
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
app.use("/api", rating);
app.use("/api", Usersvalidate, stripe);
app.use("/api", Usersvalidate, ShoppingCart);
app.use("/api", Usersvalidate, addBillingdetail);
app.use("/api/manager", Managervalidate, getOrders);
app.use("/api/shipper", Shippervalidate, sentotp);
app.use("/api/order", Usersvalidate, confirmDelivery);
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
  const userid = req.session.userid;
  if (!userid) {
    return res.json("Not logged IN");
  }
  return res.json(userid);
});

//Ejs Store
app.get("/store", async (req, res) => {
  let limit = Number(req.query.limit);
  if (!limit) limit = 11;
  try {
    await client.query("BEGIN");

    const query = "SELECT * FROM products LIMIT $1";
    const getproducts = await client.query(query, [limit]);
    await client.query("COMMIT");
    //render store page
    res.render("store.ejs", {
      stripePublicKey: stripePublicKey,
      items: { products: getproducts.rows },
    });
  } catch (err) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
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
