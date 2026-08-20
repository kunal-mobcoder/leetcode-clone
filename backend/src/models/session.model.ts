// The TypeScript interface describes what your JavaScript/TypeScript object looks like, while the Mongoose schema describes how that object is stored and validated in MongoDB.

import mongoose, { Document, Schema } from "mongoose";


// Describes the data stored in a session
export interface Session {
    userId: mongoose.Types.ObjectId;
    refreshTokenHash: string;

    ip: string;
    userAgent: string;

    expiresAt: Date;

    revokedAt?: Date | null;
    revoked: boolean;
}


// Mongoose document = Session fields + Mongoose document methods
export interface SessionDocument extends Session, Document { }

const SessionSchema = new Schema<SessionDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        },

        refreshTokenHash: {
            type: String,
            required: [true, "Refresh token hash is required"],
            unique: true,
            index: true,
        },

        ip: {
            type: String,
            required: [true, "IP address is required"],
        },

        userAgent: {
            type: String,
            required: [true, "User agent is required"],
        },

        expiresAt: {
            type: Date,
            required: [true, "Expiration date is required"],
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        revoked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);


// Automatically remove expired sessions from MongoDB
SessionSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const SessionModel = mongoose.model<SessionDocument>("Session", SessionSchema);


export default SessionModel;