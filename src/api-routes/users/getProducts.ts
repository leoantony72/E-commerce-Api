import express, { Response, Request, Router } from "express";

const router = express.Router();
const client = require("../../config/database");

router.get("/products", async (req: Request, res: Response) => {
  var limit = Number(req.query.limit);
  if (!limit) var limit = 11;
  try {
    await client.query("BEGIN");

    let query = "SELECT * FROM products LIMIT $1";
    let getpoducts = await client.query(query, [limit]);
    await client.query("COMMIT");
    return res.json({ products: getpoducts.rows });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    res.status(400).json({ err: err });
  }
});

router.get("/products/:pid", async (req: Request, res: Response) => {
  const { pid } = req.params;

  //@Implement Cashing Here

  await client.query("BEGIN");
  let query =
    "SELECT p.pid,p.title,p.image,p.created_At,p.summary,p.price,pc.name AS category,inv.quantity AS stock FROM products AS p JOIN product_category pc ON p.pid = pc.id JOIN inventory inv ON p.pid = inv.id WHERE pid = $1;";

  let getProduct = await client.query(query, [pid]);
  if (getProduct.rowCount === 0) {
    await client.query("ROLLBACK");
    return res.status(400).json({ err: "Product Not Found" });
  }

  res.status(200).json({ product: getProduct.rows });
  await client.query("COMMIT");

  //@Implement logging For Caching !!important
});

module.exports = router;
