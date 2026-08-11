import mongoose, { Schema } from "mongoose";

export interface Session {
    userId: mongoose.Types.ObjectId;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt?: Date;
}

const SessionSchema = new Schema<Session>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        refreshTokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const SessionModel = mongoose.model<Session>("Session", SessionSchema);


export default SessionModel;