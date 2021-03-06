import express, { Response, Request } from "express";
const router = express.Router();
import { pool as client } from "../../../config/database";
const { transactionLogger } = require("../../../config/winston");

router.get("/orders", async (req: Request, res: Response) => {
  const { status } = req.query;
  let page = Number(req.query.page);
  let items = Number(req.query.items);
  if (!(status == "succeeded" || status == "fulfilled")) {
    return res.status(400).json({ err: "Status Unidentified" });
  }
  if (!page) page = 1;
  if (!items) items = 10;
  try {
    const offset = ((page as any) - 1) * (items as any);
    const query =
      "SELECT order_id,customer_id,total,billing_address_id,order_status,date_created FROM orders WHERE order_status =$1 LIMIT $2 OFFSET $3";
    console.log(status);
    const getOrders = await client.query(query, [status, items, offset]);
    //console.log(getOrders);
    res.status(400).json({ success: getOrders.rows });
  } catch (err) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    console.log(err);
    res.status(400).json({ err: "Something Went Wrong" });
  }
});

router.get("/order/:orderid", async (req: Request, res: Response) => {
  const { orderid } = req.params;

  try {
    const getOrder = await client.query(
      "SELECT * FROM order_items WHERE order_id=$1",
      [orderid]
    );
    const getcustomer = await client.query(
      "SELECT order_id,customer_id,total,billing_address_id,order_status,date_created FROM orders WHERE order_id=$1",
      [orderid]
    );
    const customerId = getcustomer.rows[0].customer_id;
    console.log(customerId);

    const getcustomerDetails = await client.query(
      "SELECT ua.userid,us.username,us.email,us.user_ip,ua.address_line1,ua.address_line2,ua.city,ua.country,ua.postal_code,ua.mobile FROM user_address AS ua JOIN users us ON us.userid = ua.userid WHERE ua.userid =$1;",
      [customerId]
    );

    res.status(200).json({
      success: { order: getOrder.rows, customer: getcustomerDetails.rows },
    });
  } catch (err) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    console.log(err);
    res.status(400).json({ err: err });
  }
});

export { router as getOrders };
