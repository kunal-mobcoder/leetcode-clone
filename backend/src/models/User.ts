import mongoose, { Document } from "mongoose";


export interface IUser {
    username: string;
    email: string;
    password: string;
    roles: ("user" | "admin")[];
}


export interface IUserDocument extends IUser, Document { }


const UserSchema = new mongoose.Schema<IUserDocument>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
        },

        roles: {
            type: [String],
            enum: ["user", "admin"],
            default: ["user"],
        },
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model<IUserDocument>("User", UserSchema);

export default UserModel;