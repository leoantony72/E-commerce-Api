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
    var total = 0;
    let amount = await finditem(items, total);

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
      amount: amount,
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
            amount,
            billing_address_id: checkAddress.rows?.[0].id,
            order_status: createCharge.status,
            payment_type: createCharge.payment_method,
            items,
          }),
        },
      ],
    });
    console.log(sentorder);

    if (createCharge.status === "succeeded") {
      console.log(createCharge);
      res.status(200).json({ message: "Successfully purchased items" });
    } else {
      console.log(createCharge);
      return res
        .status(400)
        .send({ message: "Please try again later for payment" });
    }
  } catch (err: any) {
    return res.status(400).json({
      err: err.message,
    });
  }
});

const finditem = async (items: any, total: any) => {
  for (let item of items) {
    const id = item.pid;
    let query = "SELECT price FROM products WHERE pid = $1";
    const getproduct = await client.query(query, [id]);
    let price: any = parseFloat(getproduct.rows?.[0].price).toFixed(2);
    let quantity = item.quantity;
    total = total + price * quantity;
  }

  let finale = total.toString().replace(".", "");
  let totalPrice = parseInt(finale);
  return totalPrice;
};

module.exports = router;
