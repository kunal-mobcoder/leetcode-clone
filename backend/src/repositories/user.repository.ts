import UserModel from "../models/user.model.js";

class UserRepository {
    async findByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    async findByUsername(username: string) {
        return UserModel.findOne({ username });
    }

    async findByEmailOrUsername(
        email: string,
        username: string
    ) {
        return UserModel.findOne({
            $or: [
                { email },
                { username },
            ],
        });
    }

    async findById(userId: string) {
        return UserModel.findById(userId);
    }

    async create(data: {
        username: string;
        email: string;
        password: string;
    }) {
        return UserModel.create(data);
    }
}

export default new UserRepository();