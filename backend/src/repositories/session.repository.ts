import SessionModel from "../models/session.model.js";

interface CreateSessionData {
    userId: string;
    refreshTokenHash: string;
    ip: string;
    userAgent: string;
    expiresAt: Date;
}

class SessionRepository {

    async create(data: CreateSessionData) {
        return SessionModel.create(data);
    }

    async findValidSession(
        refreshTokenHash: string
    ) {
        return SessionModel.findOne({
            refreshTokenHash,
            revoked: false,
        });
    }

    async revokeSession(
        refreshTokenHash: string
    ) {
        return SessionModel.findOneAndUpdate(
            {
                refreshTokenHash,
                revoked: false,
            },
            {
                $set: {
                    revoked: true,
                    revokedAt: new Date(),
                },
            },
            {
                new: true,
            }
        );
    }

    async revokeSessionById(
        sessionId: string
    ) {
        return SessionModel.findByIdAndUpdate(
            sessionId,
            {
                $set: {
                    revoked: true,
                    revokedAt: new Date(),
                },
            },
            {
                new: true,
            }
        );
    }
}

export default new SessionRepository();