import "dotenv/config";

import app from "./src/app.js";
import connectToDB from "./src/config/dbConnect.js";
import { connectToRedis } from "./src/config/redis.js";


const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectToDB();
    await connectToRedis();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}


startServer();