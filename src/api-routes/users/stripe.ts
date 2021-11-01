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
  console.log(checkAddress);
  if (checkAddress.rowCount === 0)
    return res.status(200).json({ message: "Please Add Billing Details" });
  try {
    var total = 0;
    let amount = await finditem(items, total);

    const producer = kafka.producer();
    await producer.connect();
    const sentorder = await producer.send({
      topic: "orders",
      messages: [
        {
          key: req.session.userid,
          value: JSON.stringify({ items, amount }),
        },
      ],
    });
    console.log(sentorder);

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

    console.log("amount" + amount);

    if (createCharge.status === "succeeded") {
      console.log(createCharge);
      return res.status(200).json({ message: "Successfully purchased items" });
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
    console.log(id);
    let query = "SELECT price FROM products WHERE pid = $1";
    const getproduct = await client.query(query, [id]);
    // console.log(JSON.stringify(getproduct.rows[0]));
    let price: any = parseFloat(getproduct.rows?.[0].price).toFixed(2);
    console.log(price);
    let quantity = item.quantity;
    total = total + price * quantity;
    console.log(total);
  }

  console.log("map total :" + total);
  let finale = total.toString().replace(".", "");
  let totalPrice = parseInt(finale);
  console.log(totalPrice);
  return totalPrice;
};

module.exports = router;
