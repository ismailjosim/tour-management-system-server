"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const env_1 = require("../configs/env");
const setAuthCookie = (res, token) => {
    if (token.accessToken) {
        res.cookie('accessToken', token.accessToken, {
            httpOnly: true,
            secure: env_1.environmentVariables.NODE_ENV === 'production' ? true : false,
            sameSite: 'none',
        });
    }
    if (token.refreshToken) {
        res.cookie('refreshToken', token.refreshToken, {
            httpOnly: true,
            secure: env_1.environmentVariables.NODE_ENV === 'production' ? true : false,
            sameSite: 'none',
        });
    }
};
exports.setAuthCookie = setAuthCookie;
