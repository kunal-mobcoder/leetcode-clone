import mongoose from "mongoose";


async function connectToDB(): Promise<void> {

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("MONGODB_URI is not defined");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to the database...");

    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}


export default connectToDB;