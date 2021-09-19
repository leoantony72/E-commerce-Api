import express, { NextFunction, Request, response, Response } from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import crypto from "crypto";
const { Userid } = require("../../controller/generateId");
const client = require("../../config/database");
const { redis } = require("../../config/redis");
const { validation } = require("../../middlewares/validation");
const { sendEmailVerification } = require("../../controller/nodemailer");

//Register auth
router.post(
  "/register",
  validation,
  async (req: Request, res: Response) => {
    const { username, email, password, confirmPassword } = req.body;
    if (password != confirmPassword) {
      return res.json({ error: "password does not match" });
    }
    //check username in redis Bloom filter
    const user = username.toLowerCase();
    const checkUsername = await redis.call("BF.EXISTS", "usernames", user);
    if (checkUsername === 1)
      return res.status(400).json({ error: "Username Taken" });
    //check email in Pg Database
    const query = "SELECT email FROM users WHERE email = $1";
    const checkEmail = await client.query(query, [email]);
    if (checkEmail.rowCount !== 0) return res.json({ error: "Invalid Email" });
    //hash Password
    const hashedpass = await bcrypt.hash(password, 10);
    const userID = await Userid();
    const date = new Date();
    const token = await randomString();
    const expiry = +new Date() + 1800000;
    const ip = req.ip;
    //insert data to DB
    const emailquery =
      "INSERT INTO users(userid,username,passwordhash,email,registered_at,token,expiry,user_ip)VALUES($1,$2,$3,$4,$5,$6,$7,$8)";
    await client.query("BEGIN");
    const registeruser = await client.query(emailquery, [
      userID,
      username,
      hashedpass,
      email,
      date,
      token,
      expiry,
      ip,
    ]);
    //send response back
    await client.query("COMMIT");
    res.status(202).json({ success: "User created successfully" });
    const AddUsername = await redis.call("BF.ADD", "usernames", user);
    await sendEmailVerification(email, token);
  }
);

module.exports = router;

//Create random string fro session
async function randomString() {
  return crypto.randomBytes(64).toString("hex");
}
