import mongoose, { Document } from "mongoose";


export interface ISession {
    userId: mongoose.Schema.Types.ObjectId;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt?: Date;
}


export interface ISessionDocument extends ISession, Document { }


const SessionSchema = new mongoose.Schema<ISessionDocument>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
        unique: true,
    },
    revokedAt: {
        type: Date,
    },
},
    {
        timestamps: true
    }
)


const SessionModel = mongoose.model<ISessionDocument>("Session", SessionSchema)


export default SessionModel