import { customAlphabet } from "nanoid";

//generate UserID
export function Userid() {
  const nanoid = customAlphabet("1234567890abcdef", 11);
  const id = nanoid();
  return id;
}
//generate postID
export function Postid() {
  const nanoid = customAlphabet("1234567890abcdef", 11);
  const id = nanoid();
  return id;
}
