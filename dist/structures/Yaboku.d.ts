import EventEmitter from 'events';
import { Node, NodeOption, PlayerUpdate, Shoukaku, ShoukakuOptions, TrackExceptionEvent, TrackStuckEvent, WebSocketClosedEvent } from 'shoukaku';
import { Connector } from 'shoukaku/dist/src/connectors/Connector';
import { PlayerUpdateState, YabokuEvents } from '../ts/enums';
import { CreatePlayerOptions, PlayerUpdateChannels, YabokuOptions, YabokuSearchOptions, YabokuSearchResult } from '../ts/interfaces';
import { YabokuPlayer, YabokuTrack } from '.';
declare interface Yaboku {
    /**
     * Emitted when a new track starts playing.
     */
    on(event: YabokuEvents.TrackStart, listener: (player: YabokuPlayer, track: YabokuTrack) => void): this;
    /**
     * Emitted when a track ends.
     */
    on(event: YabokuEvents.TrackEnd, listener: (player: YabokuPlayer, track: YabokuTrack) => void): this;
    /**
     * Emitted when a track gets stuck due to an error.
     */
    on(event: YabokuEvents.TrackStuck, listener: (player: YabokuPlayer, data: TrackStuckEvent) => void): this;
    /**
     * Emitted when there is an error caused by a track.
     */
    on(event: YabokuEvents.TrackException, listener: (player: YabokuPlayer, data: TrackExceptionEvent) => void): this;
    /**
     * Emitted when a new player is created.
     */
    on(event: YabokuEvents.PlayerCreate, listener: (player: YabokuPlayer) => void): this;
    /**
     * Emitted when a player is updated.
     */
    on(event: YabokuEvents.PlayerUpdate, listener: (player: YabokuPlayer, data: PlayerUpdate) => void): this;
    /**
     * Emitted when a player's state is updated. (eg. player left the voice channel, got kicked etc...)
     * (THIS EVENT WILL ONLY EVER GET EMITTED WITH THE "PlayerStateUpdatePlugin" PLUGIN ENABLED)
     */
    on(event: YabokuEvents.PlayerStateUpdate, listener: (player: YabokuPlayer, state: PlayerUpdateState, channels: PlayerUpdateChannels) => void): this;
    /**
     * Emitted when a player is destroyed.
     */
    on(event: YabokuEvents.PlayerDestroy, listener: (player: YabokuPlayer) => void): this;
    /**
     * Emitted when the queue is empty and the player has nothing else to play.
     */
    on(event: YabokuEvents.PlayerEmpty, listener: (player: YabokuPlayer) => void): this;
    /**
     * Emitted when the current websocket connection (and player) is closed.
     */
    on(event: YabokuEvents.PlayerClose, listener: (player: YabokuPlayer, data: WebSocketClosedEvent) => void): this;
}
declare class Yaboku extends EventEmitter {
    yabokuOptions: YabokuOptions;
    /** The Shoukaku instance. */
    shoukaku: Shoukaku;
    /** A map of all available players. */
    readonly players: Map<string, YabokuPlayer>;
    /**
     * Initialize the Yaboku instance.
     * @param yabokuOptions The Yaboku options.
     * @param connector The Shoukaku connector to use.
     * @param nodes An array of lavalink nodes to use.
     * @param shoukakuOptions The Shoukaku options.
     */
    constructor(yabokuOptions: YabokuOptions, connector: Connector, nodes: NodeOption[], shoukakuOptions?: ShoukakuOptions);
    /**
     * Create a new player.
     * @param options The player options.
     * @returns Promise<YabokuPlayer>
     */
    createPlayer<T extends YabokuPlayer>(options: CreatePlayerOptions): Promise<T | YabokuPlayer>;
    /**
     * Get a player by a guildId.
     * @param guildId The id of the guild to get the player of.
     * @returns YabokuPlayer | null
     */
    getPlayer<T extends YabokuPlayer>(guildId: string): (T | YabokuPlayer) | null;
    destroyPlayer<T extends YabokuPlayer>(guildId: string): void;
    /**
     * Get the least used node.
     * @returns Node
     */
    getLeastUsedNode(): Node;
    search(query: string, options?: YabokuSearchOptions): Promise<YabokuSearchResult>;
    private buildSearch;
}
export default Yaboku;
