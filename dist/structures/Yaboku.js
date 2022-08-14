"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const shoukaku_1 = require("shoukaku");
const constants_1 = require("../ts/constants");
const enums_1 = require("../ts/enums");
const _1 = require(".");
class Yaboku extends events_1.default {
    yabokuOptions;
    /** The Shoukaku instance. */
    shoukaku;
    /** A map of all available players. */
    players = new Map();
    /**
     * Initialize the Yaboku instance.
     * @param yabokuOptions The Yaboku options.
     * @param connector The Shoukaku connector to use.
     * @param nodes An array of lavalink nodes to use.
     * @param shoukakuOptions The Shoukaku options.
     */
    constructor(yabokuOptions, connector, nodes, shoukakuOptions = {}) {
        super();
        this.yabokuOptions = yabokuOptions;
        this.shoukaku = new shoukaku_1.Shoukaku(connector, nodes, shoukakuOptions);
        if (this.yabokuOptions.plugins) {
            for (let index = 0; index < this.yabokuOptions.plugins.length; index += 1) {
                if (!(this.yabokuOptions.plugins[index] instanceof _1.YabokuPlugin)) {
                    throw new _1.YabokuError(1, 'Plugin must be an instance of YabokuPlugin');
                }
                this.yabokuOptions.plugins[index].load(this);
            }
        }
        this.players = new Map();
    }
    /**
     * Create a new player.
     * @param options The player options.
     * @returns Promise<YabokuPlayer>
     */
    async createPlayer(options) {
        const exists = this.players.has(options.guildId);
        if (exists)
            throw new _1.YabokuError(2, 'Player already exists.');
        const finalOptions = options;
        let node;
        if (options.loadBalance) {
            node = this.getLeastUsedNode();
        }
        else if (options.nodeName) {
            node = this.shoukaku.getNode(options.nodeName);
        }
        else {
            node = this.shoukaku.getNode('auto');
        }
        if (!options.selfDeafen)
            finalOptions.selfDeafen = false;
        if (!options.selfMute)
            finalOptions.selfMute = false;
        if (!node)
            throw new _1.YabokuError(3, 'No node found.');
        const shoukakuPlayer = await node.joinChannel({
            guildId: finalOptions.guildId,
            channelId: finalOptions.voiceChannelId,
            deaf: finalOptions.selfDeafen,
            mute: finalOptions.selfMute,
            shardId: finalOptions.shardId && !Number.isNaN(finalOptions.shardId)
                ? finalOptions.shardId
                : 0,
        });
        const yabokuPlayer = new (this.yabokuOptions.extends?.player ??
            _1.YabokuPlayer)(this, shoukakuPlayer, {
            guildId: finalOptions.guildId,
            voiceChannelId: finalOptions.voiceChannelId,
            textChannelId: finalOptions.textChannelId,
            selfDeafen: finalOptions.selfDeafen || false,
        }, finalOptions.data);
        this.players.set(finalOptions.guildId, yabokuPlayer);
        this.emit(enums_1.YabokuEvents.PlayerCreate, yabokuPlayer);
        return yabokuPlayer;
    }
    /**
     * Get a player by a guildId.
     * @param guildId The id of the guild to get the player of.
     * @returns YabokuPlayer | null
     */
    getPlayer(guildId) {
        return this.players.get(guildId) || null;
    }
    destroyPlayer(guildId) {
        const player = this.getPlayer(guildId);
        if (!player)
            return;
        player.destroy();
        this.players.delete(guildId);
    }
    /**
     * Get the least used node.
     * @returns Node
     */
    getLeastUsedNode() {
        const nodes = [...this.shoukaku.nodes.values()];
        const onlineNodes = nodes.filter((node) => node.state === enums_1.State.CONNECTED);
        if (!onlineNodes.length) {
            throw new _1.YabokuError(2, "There aren't any nodes online.");
        }
        const leastUsedNode = onlineNodes.reduce((a, b) => a.players.size < b.players.size ? a : b);
        return leastUsedNode;
    }
    async search(query, options) {
        const node = this.getLeastUsedNode();
        if (!node)
            throw new _1.YabokuError(3, 'No node found.');
        const sources = constants_1.SourceIds;
        const sourceSetting = (options?.engine &&
            ['youtube', 'youtube_music', 'soundcloud'].includes(options.engine)
            ? options.engine
            : null) ||
            (!!this.yabokuOptions.defaultSearchEngine &&
                ['youtube', 'youtube_music', 'soundcloud'].includes(this.yabokuOptions.defaultSearchEngine)
                ? this.yabokuOptions.defaultSearchEngine
                : null) ||
            'youtube';
        const source = sources[sourceSetting];
        const isUrl = /^https?:\/\/.*/.test(query);
        const result = await node.rest
            .resolve(!isUrl ? `${source}search:${query}` : query)
            .catch(() => null);
        if (!result)
            return this.buildSearch(undefined, [], enums_1.SearchResult.Search);
        let loadType = isUrl ? enums_1.SearchResult.Track : enums_1.SearchResult.Search;
        if (result.playlistInfo.name)
            loadType = enums_1.SearchResult.Playlist;
        return this.buildSearch(result.playlistInfo.name ?? undefined, result.tracks.map((track) => new _1.YabokuTrack(track, options?.requester)), loadType);
    }
    buildSearch(playlistName, tracks = [], type) {
        return {
            playlistName,
            tracks,
            type: type ?? enums_1.SearchResult.Search,
        };
    }
}
exports.default = Yaboku;
