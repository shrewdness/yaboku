"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../ts/constants");
const enums_1 = require("../ts/enums");
const _1 = require(".");
class YabokuTrack {
    /** The Yaboku instance. */
    yaboku;
    /** The track requester. */
    requester;
    /** The track's Base64. */
    track;
    /** The track's source. */
    sourceName;
    /** The track's title. */
    title;
    /** The track's URI. */
    uri;
    /** The track's identifier. */
    identifier;
    /** Whether the track is seekable. */
    isSeekable;
    /** Whether the track is a stream. */
    isStream;
    /** The track's author. */
    author;
    /** The track's length. */
    length;
    /** The track's position in queue. */
    position;
    /** The track's thumbnail, if available. */
    thumbnail;
    /** The original URI for this track. */
    realUri;
    resolvedBySource = false;
    constructor(raw, requester) {
        this.yaboku = undefined;
        this.track = raw.track;
        this.sourceName = raw.info.sourceName;
        this.title = raw.info.title;
        this.uri = raw.info.uri;
        this.identifier = raw.info.identifier;
        this.isSeekable = raw.info.isSeekable;
        this.isStream = raw.info.isStream;
        this.author = raw.info.author;
        this.length = raw.info.length;
        this.position = raw.info.position;
        this.thumbnail = raw.info.thumbnail;
        this.realUri = constants_1.SupportedSources.includes(this.sourceName) ? this.uri : null;
        this.requester = requester;
        if (this.sourceName === enums_1.SearchEngines.YouTube && this.identifier) {
            this.thumbnail = `https://img.youtube.com/vi/${this.identifier}/hqdefault.jpg`;
        }
    }
    /**
     * Get the raw data (json) of a track.
     * @returns {RawYabokuTrack}
     */
    getRaw() {
        return {
            track: this.track,
            info: {
                title: this.title,
                uri: this.uri,
                identifier: this.identifier,
                author: this.author,
                sourceName: this.sourceName,
                isSeekable: this.isSeekable,
                isStream: this.isStream,
                length: this.length,
                position: this.position,
                thumbnail: this.thumbnail,
            },
        };
    }
    /**
     * Set the Yaboku instance.
     * @param yaboku The Yaboku instance.
     * @returns {YabokuTrack}
     */
    setYaboku(yaboku) {
        this.yaboku = yaboku;
        if (this.sourceName === 'youtube' && this.identifier) {
            this.thumbnail = `https://img.youtube.com/vi/${this.identifier}/${yaboku.yabokuOptions.defaultYoutubeThumbnailResolution ?? 'hqdefault'}.jpg`;
        }
        return this;
    }
    /** Check whether the track is ready to play or needs to be resolved. */
    get readyToPlay() {
        return (this.yaboku !== undefined &&
            !!this.track &&
            !!this.sourceName &&
            !!this.identifier &&
            !!this.author &&
            !!this.length &&
            !!this.title &&
            !!this.uri &&
            !!this.realUri);
    }
    /**
     * Resolve a track.
     * @param options Resolve options.
     * @returns {Promise<YabokuTrack>}
     */
    async resolveTrack(options) {
        if (!this.yaboku)
            throw new _1.YabokuError(1, 'Yaboku instance is not set.');
        if (this.yaboku.yabokuOptions.trackResolver &&
            typeof this.yaboku.yabokuOptions.trackResolver === 'function' &&
            (await this.yaboku.yabokuOptions.trackResolver.bind(this)(options)))
            return this;
        const resolveSource = this.yaboku.yabokuOptions.sourceForceResolve?.includes(this.sourceName);
        const { forceResolve, overwrite } = options || {
            forceResolve: false,
            overwrite: false,
        };
        if (!forceResolve && this.readyToPlay)
            return this;
        if (resolveSource && this.resolvedBySource)
            return this;
        if (resolveSource)
            this.resolvedBySource = true;
        const result = await this.getTrack();
        if (!result)
            throw new _1.YabokuError(2, 'No results.');
        this.track = result.track;
        this.realUri = result.info.uri;
        this.length = result.info.length;
        if (overwrite || resolveSource) {
            this.title = result.info.title;
            this.identifier = result.info.identifier;
            this.isSeekable = result.info.isSeekable;
            this.author = result.info.author;
            this.length = result.info.length;
            this.isStream = result.info.isStream;
            this.uri = result.info.uri;
        }
        return this;
    }
    async getTrack() {
        if (!this.yaboku)
            throw new Error('Yaboku instance is not set.');
        const { defaultSearchEngine } = this.yaboku.yabokuOptions;
        const sources = constants_1.SourceIds;
        const source = sources[defaultSearchEngine || sources.youtube] || sources.youtube;
        const query = [this.author, this.title].filter((x) => !!x).join(' - ');
        const node = this.yaboku.getLeastUsedNode();
        if (!node)
            throw new _1.YabokuError(2, 'No nodes available.');
        const result = await node.rest.resolve(`${source}search:${query}`);
        if (!result || !result.tracks.length)
            throw new _1.YabokuError(2, 'No results.');
        if (this.author) {
            const author = [this.author, `${this.author} - Topic`];
            const officialTrack = result.tracks.find((track) => author.some((name) => new RegExp(`^${(0, constants_1.escapeRegExp)(name)}$`, 'i').test(track.info.author)) ||
                new RegExp(`^${(0, constants_1.escapeRegExp)(this.title)}$`, 'i').test(track.info.title));
            if (officialTrack)
                return officialTrack;
        }
        if (this.length) {
            const sameDuration = result.tracks.find((track) => track.info.length >= (this.length ? this.length : 0) - 2000 &&
                track.info.length <= (this.length ? this.length : 0) + 2000);
            if (sameDuration)
                return sameDuration;
        }
        return result.tracks[0];
    }
}
exports.default = YabokuTrack;
