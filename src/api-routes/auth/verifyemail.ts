import express, { Request, Response } from "express";
const router = express.Router();
import { pool as client } from "../../config/database";

router.get("/verify", async (req: Request, res: Response) => {
  const token = req.query.vif;
  if (token) {
    const check = await client.query(
      "SELECT expiry,userid FROM users WHERE token = $1",
      [token]
    );
    const now = Date.now();
    if (check.rowCount === 0)
      return res
        .status(400)
        .json({ err: "Invalid Token Or Have Been Expired" });

    const expiredate = check.rows[0].expiry;
    const userId = check.rows[0].userid;
    if (now > expiredate) {
      const deltoken = await client.query(
        "UPDATE users SET token = null,expiry = null WHERE userid = $1",
        [userId]
      );
      return res
        .status(400)
        .json({ err: "Invalid Token Or Have Been Expired" });
    }
    const isActive = true;
    const update = await client.query(
      "UPDATE users SET active = $1,token = null,expiry = null WHERE userid = $2",
      [isActive, userId]
    );
    return res.status(200).json({ success: "You Have Been Verified" });
  }
});

export { router as verifyEmail };
