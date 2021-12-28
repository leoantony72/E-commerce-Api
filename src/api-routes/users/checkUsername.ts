import express, { Request, Response } from "express";
const router = express.Router();
import { checkusername } from "../../controller/username";

router.post("/checkusername", async (req: Request, res: Response) => {
  const { username } = req.body;

  const check = await checkusername(username);
  console.log(check);
  if (check) return res.status(400).json({ err: "Username Taken" });
  return res.json({ success: "Username Not Taken" });
});

export { router as checkusername };