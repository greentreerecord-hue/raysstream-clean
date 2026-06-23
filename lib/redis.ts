import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.REDIS_PUBLIC_URL!,
  token: process.env.REDIS_PASSWORD!,
}); 
