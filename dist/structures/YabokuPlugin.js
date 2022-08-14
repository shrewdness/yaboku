"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const _1 = require(".");
class YabokuPlugin {
    load(yaboku) {
        throw new _1.YabokuError(1, 'Plugin is missing implements for load().');
    }
    unload(yaboku) {
        throw new _1.YabokuError(1, 'Plugin is missing implements for unload().');
    }
}
exports.default = YabokuPlugin;
