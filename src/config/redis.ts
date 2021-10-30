const Redis = require("ioredis");
export const redis = new Redis({
  port: 6379,
  host: "redis",
});
