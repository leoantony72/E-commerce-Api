import express, { NextFunction, Request, response, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
const router = express.Router();
const client = require("../../config/database");
const { sendLoginalert } = require("../../controller/nodemailer");
const { Loginvalidation } = require("../../middlewares/validation");

router.post(
  "/login",
  [Loginvalidation],
  async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (req.session.newsession)
      return res.status(400).json({ error: "You Are Alredy Logged In" });
    await client.query("BEGIN");
    const query =
      "SELECT username,passwordhash,active,email FROM users WHERE username = $1";
    const result = await client.query(query, [username]);

    if (result.rowCount === 0)
      return res
        .status(400)
        .json({ error: "Username Or Password Is Incorrect" });
    if (result.rows[0].active !== true)
      return res.status(400).json({ error: "Please Verify Your Eamil" });

    const email = result.rows[0].email;
    const saltedPassword = result.rows[0].passwordhash;
    const successResult = await bcrypt.compare(password, saltedPassword);
    if (successResult === true) {
      const session = await randomString();
      req.session.newsession = session;
      req.session.userid = result.rows[0].userid;
      req.session.createdAt = Date.now();
      await client.query("COMMIT");
      res.status(201).json({ success: "Logged in successfully!" });
      await sendLoginalert(email);
    } else {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Username Or Password Is Incorrect" });
    }
  }
);

module.exports = router;
async function randomString() {
  return crypto.randomBytes(64).toString("hex");
}
