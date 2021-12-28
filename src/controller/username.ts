import {redis} from "../config/redis"

export async function checkusername(username: string) {
  const key = "usernames";
  const checkUsername = await redis.call("BF.EXISTS", key, username);
  return checkUsername;
}
