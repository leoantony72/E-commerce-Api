import express, { Request, Response } from "express";
const router = express.Router();
const { transactionLogger } = require("../../config/winston");
router.post("/logout", async (req: Request, res: Response) => {
  if (!req.session.newsession)
    return res.json({ err: "You Are Not Logged In" });

  req.session.destroy((err) => {
    res.clearCookie("SESSION");
    res.json({ sucess: "You have successfully Logged Out" });
    if (err) {
      res.json({ sucess: "Something Went Wrong" });
      console.log(err);
      transactionLogger.error(
        `userid:${req.session.userid},ip:${req.ip},Err:${err}`
      );
    }
  });
});
export { router as logout };
