import express, { NextFunction, Request, response, Response } from "express";
import fs from "fs";
import { Postid } from "../../controller/generateId";
import { uploadimg } from "../../controller/upload";
const router = express.Router();
const client = require("../../config/database");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const { Product } = require("../../middlewares/validation");

router.post("/product", Product, async (req: Request, res: Response) => {
  const file: any = req.files?.image;
  if (!file || Object.keys(file).length === 0) {
    return res.status(400).json({ err: "No Files Were Uploaded" });
  }

  let mime = file.mimetype;
  if (mime !== "image/jpeg") {
    return res.json({ err: "Only jpg/jpeg/png Supported" });
  }
  try {
    const { title, summary, price, stock, category } = req.body;
    const upload = await uploadimg(file);
    let image = upload;

    const pid = await Postid();
    const created_at = new Date();
    await client.query("BEGIN");
    const query =
      "INSERT INTO products(pid,title,image,created_at,summary,price)VALUES($1,$2,$3,$4,$5,$6)";
    const insertproduct = await client.query(query, [
      pid,
      title,
      image,
      created_at,
      summary,
      price,
    ]);

    const insertCategory = await client.query(
      "INSERT INTO product_category(id,name)VALUES($1,$2)",
      [pid, category]
    );
    const insertStock = await client.query(
      "INSERT INTO inventory(id,quantity)VALUES($1,$2)",
      [pid, stock]
    );
    await client.query("COMMIT");
    return res.status(201).json({ success: "Product Uploaded" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.json({ message: err });
  }
});

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
    const path = "/mnt/e/codee/e-commerce/images/" + image;
    fs.unlinkSync(path);
    res.json({ success: "Product Deleted" });
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});

module.exports = router;
