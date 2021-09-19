import express, { NextFunction, Request, response, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
const router = express.Router();
const client = require("../../config/database");
const { Emailvalidation } = require("../../middlewares/validation");
const { sendResetPassword } = require("../../controller/nodemailer");
import { check } from "express-validator";

//forgot-password
router.post(
  "/forgotpassword",
  [Emailvalidation],
  async (req: Request, res: Response) => {
    //get the email

    const email = req.body.email;
    await client.query("BEGIN");
    const checkemail = await client.query(
      "SELECT userid FROM users WHERE email = $1",
      [email]
    );
    const userid = checkemail.rows?.[0].userid;
    const checktokenisPresent = await client.query(
      "SELECT token FROM tokens WHERE userid = $1",
      [userid]
    );
    if (checktokenisPresent.rowCount !== 0) {
      const oldtoken = checktokenisPresent.rows?.[0].token;
      const deltoken = await client.query(
        "DELETE FROM tokens WHERE userid = $1",
        [userid]
      );
    }

    if (checkemail.rowCount === 0) {
      await client.query("ROLLBACK"); //fix this u shit
      return res.json({ success: "EMail sent !" });
    }
    const token = await randomString(); //create token
    const tokenhash = await bcrypt.hash(token, 9); //generate a hash
    const expiry = +new Date() + 600000; //expirty date
    const query = "INSERT INTO tokens(userid,token,expiry)VALUES($1,$2,$3)"; //store token in db
    const reg = await client.query(query, [userid, tokenhash, expiry]);
    await client.query("COMMIT");
    res.json({ success: "Email sent" });
    const sent = await sendResetPassword(email, token, userid);
  }
);

//reset password verification & change password
router.post(
  "/reset-password/",
  [
    check(
      "password",
      "Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character. "
    )
      .trim()
      .notEmpty()
      .withMessage("Password required")
      .isLength({ min: 8 })
      .withMessage("password must be minimum 8 length")
      .matches(/(?=.*?[a-z])/)
      .withMessage("At least one Lowercase")
      .matches(/(?=.*?[0-9])/)
      .withMessage("At least one Number")
      .matches(/(?=.*?[#!@$%^&*-])/)
      .withMessage("At least one special character")
      .not()
      .matches(/^$|\s+/)
      .withMessage("White space not allowed"),
  ],
  async (req: Request, res: Response) => {
    // get passwords
    const { password, confirmPassword, email } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password not same" });
    }
    const userid = req.query.id;
    const token: any = req.query.rec;

    const checkuser = await client.query(
      "SELECT token,expiry FROM tokens WHERE userid = $1",
      [userid]
    );
    if (checkuser.rowCount === 0) {
      return res
        .status(400)
        .json({ error: "Invalid Token Or Token Have Expired" });
    }

    const dbtoken = checkuser.rows[0].token;
    const successResult = await bcrypt.compare(token, dbtoken);
    if (successResult === false) {
      return res
        .status(400)
        .json({ error: "Invalid Token Or Token Have Expired" });
    }
    const hash = await bcrypt.hash(password, 10);
    const updatepass = await client.query(
      "UPDATE users SET passwordhash = $1 WHERE userid = $2",
      [hash, userid]
    );
    res.status(200).json({ success: "Password Have Been Updated" });

    const deletetoken = await client.query(
      "DELETE FROM tokens WHERE userid = $1",
      [userid]
    ); //deletes the token after use
  }
);

module.exports = router;

async function randomString() {
  return crypto.randomBytes(64).toString("hex");
}
