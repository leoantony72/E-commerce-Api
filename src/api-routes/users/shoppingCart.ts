import express, { Request, Response, NextFunction } from "express";
import { Cart } from "../../controller/generateId";
export const router = express.Router();
import { pool as client } from "../../config/database";

//Get Product From Shopping Cart
router.get("/cart", async (req: Request, res: Response, next: NextFunction) => {
  const userid = req.session.userid;
  if (!userid)
    return next({
      status: 400,
      message: "Unexpected Error",
    });

  const query =
    "SELECT ca.pid,pr.title,pr.image,pr.summary,ca.quantity,pr.price,ca.date_created FROM cart AS ca JOIN products pr ON ca.pid = pr.pid WHERE userid = $1;";

  const getCartItems = await client.query(query, [userid]);

  if (getCartItems.rowCount === 0)
    return res.status(200).json({ success: "No Items Added" });
  return res.status(200).json({ products: getCartItems.rows });
});

//Add Product To Cart
router.post(
  "/addItem/:pid",
  async (req: Request, res: Response, next: NextFunction) => {
    const userid = req.session.userid;
    if (!userid)
      return next({
        status: 400,
        message: "Unexpected Error",
      });
    const { pid } = req.params;
    var query = "SELECT quantity FROM cart WHERE userid = $1 AND pid = $2";
    const checkProduct = await client.query(query, [userid, pid]);
    if (checkProduct.rowCount != 0) {
      const quantity = checkProduct.rows?.[0].quantity;
      const updatequantity = quantity + 1;
      var query =
        "UPDATE cart SET quantity = $1 WHERE userid = $2 AND pid = $3";
      const incrItem = await client.query(query, [updatequantity, userid, pid]);
      return res.status(200).json({ success: "Item Added To Cart" });
    }
    //checks if the product exists
    const checkpr = await client.query(
      "SELECT price FROM products WHERE pid = $1",
      [pid]
    );
    if (checkpr.rowCount === 0)
      return res.status(200).json({ err: "Item Not Found" });
    const date = new Date();
    const cart_id = await Cart();
    var query =
      "INSERT INTO cart(cart_id,userid,pid,date_created)VALUES($1,$2,$3,$4)";
    const addItem = await client.query(query, [cart_id, userid, pid, date]);
    return res.status(200).json({ success: "Item Added To Cart" });
  }
);

//Remove items From cart
router.delete(
  "/removeItem/:pid",
  async (req: Request, res: Response, next: NextFunction) => {
    const userid = req.session.userid;
    if (!userid)
      return next({
        status: 400,
        message: "Unexpected Error",
      });
    const { pid } = req.params;
    var query = "SELECT * FROM cart WHERE userid = $1 AND pid = $2";
    const checkProduct = await client.query(query, [userid, pid]);
    if (checkProduct.rowCount === 0)
      return res.status(200).json({ err: "Item Not Found" });
    const quantity = checkProduct.rows?.[0].quantity;
    if (quantity > 1) {
      const updatequantity = quantity - 1;
      var query =
        "UPDATE cart SET quantity = $1 WHERE userid = $2 AND pid = $3";
      const decItem = await client.query(query, [updatequantity, userid, pid]);
      return res.status(200).json({ success: "Item Quantity Decreased" });
    }

    var query = "DELETE FROM cart WHERE userid = $1 AND pid = $2";
    const delItem = await client.query(query, [userid, pid]);
    return res.status(200).json({ success: "Item Deleted From Cart" });
  }
);

export { router as ShoppingCart }