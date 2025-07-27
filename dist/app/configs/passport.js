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
/* eslint-disable @typescript-eslint/no-explicit-any */
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const passport_local_1 = require("passport-local");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isUserExist = yield user_model_1.UserModel.findOne({ email });
        if (!isUserExist) {
            // return done(null, false, { message: 'User does not exist' })
            return done('User does not exist');
        }
        // * check user status, validity
        if (isUserExist.isDeleted) {
            return done('user is deleted');
        }
        if (!isUserExist.isVerified) {
            return done('Your are not verified');
        }
        if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED ||
            isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
            return done(`User is ${isUserExist.isActive}`);
        }
        // check user is google authenticated
        const isUserGoogleAuthenticated = isUserExist.auths.some((providerObj) => providerObj.provider === 'google');
        if (isUserGoogleAuthenticated && !isUserExist.password) {
            return done('You previously signed in with your Google account. To use email and password to log in, please set a password for your account.');
        }
        // 🔐 Verify password
        const isPasswordMatched = yield bcryptjs_1.default.compare(password, isUserExist.password);
        if (!isPasswordMatched) {
            return done("Password doesn't match!");
        }
        return done(null, isUserExist);
    }
    catch (error) {
        done(error);
    }
})));
// login with google oAuth
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.environmentVariables.GOOGLE_CLIENT_ID,
    clientSecret: env_1.environmentVariables.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.environmentVariables.GOOGLE_CALLBACK_URL,
}, 
// * this function will be used to store info into DB also our custom properties
(accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email) {
            return done(null, false, { message: 'No email Found' });
        }
        // check email is already exist into DB
        let user = yield user_model_1.UserModel.findOne({ email });
        // * check user status, validity
        if (user && (user === null || user === void 0 ? void 0 : user.isDeleted)) {
            return done('user is deleted');
        }
        if (user && !(user === null || user === void 0 ? void 0 : user.isVerified)) {
            return done('Your are not verified');
        }
        if (user &&
            ((user === null || user === void 0 ? void 0 : user.isActive) === user_interface_1.IsActive.BLOCKED ||
                (user === null || user === void 0 ? void 0 : user.isActive) === user_interface_1.IsActive.INACTIVE)) {
            return done(`User is ${user === null || user === void 0 ? void 0 : user.isActive}`);
        }
        if (!user) {
            // crate new user
            user = yield user_model_1.UserModel.create({
                email,
                name: profile.displayName,
                picture: (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value,
                role: user_interface_1.Role.USER,
                isVerified: true,
                auths: [
                    {
                        provider: 'google',
                        providerId: profile.id,
                    },
                ],
            });
        }
        return done(null, user, { message: '' });
    }
    catch (error) {
        // console.log('Google Strategy Error', error)
        return done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.UserModel.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error);
    }
}));
