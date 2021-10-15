import express, { Response, Request } from "express";

const router = express.Router();
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "live", //sandbox or live
  client_id: process.env.PAYPAL_CLIENT,
  client_secret: process.env.PAYPAL_SECRET,
});

router.post("/pay", (req: Request, res: Response) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:4000/api/success",
      cancel_url: "http://localhost:4000/api/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: "25.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "25.00",
        },
        description: "Hat for the best team ever",
      },
    ],
  };

  paypal.payment.create(
    create_payment_json,
    function (error: string, payment: any) {
      if (error) {
        console.log(error);
        res.status(400).json({ err: error });
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.redirect(payment.links[i].href);
          }
        }
      }
    }
  );
});

router.get("/success", (req: Request, res: Response) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "25.00",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error: any, payment: any) {
      if (error) {
        console.log(error.response);
        res.status(400).json({ err: error });
      } else {
        console.log(JSON.stringify(payment));
        res.send("Success");
      }
    }
  );
});

router.get("/cancel", (req: Request, res: Response) => res.send("Cancelled"));
module.exports = router;
