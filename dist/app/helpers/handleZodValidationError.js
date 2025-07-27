"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMongooseValidationError = void 0;
const handleMongooseValidationError = (err) => {
    const errorSources = [];
    const errors = Object.values(err.errors);
    errors.forEach((item) => errorSources.push({
        path: item.path,
        message: item.message,
    }));
    return {
        statusCode: 400,
        message: 'Validation Error Occurred ❌',
        errorSources,
    };
};
exports.handleMongooseValidationError = handleMongooseValidationError;
