"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeRegExp = exports.SupportedSources = exports.SourceIds = void 0;
const SourceIds = {
    youtube: 'yt',
    youtube_music: 'ytm',
    soundcloud: 'sc',
};
exports.SourceIds = SourceIds;
const SupportedSources = [
    'bandcamp',
    'beam',
    'getyarn',
    'http',
    'local',
    'nico',
    'soundcloud',
    'stream',
    'twitch',
    'vimeo',
    'youtube',
];
exports.SupportedSources = SupportedSources;
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
exports.escapeRegExp = escapeRegExp;
