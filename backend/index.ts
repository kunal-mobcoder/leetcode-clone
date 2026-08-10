import "dotenv/config";
import app from "./src/app"
import connectToDB from "./src/config/dbConnect"


const PORT = process.env.PORT

connectToDB()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})