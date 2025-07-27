"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
const handleDuplicateError = (err) => {
    const duplicateVal = err.message.match(/"([^"]*)"/);
    return {
        statusCode: 400,
        message: `${duplicateVal ? duplicateVal[1] : 'Value'} already exists`,
    };
};
exports.handleDuplicateError = handleDuplicateError;
