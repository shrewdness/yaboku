"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../ts/enums");
const _1 = require(".");
class YabokuPlayer {
    customData;
    /** YabokuPlayer options. */
    options;
    /** The Yaboku instance. */
    yaboku;
    /** The Shoukaku player instance. */
    shoukaku;
    /** The id of the guild the player is in. */
    guildId;
    /** The id of the voice channel the player is in. */
    voiceChannelId;
    /** The id of the text channel the player is bound to. */
    textChannelId;
    /** The player's queue. */
    queue;
    /** The player's current state. */
    state = enums_1.PlayerState.Connecting;
    /** The player's current pause state.
     * (Whether the player is paused or not.)
     */
    paused = false;
    /** The player's curreny playing state
     * (Whether the player is playing or not.)
     */
    playing = false;
    /** The player's current loop mode. */
    loop = enums_1.LoopMode.None;
    /** Search for tracks. */
    search;
    /** The player's custom data. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = new Map();
    constructor(yaboku, player, options, customData) {
        this.customData = customData;
        this.options = options;
        this.yaboku = yaboku;
        this.shoukaku = player;
        this.guildId = options.guildId;
        this.voiceChannelId = options.voiceChannelId;
        this.textChannelId = options.textChannelId;
        this.queue = new _1.YabokuQueue();
        this.search = this.yaboku.search.bind(this.yaboku);
        this.shoukaku.on('start', () => {
            this.playing = true;
            this.emit(enums_1.YabokuEvents.TrackStart, this, this.queue.current);
        });
        this.shoukaku.on('end', (data) => {
            if (this.state === enums_1.PlayerState.Destroying ||
                this.state === enums_1.PlayerState.Destroyed)
                return;
            if (data.reason === 'REPLACED')
                this.emit(enums_1.YabokuEvents.TrackEnd, this, null);
            if (['LOAD_FAILED', 'CLEAN_UP'].includes(data.reason)) {
                this.queue.previous = this.queue.current;
                this.playing = false;
                if (!this.queue.length)
                    this.emit(enums_1.YabokuEvents.PlayerEmpty, this);
                this.emit(enums_1.YabokuEvents.TrackEnd, this);
                this.queue.current = null;
                this.play().catch(() => null);
            }
            if (this.loop === enums_1.LoopMode.Track && this.queue.current)
                this.queue.unshift(this.queue.current);
            if (this.loop === enums_1.LoopMode.Queue && this.queue.length)
                this.queue.push(this.queue.current);
            this.queue.previous = this.queue.current;
            const currentTrack = this.queue.current;
            this.queue.current = null;
            if (this.queue.length) {
                this.emit(enums_1.YabokuEvents.TrackEnd, this, currentTrack);
            }
            else {
                this.playing = false;
                this.emit(enums_1.YabokuEvents.PlayerEmpty, this);
            }
            this.play().catch(() => null);
        });
        this.shoukaku.on('closed', (data) => {
            this.playing = false;
            this.emit(enums_1.YabokuEvents.PlayerClose, this, data);
        });
        this.shoukaku.on('exception', (data) => {
            this.playing = false;
            this.emit(enums_1.YabokuEvents.TrackException, this, data);
        });
        this.shoukaku.on('update', (data) => {
            this.emit(enums_1.YabokuEvents.PlayerUpdate, this, data);
        });
        this.shoukaku.on('stuck', (data) => {
            this.emit(enums_1.YabokuEvents.TrackStuck, this, data);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit(event, ...args) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.yaboku.emit(event, ...args);
    }
    get node() {
        return this.shoukaku.node;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send(...args) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.node.queue.add(...args);
    }
    /**
     * Pause the player.
     * @param pause Whether to pause or unpause the player.
     * @returns A YabokuPlayer instance.
     */
    pause(pause) {
        if (typeof pause !== 'boolean')
            throw new _1.YabokuError(1, 'Invalid argument passed to pause().');
        if (this.paused === pause || !this.queue.totalSize)
            return this;
        this.paused = pause;
        this.playing = !pause;
        this.shoukaku.setPaused(pause);
        return this;
    }
    /**
     * Set the text channel for the player.
     * @param textChannelId The id of the text channel to bind to.
     * @returns A YabokuPlayer instance.
     */
    setTextChannel(textChannelId) {
        if (this.state === enums_1.PlayerState.Destroyed)
            throw new _1.YabokuError(1, 'Player is destroyed.');
        this.textChannelId = textChannelId;
        return this;
    }
    /**
     * Set the voice channel for the player and move the player to it.
     * @param voiceChannelId The id of the voice channel to move to.
     * @returns A YabokuPlayer instance.
     */
    setVoiceChannel(voiceChannelId) {
        if (this.state === enums_1.PlayerState.Destroyed)
            throw new _1.YabokuError(1, 'Player is destroyed.');
        this.state = enums_1.PlayerState.Connecting;
        this.voiceChannelId = voiceChannelId;
        this.yaboku.yabokuOptions.send(this.guildId, {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannelId,
                self_mute: false,
                self_deaf: this.options.selfDeafen,
            },
        });
        return this;
    }
    /**
     * Set the loop mode.
     * @param mode The loop mode to set.
     * @returns A YabokuPlayer instance.
     */
    setLoop(mode) {
        if (mode === undefined) {
            if (this.loop === enums_1.LoopMode.None)
                this.loop = enums_1.LoopMode.Queue;
            else if (this.loop === enums_1.LoopMode.Queue)
                this.loop = enums_1.LoopMode.Track;
            else if (this.loop === enums_1.LoopMode.Track)
                this.loop = enums_1.LoopMode.None;
            return this;
        }
        this.loop = mode;
        return this;
    }
    /**
     * Play a track.
     * @param track The track to play.
     * @param options Play options.
     * @returns A YabokuPlayer instance.
     */
    async play(track, options) {
        if (this.state === enums_1.PlayerState.Destroyed)
            throw new _1.YabokuError(1, 'Player is destroyed.');
        if (track && !(track instanceof _1.YabokuTrack))
            throw new _1.YabokuError(1, 'Track must be an instance of YabokuTrack.');
        if (!track && !this.queue.totalSize)
            throw new _1.YabokuError(1, "The queue is empty, there's nothing to play.");
        if (!options || typeof options.replaceCurrent !== 'boolean')
            options = { ...options, replaceCurrent: false };
        if (track) {
            if (!options.replaceCurrent && this.queue.current)
                this.queue.unshift(this.queue.current);
            this.queue.current = track;
        }
        else if (!this.queue.current)
            this.queue.current = this.queue.shift();
        if (!this.queue.current)
            throw new _1.YabokuError(1, "There's nothing to play.");
        const { current } = this.queue;
        current.setYaboku(this.yaboku);
        let errorMessage;
        const resolveResult = await current.resolveTrack().catch((e) => {
            errorMessage = e.message;
            return null;
        });
        if (!resolveResult) {
            this.emit(enums_1.YabokuEvents.TrackResolveException, this, current, errorMessage);
            this.queue.current = null;
            if (this.queue.size) {
                this.play().catch(() => null);
            }
            else {
                this.emit(enums_1.YabokuEvents.PlayerEmpty, this);
            }
            return this;
        }
        const playOptions = { track: current.track, options: {} };
        if (options)
            playOptions.options = { ...options, noReplace: false };
        else
            playOptions.options = { noReplace: false };
        this.shoukaku.playTrack(playOptions);
        return this;
    }
    /**
     * Skip the currently playing track.
     * @returns A YabokuPlayer instance.
     */
    skip() {
        if (this.state === enums_1.PlayerState.Destroyed)
            throw new _1.YabokuError(1, 'Player is destroyed.');
        this.shoukaku.stopTrack();
        return this;
    }
    /**
     * Set the volume of the player.
     * @param volume The volume to set.
     * @returns A YabokuPlayer instance.
     */
    setVolume(volume) {
        if (this.state === enums_1.PlayerState.Destroyed)
            throw new _1.YabokuError(1, 'Player is destroyed.');
        if (Number.isNaN(volume))
            throw new _1.YabokuError(1, 'Volume parameter must be a number.');
        this.shoukaku.filters.volume = volume / 100;
        this.send({
            op: 'volume',
            guildId: this.guildId,
            volume: this.shoukaku.filters.volume * 100,
        });
        return this;
    }
    /**
     * Connect to the voice channel.
     * @returns A YabokuPlayer instance.
     */
    connect() {
        if (this.state === enums_1.PlayerState.Destroyed)
            throw new _1.YabokuError(1, 'Player is destroyed.');
        if (this.state === enums_1.PlayerState.Connected || !!this.voiceChannelId)
            throw new _1.YabokuError(1, 'Player is already connected.');
        this.state = enums_1.PlayerState.Connecting;
        this.yaboku.yabokuOptions.send(this.guildId, {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannelId,
                self_mute: false,
                self_deaf: this.options.selfDeafen,
            },
        });
        this.state = enums_1.PlayerState.Connected;
        return this;
    }
    /**
     * Disconnect from the voice channel.
     * @returns A YabokuPlayer instance.
     */
    disconnect() {
        if (this.state === enums_1.PlayerState.Disconnected || !this.voiceChannelId)
            throw new _1.YabokuError(1, 'Player is already disconnected.');
        this.state = enums_1.PlayerState.Disconnecting;
        this.pause(true);
        this.yaboku.yabokuOptions.send(this.guildId, {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
            },
        });
        this.voiceChannelId = null;
        this.state = enums_1.PlayerState.Disconnected;
        return this;
    }
    /**
     * Destroy the player.
     * @returns A YabokuPlayer instance.
     */
    destroy() {
        if (this.state === enums_1.PlayerState.Destroying ||
            this.state === enums_1.PlayerState.Destroyed)
            throw new _1.YabokuError(1, 'Player is already destroyed.');
        this.disconnect();
        this.state = enums_1.PlayerState.Destroying;
        this.shoukaku.connection.destroyLavalinkPlayer();
        this.shoukaku.removeAllListeners();
        this.yaboku.players.delete(this.guildId);
        this.state = enums_1.PlayerState.Destroyed;
        this.emit(enums_1.YabokuEvents.PlayerDestroy, this);
        return this;
    }
}
exports.default = YabokuPlayer;
