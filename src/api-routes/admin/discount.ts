import express, { Request, Response } from "express";
import { Coupon } from "../../controller/generateId";
const router = express.Router();
import { pool as client } from "../../config/database";

//Adds Discount Coupon to db
router.post("/add_discount/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { discount, description } = req.body;
  let active: boolean = req.body.active;
  console.log(discount);

  if (!discount) return res.json({ success: "Provide Discount Value" });
  if (!active) active = false;
  const coupon = Coupon();
  const created_at = new Date();

  const checkproducts = await client.query(
    "SELECT price FROM products WHERE pid = $1",
    [id]
  );
  if (checkproducts.rowCount === 0) {
    return res.status(400).json({ err: "Product Not Found" });
  }

  await client.query("BEGIN");
  const query =
    "INSERT INTO discount(id,coupon,description,discount_percent,active,created_at)VALUES($1,$2,$3,$4,$5,$6)";

  const add_discount = await client.query(query, [
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
  const query = "UPDATE discount SET active = true WHERE coupon = $1";
  const add_discount = await client.query(query, [id]);
  await client.query("COMMIT");
  return res.json({ success: "Discount coupon Activated" });
});

router.get("/discount/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const query = "SELECT * FROM discount WHERE id = $1";
  const getDiscount = await client.query(query, [id]);
  res.json({ discount: getDiscount.rows });
});

export { router as add_discount };
