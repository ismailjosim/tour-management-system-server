"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodValidationError = void 0;
const handleZodValidationError = (err) => {
    const errorSources = [];
    const errors = Object.values(err.errors);
    errors.forEach((item) => errorSources.push({
        path: `${item.path.slice().reverse().join(' inside ')} is required ❌`,
        message: item.message,
    }));
    return {
        statusCode: 400,
        message: 'Zod Error Occurred ❌',
        errorSources,
    };
};
exports.handleZodValidationError = handleZodValidationError;
