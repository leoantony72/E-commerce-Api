import express, { Response, Request } from "express";
const router = express.Router();
import { pool as client } from "../../config/database";
import { kafka } from "../../config/kafka";

const { transactionLogger } = require("../../config/winston");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripe = require("stripe")(stripeSecretKey);

//stripe Payment
router.post("/purchase", async (req: Request, res: Response) => {
  const items = req.body.items;
  const userid = req.session.userid;
  //check Biling Address Exists or Not
  const query = "SELECT id FROM user_address WHERE userid = $1";
  const checkAddress = await client.query(query, [userid]);
  if (checkAddress.rowCount === 0)
    return res.status(200).json({ message: "Please Add Billing Details" });
  try {
    const total = 0;
    const failed: [] = [];
    const success: [] = [];
    const Order = await finditem(items, total, failed, success);
    const totalAmount = Order.amount;
    const failedOrders = Order.failed;
    const succeeded = Order.success;

    console.log(
      "Orders  Failed  :" +
        Order.failed +
        ":  Amount  :" +
        totalAmount +
        ":  Orders succeed  :" +
        succeeded
    );

    //Create Charge In Stripe
    const createCharge = await stripe.charges.create({
      shipping: {
        name: "Jenny Rosen",
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      },
      amount: Order.amount,
      source: req.body.stripeTokenId,
      currency: "usd",
      description: "test Shopping Cart",
    });

    const producer = kafka.producer();
    await producer.connect();

    const sentorder = await producer.send({
      topic: "orders",
      messages: [
        {
          key: req.session.userid,
          value: JSON.stringify({
            order_id: createCharge.id,
            customer_id: userid,
            amount: totalAmount,
            billing_address_id: checkAddress.rows?.[0].id,
            order_status: createCharge.status,
            payment_type: createCharge.payment_method,
            succeeded,
          }),
        },
      ],
    });

    if (createCharge.status === "succeeded") {
      // console.log(createCharge);
      res.status(200).json({
        message: "Successfully purchased items",
        failed: failedOrders,
      });
      const updateQuantity = await decreaseQuantity(succeeded);
    } else {
      // console.log(createCharge);
      return res.status(400).json({
        message: "Please try again later for payment",
        failed: failedOrders,
      });
    }
  } catch (err: any) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    console.log(err);
    return res.status(400).json({
      message: "Please try again later for payment",
    });
  }
});

const decreaseQuantity = async (items: any) => {
  try {
    for (const item of items) {
      const pid = item.pid;
      const Quantity = item.quantity;
      await client.query("BEGIN");
      const query = "SELECT quantity FROM inventory WHERE id = $1";
      const query2 = "UPDATE inventory SET quantity = $1 WHERE id = $2";

      const getquantity = await client.query(query, [pid]);
      const initialquantity = getquantity.rows?.[0].quantity;

      const finalquantity = initialquantity - Quantity;
      //console.log("FINAL QUANTITY  :" + finalquantity);

      const updateQuantity = await client.query(query2, [finalquantity, pid]);
      //console.log(updateQuantity);
      await client.query("COMMIT");
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    return err;
  }
};

const finditem = async (items: any, total: any, success: any, failed: any) => {
  for (const item of items) {
    const id = item.pid;
    const quantity = item.quantity;
    const query = "SELECT price FROM products WHERE pid = $1";
    const query2 = "SELECT quantity FROM inventory WHERE id =$1";

    const getQuantity = await client.query(query2, [id]);
    const initialQuantity = getQuantity.rows?.[0].quantity;
    //check if given Quantity > Quantity in inventory
    if (quantity > initialQuantity) {
      const failedorder = await failedOrder(id);
      failed.push(failedorder);
      //console.log("failed  :" + failed);
    } else {
      //console.log("success :" + id);
      const getproduct = await client.query(query, [id]);
      const price: any = parseFloat(getproduct.rows?.[0].price).toFixed(2);
      total = total + price * quantity;
      success.push({ pid: id, quantity: quantity });
    }
  }
  console.log("map total :" + total);
  const finale = total.toFixed(2).toString().replace(".", "");
  const totalPrice = parseInt(finale);
  console.log(totalPrice);
  return { amount: totalPrice, success: success, failed: [failed] };
};

const failedOrder = async (pid: any) => {
  const failed: string[] = [];
  failed.push(pid);
  return failed;
};
export { router as stripe };
