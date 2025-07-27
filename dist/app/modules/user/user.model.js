"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const authProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true }, // "google", "credentials"
    providerId: { type: String, required: true },
}, { _id: false, versionKey: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.USER,
    },
    isDeleted: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: 'ACTIVE',
    },
    isVerified: { type: Boolean, default: false },
    auths: { type: [authProviderSchema], default: [] },
}, {
    timestamps: true,
    versionKey: false,
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
