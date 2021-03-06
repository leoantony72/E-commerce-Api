import express, { Request, Response } from "express";
import fs from "fs";
 const router = express.Router();
import { pool as client} from "../../config/database";
const { transactionLogger } = require("../../config/winston");

//Delete Product
router.delete("/product/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ err: "Product Id Not Found" });
    const img = await client.query(
      "SELECT image FROM products WHERE pid = $1",
      [id]
    );

    const image = img.rows?.[0].image;

    const checkpost = await client.query(
      "DELETE FROM products WHERE pid = $1",
      [id]
    );
    const path = "images/" + image;
    fs.unlinkSync(path);
    res.json({ success: "Product Deleted" });
  } catch (err) {
    console.log(err);
    transactionLogger.error(
      `userid:${req.session.userid},ip:${req.ip},Err:${err}`
    );
    res.json({ err: err });
  }
});

export { router as deleteproduct };