import mongoose from "mongoose";


async function connectToDB(): Promise<void> {

    try {
        await mongoose.connect(process.env.MONGODB_URI as string)

        console.log("Connected to the database...")

    } catch (error) {
        console.log("Database connection failed", error)
        process.exit(1)
    }
}

export default connectToDB