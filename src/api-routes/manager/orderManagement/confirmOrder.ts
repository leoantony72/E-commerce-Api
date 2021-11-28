import express, { Response, Request } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { CLIENT_RENEG_LIMIT } from "tls";
const router = express.Router();
const client = require("../../../config/database");
const { sendOtp } = require("../../../controller/nodemailer");

router.post("/confirmdelivery", async (req: Request, res: Response) => {
  const userid = req.query.uid;
  const orderid = req.query.oid;
  const token: any = req.query.token;

  try {
    await client.query("BEGIN");
    //Check if order is alredy fulfilled
    let query1 =
      "SELECT order_status FROM orders WHERE customer_id=$1 AND order_id =$2";
    const getStatus = await client.query(query1, [userid, orderid]);
    let status = getStatus.rows?.[0].order_status;
    if (getStatus.rowCount === 0)
      return res.status(400).json({ err: "Order NOt found" });
    if (status === "fulfilled")
      return res.status(400).json({ err: "Order Alredy fulfilled" });

    //check token
    let query2 = "SELECT token,expiry FROM tokens WHERE userid=$1";
    const getToken = await client.query(query2, [userid]);
    if (getToken.rowCount === 0)
      return res.status(400).json({ err: "Invalid Token" });
    let dbtoken = getToken.rows?.[0].token;
    console.log(dbtoken);
    let expiry = getToken.rows?.[0].expiry;
    console.log(expiry);
    const now = Date.now();
    if (now > expiry) {
      const deletetoken = await client.query(
        "DELETE FROM tokens WHERE userid = $1",
        [userid]
      );
      return res
        .status(400)
        .json({ err: "Invalid Token Or Have Been Expired" });
    }
    const successResult = await bcrypt.compare(token, dbtoken);
    if (successResult === false) {
      return res
        .status(400)
        .json({ err: "Invalid Token Or Token Have Expired" });
    }

    let orderstatus = "fulfilled";
    let query3 =
      "UPDATE orders SET order_status=$1 WHERE customer_id=$2 AND order_id=$3";
    const updateStaus = await client.query(query3, [
      orderstatus,
      userid,
      orderid,
    ]);
    const deletetoken = await client.query(
      "DELETE FROM tokens WHERE userid = $1",
      [userid]
    );
    await client.query("COMMIT");
    res.json({ success: "Confirmed Order Delivered" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    res.status(400).json({ err: "Something Went Wrong" });
  }
});

module.exports = router;
