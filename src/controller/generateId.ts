import { customAlphabet } from "nanoid";

//generate UserID
export function Userid() {
  const nanoid = customAlphabet("1234567890abcdefwxyz", 11);
  const id = nanoid();
  return id;
}
//generate BillingID
export function billingid() {
  const nanoid = customAlphabet("1234567890abcdefwxyz", 11);
  const id = nanoid();
  return id;
}
//generate postID
export function Postid() {
  const nanoid = customAlphabet("1234567890abcdefhijkxyz", 11);
  const id = nanoid();
  return id;
}

export function Coupon() {
  const nanoid = customAlphabet("1234567890abcdefhijk", 13);
  const id = nanoid();
  return id;
}
export function Cart() {
  const nanoid = customAlphabet(
    "1234567890abcdefhijklmnopABCDEFGHIJKLMNOP",
    13
  );
  const id = nanoid();
  return id;
}
