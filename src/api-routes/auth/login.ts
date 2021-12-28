import express, { Request, Response } from "express";
export const router = express.Router();
import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool as client } from "../../config/database";
import { sendLoginalert } from "../../controller/nodemailer";
import { Loginvalidation } from "../../middlewares/validation";

router.post("/login", Loginvalidation, async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (req.session.newsession)
    return res.status(400).json({ err: "You Are Alredy Logged In" });
  await client.query("BEGIN");
  const query =
    "SELECT userid,username,passwordhash,active,email FROM users WHERE username = $1";
  const result = await client.query(query, [username]);

  if (result.rowCount === 0)
    return res.status(400).json({ err: "Username Or Password Is Incorrect" });
  if (result.rows[0].active !== true)
    return res.status(400).json({ err: "Please Verify Your Eamil" });

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
    return res.status(400).json({ err: "Username Or Password Is Incorrect" });
  }
});

async function randomString() {
  return crypto.randomBytes(64).toString("hex");
}

export { router as login };
