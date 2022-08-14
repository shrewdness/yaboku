export default class YabokuError extends Error {
    code: number;
    message: string;
    constructor(code: number, message: string);
}
