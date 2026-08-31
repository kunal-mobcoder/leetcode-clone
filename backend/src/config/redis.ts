import { createClient } from "redis";


const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not defined");
}

const redisClient = createClient({
    url: redisUrl,
});

redisClient.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

redisClient.on("ready", () => {
    console.log("Redis connected successfully");
});

redisClient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});


export async function connectToRedis(): Promise<void> {
    if (redisClient.isOpen) {
        return;
    }

    await redisClient.connect();
}


export default redisClient;