import express, { Response, Request } from "express";

const router = express.Router();
import { promisify } from "util";
import { pool as client } from "../../config/database";
import { redis } from "../../config/redis";
const { transactionLogger } = require("../../config/winston");

const GET_ASYNC = promisify(redis.get).bind(redis);
const SET_ASYNC = promisify(redis.set).bind(redis);

router.get("/products", async (req: Request, res: Response) => {
  let limit = Number(req.query.limit);
  if (!limit) limit = 11;
  const reply = await GET_ASYNC("products");
  if (reply) {
    console.log("using cached data");
    res.status(200).json(JSON.parse(reply));
    return;
  }
  try {
    await client.query("BEGIN");

    const query = "SELECT * FROM products LIMIT $1";
    const getproducts = await client.query(query, [limit]);
    await client.query("COMMIT");
    const saveResult = await SET_ASYNC(
      "products",
      JSON.stringify(getproducts.rows),
      "EX",
      600000
    );
    return res.json({ products: getproducts.rows });
  } catch (err) {
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    await client.query("ROLLBACK");
    console.log(err);
    res.status(400).json({ err: err });
  }
});

router.get("/products/:pid", async (req: Request, res: Response) => {
  const { pid } = req.params;
  const reply = await GET_ASYNC(pid);
  if (reply) {
    console.log("using cached data");
    return res.status(200).json(JSON.parse(reply));
  }
  //@Implement Cashing Here

  await client.query("BEGIN");
  const query =
    "SELECT p.pid,p.title,p.image,p.created_At,p.summary,p.price,pc.name AS category,inv.quantity AS stock FROM products AS p JOIN product_category pc ON p.pid = pc.id JOIN inventory inv ON p.pid = inv.id WHERE pid = $1;";

  const getProduct = await client.query(query, [pid]);
  if (getProduct.rowCount === 0) {
    await client.query("ROLLBACK");
    return res.status(400).json({ err: "Product Not Found" });
  }

  await client.query("COMMIT");
  res.status(200).json({ product: getProduct.rows });
  const saveResult = await SET_ASYNC(
    pid,
    JSON.stringify(getProduct.rows),
    "EX",
    600000
  );

  //@Implement logging For Caching !!important
});

export { router as getproducts }