import express, { Response, Request } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
const router = express.Router();
import {pool as client} from "../../../config/database"
import {sendOtp} from "../../../controller/nodemailer"
const { transactionLogger } = require("../../../config/winston");

router.post("/updateorder/:oid", async (req: Request, res: Response) => {
  const { oid } = req.params;

  const query = "SELECT customer_id,order_status FROM orders WHERE order_id=$1";
  const getCustomerid = await client.query(query, [oid]);
  if (getCustomerid.rowCount === 0)
    return res.status(400).json({ err: "Somethings Wrong" });
  const order_status = getCustomerid.rows?.[0].order_status;
  //Checks if the order is fulfilled
  if (order_status === "fulfilled")
    return res.status(400).json({ err: "Order Alredy Deliverd" });
  const userid = getCustomerid.rows?.[0].customer_id;
  const checkiftokenexists = await client.query(
    "SELECT token,expiry FROM tokens WHERE userid=$1",
    [userid]
  );
  if (checkiftokenexists.rowCount != 0) {
    const deletetoken = await client.query(
      "DELETE FROM tokens WHERE userid = $1",
      [userid]
    );
  }
  try {
    if (!userid) return res.status(400).json({ err: "User Not Found" });

    await client.query("BEGIN");
    const query2 = "SELECT email FROM users WHERE userid=$1";
    const getEmail = await client.query(query2, [userid]);
    const email = getEmail.rows?.[0].email;

    const otp = Otp();
    const tokenhash = await bcrypt.hash(otp, 9);
    const expiry = +new Date() + 1200000;

    //Insert into DB
    const query3 = "INSERT INTO tokens(userid,token,expiry)VALUES($1,$2,$3)";

    const insertOtp = await client.query(query3, [userid, tokenhash, expiry]);
    await client.query("COMMIT");
    //send Email
    const sendOtp_Email = await sendOtp(email, otp, oid, userid);
    console.log(sendOtp_Email);
    res.status(200).json({ success: "Otp Sent" });
  } catch (err) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    await client.query("ROLLBACK");
    console.log(err);
    res.status(400).json({ err: "Something Went Wrong" });
  }
});

function Otp() {
  const n = crypto.randomBytes(64).toString("hex");
  console.log(n);
  return n;
}
export { router as sentotp };