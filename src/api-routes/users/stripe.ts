import express, { Response, Request } from "express";
const router = express.Router();
const client = require("../../config/database");
const kafka = require("../../config/kafka");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripe = require("stripe")(stripeSecretKey);

//stripe Payment
router.post("/purchase", async (req: Request, res: Response) => {
  const items = req.body.items;
  const userid = req.session.userid;
  //check Biling Address Exists or Not
  let query = "SELECT id FROM user_address WHERE userid = $1";
  const checkAddress = await client.query(query, [userid]);
  if (checkAddress.rowCount === 0)
    return res.status(200).json({ message: "Please Add Billing Details" });
  try {
    let total = 0;
    let failed: [] = [];
    let success: [] = [];
    let Order = await finditem(items, total, failed, success);
    let totalAmount = Order.amount;
    let failedOrders = Order.failed;
    let succeeded = Order.success;

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
      let updateQuantity = await decreaseQuantity(succeeded);
    } else {
      // console.log(createCharge);
      return res.status(400).json({
        message: "Please try again later for payment",
        failed: failedOrders,
      });
    }
  } catch (err: any) {
    console.log(err);
    return res.status(400).json({
      message: "Please try again later for payment",
    });
  }
});

const decreaseQuantity = async (items: any) => {
  try {
    for (let item of items) {
      let pid = item.pid;
      let Quantity = item.quantity;
      await client.query("BEGIN");
      let query = "SELECT quantity FROM inventory WHERE id = $1";
      let query2 = "UPDATE inventory SET quantity = $1 WHERE id = $2";

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
  for (let item of items) {
    const id = item.pid;
    const quantity = item.quantity;
    let query = "SELECT price FROM products WHERE pid = $1";
    let query2 = "SELECT quantity FROM inventory WHERE id =$1";

    const getQuantity = await client.query(query2, [id]);
    let initialQuantity = getQuantity.rows?.[0].quantity;
    //check if given Quantity > Quantity in inventory
    if (quantity > initialQuantity) {
      let failedorder = await failedOrder(id);
      failed.push(failedorder);
      //console.log("failed  :" + failed);
    } else {
      //console.log("success :" + id);
      const getproduct = await client.query(query, [id]);
      let price: any = parseFloat(getproduct.rows?.[0].price).toFixed(2);
      total = total + price * quantity;
      success.push({ pid: id, quantity: quantity });
    }
  }
  console.log("map total :" + total);
  let finale = total.toFixed(2).toString().replace(".", "");
  let totalPrice = parseInt(finale);
  console.log(totalPrice);
  return { amount: totalPrice, success: success, failed: [failed] };
};

const failedOrder = async (pid: any) => {
  let failed = [];
  failed.push(pid);
  return failed;
};

module.exports = router;
