import express, { NextFunction, Request, response, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
const router = express.Router();
const client = require("../../config/database");
const { sendLoginalert } = require("../../controller/nodemailer");

router.post("/logout", async (req: Request, res: Response) => {
  if (!req.session.newsession)
    return res.json({ err: "You Are Not Logged In" });

  req.session.destroy((err) => {
    res.clearCookie("SESSION");
    res.json({ sucess: "You have successfully Logged Out" });
  });
});

module.exports = router;
