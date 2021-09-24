import express, { Request, Response } from "express";
import fs from "fs";
import { uploadimg } from "../../controller/upload";
const router = express.Router();
const { promisify } = require("util");
const { Product } = require("../../middlewares/validation");
const client = require("../../config/database");
const unlinkAsync = promisify(fs.unlink);

//Update Product
router.put("/product/:id", Product, async (req: Request, res: Response) => {
  const file: any = req.files?.image;
  if (!file || Object.keys(file).length === 0) {
    return res.status(400).json({ err: "No Files Were Uploaded" });
  }
  if (file.mimetype !== "image/jpeg") {
    return res.json({ err: "Only jpg/jpeg/png Supported" });
  }
  const md5 = req.files?.md5;
  try {
    const { id } = req.params;
    const { title, summary, price, stock, category } = req.body;
    const upload = await uploadimg(file);
    let image = upload;

    await client.query("BEGIN");
    const img = await client.query(
      "SELECT image FROM products WHERE pid = $1",
      [id]
    );
    const currentimg = img.rows?.[0].image;
    //console.log(currentimg);
    const path = "/mnt/e/codee/e-commerce/images/" + currentimg;
    if (currentimg !== image) {
      fs.unlinkSync(path);
    }
    const productQ =
      "UPDATE products SET title = $1,image = $2,summary = $3,price = $4 WHERE pid = $5";
    const insertproduct = await client.query(productQ, [
      title,
      image,
      summary,
      price,
      id,
    ]);

    const categoryQ = "UPDATE product_category SET name = $1 WHERE id = $2";
    const insertCategory = await client.query(categoryQ, [category, id]);
    const inventoryQ = "UPDATE inventory SET quantity = $1 WHERE id = $2";
    const insertStock = await client.query(inventoryQ, [stock, id]);

    await client.query("COMMIT");
    return res.status(201).json({ success: "Product Uploaded" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    res.json({ message: err });
  }
});

//Updates Stock Of The Product
router.put("/stock/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (typeof stock === "number") {
      return res.json({ err: "Stock Only Numbers" });
    }
    await client.query("BEGIN");

    let query = "UPDATE inventory SET quantity = $1 WHERE id = $2";
    await client.query(query, [stock, id]);
    await client.query("COMMIT");
    return res.json({ success: "Stock Updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    res.json({ err: err });
  }
});

module.exports = router;
