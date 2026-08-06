import mongoose from "mongoose";


export interface User {
    username: string;
    email: string;
    password: string;
}


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, "Username must be unique"]
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, "Email must be unique"]
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
})


const UserModel = mongoose.model<User>("User", UserSchema)

export default UserModel