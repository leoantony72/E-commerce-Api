import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
const session = require("express-session");
require("dotenv").config();
const app = express();
const register = require("./api-routes/auth/register");
const verifyEmail = require("./api-routes/auth/verifyemail");
const login = require("./api-routes/auth/login");
const logout = require("./api-routes/auth/logout");
const forgotPassword = require("./api-routes/auth/forgotPassword");
const { redis } = require("./config/redis");
let RedisStore = require("connect-redis")(session);
const secret: string = process.env.SESSION_SECRET!;
//Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use("/api/auth", register);
app.use("/api/auth", login);
app.use("/api/auth", logout);
app.use("/api/auth", forgotPassword);
app.use("/api", verifyEmail);

app.get("/", (req: Request, res: Response) => {
  res.json("Server started");
});

//Server listen
app.listen(4000, () => {
  console.log(`Server Started at http://localhost:4000`);
});
