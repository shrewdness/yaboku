import { Player } from 'shoukaku';
import { LoopMode, PlayerState } from '../ts/enums';
import { PlayOptions, YabokuPlayerOptions, YabokuSearchOptions, YabokuSearchResult } from '../ts/interfaces';
import { Yaboku, YabokuQueue, YabokuTrack } from '.';
export default class YabokuPlayer {
    private readonly customData;
    /** YabokuPlayer options. */
    private options;
    /** The Yaboku instance. */
    private yaboku;
    /** The Shoukaku player instance. */
    shoukaku: Player;
    /** The id of the guild the player is in. */
    readonly guildId: string;
    /** The id of the voice channel the player is in. */
    voiceChannelId: string | null;
    /** The id of the text channel the player is bound to. */
    textChannelId: string;
    /** The player's queue. */
    readonly queue: YabokuQueue;
    /** The player's current state. */
    state: PlayerState;
    /** The player's current pause state.
     * (Whether the player is paused or not.)
     */
    paused: boolean;
    /** The player's curreny playing state
     * (Whether the player is playing or not.)
     */
    playing: boolean;
    /** The player's current loop mode. */
    loop: LoopMode;
    /** Search for tracks. */
    search: (query: string, options?: YabokuSearchOptions) => Promise<YabokuSearchResult>;
    /** The player's custom data. */
    readonly data: Map<string, any>;
    constructor(yaboku: Yaboku, player: Player, options: YabokuPlayerOptions, customData: unknown);
    private emit;
    private get node();
    private send;
    /**
     * Pause the player.
     * @param pause Whether to pause or unpause the player.
     * @returns A YabokuPlayer instance.
     */
    pause(pause: boolean): YabokuPlayer;
    /**
     * Set the text channel for the player.
     * @param textChannelId The id of the text channel to bind to.
     * @returns A YabokuPlayer instance.
     */
    setTextChannel(textChannelId: string): YabokuPlayer;
    /**
     * Set the voice channel for the player and move the player to it.
     * @param voiceChannelId The id of the voice channel to move to.
     * @returns A YabokuPlayer instance.
     */
    setVoiceChannel(voiceChannelId: string): YabokuPlayer;
    /**
     * Set the loop mode.
     * @param mode The loop mode to set.
     * @returns A YabokuPlayer instance.
     */
    setLoop(mode: LoopMode): YabokuPlayer;
    /**
     * Play a track.
     * @param track The track to play.
     * @param options Play options.
     * @returns A YabokuPlayer instance.
     */
    play(track?: YabokuTrack, options?: PlayOptions): Promise<YabokuPlayer>;
    /**
     * Skip the currently playing track.
     * @returns A YabokuPlayer instance.
     */
    skip(): YabokuPlayer;
    /**
     * Set the volume of the player.
     * @param volume The volume to set.
     * @returns A YabokuPlayer instance.
     */
    setVolume(volume: number): YabokuPlayer;
    /**
     * Connect to the voice channel.
     * @returns A YabokuPlayer instance.
     */
    connect(): YabokuPlayer;
    /**
     * Disconnect from the voice channel.
     * @returns A YabokuPlayer instance.
     */
    disconnect(): YabokuPlayer;
    /**
     * Destroy the player.
     * @returns A YabokuPlayer instance.
     */
    destroy(): YabokuPlayer;
}
