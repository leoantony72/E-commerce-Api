import express, { Request, Response } from "express";
import { Coupon } from "../../controller/generateId";
const router = express.Router();
const client = require("../../config/database");

//Adds Discount Coupon to db
router.post("/add_discount/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { discount, description } = req.body;
  var active: boolean = req.body.active;
  console.log(discount);

  if (!discount) return res.json({ success: "Provide Discount Value" });
  if (!active) var active = false;
  let coupon = Coupon();
  const created_at = new Date();

  await client.query("BEGIN");
  let query =
    "INSERT INTO discount(id,coupon,description,discount_percent,active,created_at)VALUES($1,$2,$3,$4,$5,$6)";

  let add_discount = await client.query(query, [
    id,
    coupon,
    description,
    discount,
    active,
    created_at,
  ]);
  await client.query("COMMIT");
  return res.json({ success: "Discount coupon Added" });
});

//Activates Discount Coupon -- Default Flase
router.get("/activate/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  await client.query("BEGIN");
  let query = "UPDATE discount SET active = true WHERE coupon = $1";
  let add_discount = await client.query(query, [id]);
  await client.query("COMMIT");
  return res.json({ success: "Discount coupon Activated" });
});

router.get("/discount/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const query = "SELECT * FROM discount WHERE id = $1";
  const getDiscount = await client.query(query, [id]);
  res.json({ discount: getDiscount.rows });
});

module.exports = router;
