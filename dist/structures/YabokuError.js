"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class YabokuError extends Error {
    code;
    message;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
exports.default = YabokuError;
