import express, { Response, Request } from "express";
const router = express.Router();
const client = require("../../../config/database");
const kafka = require("../../../config/kafka");
const { transactionLogger } = require("../../../config/winston");

router.get("/orders", async (req: Request, res: Response) => {
  const { status } = req.query;
  var page = Number(req.query.page);
  var items = Number(req.query.items);
  if (!(status == "succeeded" || status == "fulfilled")) {
    return res.status(400).json({ err: "Status Unidentified" });
  }
  if (!page) var page = 1;
  if (!items) var items = 10;
  try {
    let offset = ((page as any) - 1) * (items as any);
    let query =
      "SELECT order_id,customer_id,total,billing_address_id,order_status,date_created FROM orders WHERE order_status =$1 LIMIT $2 OFFSET $3";
    console.log(status);
    const getOrders = await client.query(query, [status, items, offset]);
    console.log(getOrders);
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
    let getOrder = await client.query(
      "SELECT * FROM order_items WHERE order_id=$1",
      [orderid]
    );

    res.status(200).json({ success: getOrder.rows });
  } catch (err) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    console.log(err);
    res.status(400).json({ err: err });
  }
});

module.exports = router;
