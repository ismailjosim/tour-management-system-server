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
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const user_interface_1 = require("../user/user.interface");
const passport_1 = __importDefault(require("passport"));
const env_1 = require("../../configs/env");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.AuthControllers.credentialsLogin);
router.post('/refresh-token', auth_controller_1.AuthControllers.getNewAccessToken);
router.post('/logout', auth_controller_1.AuthControllers.logout);
router.post('/change-password', (0, checkAuth_1.default)(...Object.values(user_interface_1.Role)), auth_controller_1.AuthControllers.changePassword);
router.post('/set-password', (0, checkAuth_1.default)(...Object.values(user_interface_1.Role)), auth_controller_1.AuthControllers.setPassword);
router.post('/forgot-password', auth_controller_1.AuthControllers.forgotPassword);
router.post('/reset-password', (0, checkAuth_1.default)(...Object.values(user_interface_1.Role)), auth_controller_1.AuthControllers.resetPassword);
router.get('/google', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const redirect = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.redirect) || '/';
    passport_1.default.authenticate('google', {
        scope: ['profile', 'email'],
        state: redirect,
    })(res, res, next);
}));
// api/v1/auth/google/callback?state=/booking or /
const message = 'there is something wrong. Please Contact With our Team';
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: `${env_1.environmentVariables.FRONTEND_URL}/login?error=${message}`,
}), auth_controller_1.AuthControllers.googleCallbackController);
exports.AuthRoutes = router;
