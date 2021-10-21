import express, { Response, Request } from "express";
import { ClientRequest } from "http";
const router = express.Router();
const client = require("../../config/database");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripe = require("stripe")(stripeSecretKey);

//stripe Payment
router.post("/purchase", async (req: Request, res: Response) => {
  const items = req.body.items;
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

    console.log("amount" + amount);

    if (createCharge.status === "succeeded") {
      console.log(createCharge);
      return res.status(200).json({ message: "Successfully purchased items" });
    } else {
      console.log(createCharge);
      return res
        .status(400)
        .send({ err: "Please try again later for payment" });
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
    console.log(total)
  }

  console.log("map total :" + total);
  let finale = total.toString().replace(".", "");
  let totalPrice = parseInt(finale);
  console.log(totalPrice);
  return totalPrice;
};

module.exports = router;
