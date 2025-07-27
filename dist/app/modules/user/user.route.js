"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const user_interface_1 = require("./user.interface");
const router = (0, express_1.Router)();
router.post('/register', (0, validateRequest_1.default)(user_validation_1.UserSchemaValidation.createUserSchemaValidation), user_controller_1.UserControllers.crateUser);
router.get('/', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.UserControllers.getAllUsers);
router.get('/me', (0, checkAuth_1.default)(...Object.values(user_interface_1.Role)), user_controller_1.UserControllers.getMe);
router.get('/:id', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.UserControllers.getSingleUser);
router.patch('/:id', (0, checkAuth_1.default)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.default)(user_validation_1.UserSchemaValidation.updateUserSchemaValidation), user_controller_1.UserControllers.updateUser);
exports.UserRoutes = router;
