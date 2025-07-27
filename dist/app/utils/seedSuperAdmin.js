"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../configs/env");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const passwordHashing_1 = __importDefault(require("./passwordHashing"));
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isSuperAdminExist = yield user_model_1.UserModel.findOne({
            email: env_1.environmentVariables.SUPER_ADMIN_EMAIL,
        });
        if (isSuperAdminExist) {
            if (env_1.environmentVariables.NODE_ENV === 'development') {
                console.log('Super Admin already exist');
            }
            return;
        }
        const hashedPassword = yield (0, passwordHashing_1.default)(env_1.environmentVariables.SUPER_ADMIN_PASS);
        const authProvider = {
            provider: 'credentials',
            providerId: env_1.environmentVariables.SUPER_ADMIN_EMAIL,
        };
        const payload = {
            name: 'Super Admin',
            role: user_interface_1.Role.SUPER_ADMIN,
            email: env_1.environmentVariables.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            auths: [authProvider],
            isVerified: true,
        };
        const superAdmin = yield user_model_1.UserModel.create(payload);
        if (env_1.environmentVariables.NODE_ENV === 'development') {
            console.log('Super Admin Created Successfully', superAdmin.name);
        }
    }
    catch (error) {
        if (env_1.environmentVariables.NODE_ENV === 'development') {
            console.log(error);
        }
    }
});
exports.default = seedSuperAdmin;
