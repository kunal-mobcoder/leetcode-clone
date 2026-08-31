import "dotenv/config";
import { z } from "zod";


const envSchema = z.object({
    PORT: z.coerce.number().default(3000),

    MONGODB_URI: z.string(),

    REDIS_URL: z.string().url("Invalid Redis URL format"),

    ACCESS_TOKEN_PRIVATE_KEY: z.string().min(1),

    REFRESH_TOKEN_PRIVATE_KEY: z.string().min(1),
})


const env = envSchema.parse(process.env);

export default env;