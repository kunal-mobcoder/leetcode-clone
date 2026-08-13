import type { UserRole } from "../models/user.model.js";

export interface AccessTokenPayload {
    userId: string;
    roles: UserRole[];
}

export interface AuthenticatedUser {
    userId: string;
    roles: UserRole[];
}