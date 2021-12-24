import express, { Response, Request } from "express";
import { billingid } from "../../controller/generateId";
const router = express.Router();
const client = require("../../config/database");
const { BillingDetails } = require("../../middlewares/validation");
const { transactionLogger } = require("../../config/winston");

//add address
router.post(
  "/userAddress",
  BillingDetails,
  async (req: Request, res: Response) => {
    const { address_line1, address_line2, city, postalCode, country, mobile } =
      req.body;
    const userid = req.session.userid;
    const checkaddress = await client.query(
      "SELECT id FROM user_address WHERE userid = $1",
      [userid]
    );
    if (checkaddress.rowCount != 0)
      return res.status(400).json({ err: "Address Alredy Exist" });
    try {
      await client.query("BEGIN");
      let query =
        "INSERT INTO user_address(id,userid,address_line1, address_line2, city, postal_code, country, mobile)VALUES($1,$2,$3,$4,$5,$6,$7,$8)";

      const billing_id = await billingid();
      let addbillingdetailes = await client.query(query, [
        billing_id,
        userid,
        address_line1,
        address_line2,
        city,
        postalCode,
        country,
        mobile,
      ]);
      await client.query("COMMIT");
      res.status(200).json({ success: "Address Added" });
    } catch (err) {
      transactionLogger.error(
        `userid:${req.session.userid},ip:${req.ip},Err:${err}`
      );
      console.log(err);
      res.json({ err: err });
      await client.query("ROLLBACK");
    }
  }
);

//del address
router.delete("/userAddress", async (req: Request, res: Response) => {
  const userid = req.session.userid;
  try {
    let query = "DELETE FROM user_address WHERE userid = $1";
    const deladdress = await client.query(query, [userid]);
    res.status(200).json({ success: "Address Deleted" });
  } catch (err) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    console.log(err);
    res.status(400).json({ err: err });
  }
});

//Update Address
router.put("/userAddress", async (req: Request, res: Response) => {
  const { address_line1, address_line2, city, postalCode, country, mobile } =
    req.body;
  const userid = req.session.userid;
  try {
    await client.query("BEGIN");
    let query =
      "UPDATE user_address SET address_line1 =$1,address_line2 =$2,city =$3,postal_code =$4,country =$5,mobile =$6 WHERE userid =$7";

    let addbillingdetailes = await client.query(query, [
      address_line1,
      address_line2,
      city,
      postalCode,
      country,
      mobile,
      userid,
    ]);
    await client.query("COMMIT");
    res.status(200).json({ success: "Address Updated" });
  } catch (err) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    console.log(err);
    res.json({ err: err });
    await client.query("ROLLBACK");
  }
});

module.exports = router;
