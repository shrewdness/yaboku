import EventEmitter from 'events';
import {
  Node,
  NodeOption,
  PlayerUpdate,
  Shoukaku,
  ShoukakuOptions,
  TrackExceptionEvent,
  TrackStuckEvent,
  WebSocketClosedEvent,
} from 'shoukaku';
import { Connector } from 'shoukaku/dist/src/connectors/Connector';
import { User } from 'discord.js';
import { SourceIds } from '../ts/constants';
import { PlayerUpdateState, SearchResult, State } from '../ts/enums';
import {
  CreatePlayerOptions,
  PlayerUpdateChannels,
  YabokuOptions,
  YabokuSearchOptions,
  YabokuSearchResult,
} from '../ts/interfaces';
import { YabokuPlayer, YabokuTrack, YabokuError } from '.';

declare interface Yaboku {
  /**
   * Emitted when a new track starts playing.
   */
  on(
    event: 'trackStart',
    listener: (player: YabokuPlayer, track: YabokuTrack) => void,
  ): this;

  /**
   * Emitted when a track ends.
   */
  on(
    event: 'trackEnd',
    listener: (player: YabokuPlayer, track: YabokuTrack) => void,
  ): this;

  /**
   * Emitted when a track gets stuck due to an error.
   */
  on(
    event: 'trackStuck',
    listener: (player: YabokuPlayer, data: TrackStuckEvent) => void,
  ): this;

  /**
   * Emitted when there is an error caused by a track.
   */
  on(
    event: 'trackException',
    listener: (player: YabokuPlayer, data: TrackExceptionEvent) => void,
  ): this;

  /**
   * Emitted when a new player is created.
   */
  on(event: 'playerCreate', listener: (player: YabokuPlayer) => void): this;

  /**
   * Emitted when a player is updated.
   */
  on(
    event: 'playerUpdate',
    listener: (player: YabokuPlayer, data: PlayerUpdate) => void,
  ): this;

  /**
   * Emitted when a player's state is updated. (eg. player moved to another voice channel, player left...)
   * (THIS EVENT WILL ONLY EVER GET EMITTED WITH THE "PlayerStateUpdatePlugin" PLUGIN ENABLED)
   */
  on(
    event: 'playerStateUpdate',
    listener: (
      player: YabokuPlayer,
      state: PlayerUpdateState,
      channels: PlayerUpdateChannels,
    ) => void,
  ): this;

  /**
   * Emitted when a player is destroyed.
   */
  on(event: 'playerDestroy', listener: (player: YabokuPlayer) => void): this;

  /**
   * Emitted when the queue is empty and the player has nothing else to play.
   */
  on(event: 'playerEmpty', listener: (player: YabokuPlayer) => void): this;

  /**
   * Emitted when the current websocket connection (and player) is closed.
   */
  on(
    event: 'playerClose',
    listener: (player: YabokuPlayer, data: WebSocketClosedEvent) => void,
  ): this;
}

class Yaboku extends EventEmitter {
  /** The Shoukaku instance. */
  public shoukaku: Shoukaku;

  /** A map of all available players. */
  public readonly players: Map<string, YabokuPlayer> = new Map();

  /**
   * Initializes the Yaboku instance.
   * @param yabokuOptions The Yaboku options.
   * @param connector The Shoukaku connector to use.
   * @param nodes An array of lavalink nodes to use.
   * @param shoukakuOptions The Shoukaku options.
   */
  constructor(
    public yabokuOptions: YabokuOptions,
    connector: Connector,
    nodes: NodeOption[],
    shoukakuOptions: ShoukakuOptions = {},
  ) {
    super();
    this.shoukaku = new Shoukaku(connector, nodes, shoukakuOptions);

    if (this.yabokuOptions.plugins) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [, plugin] of this.yabokuOptions.plugins.entries()) {
        if (plugin.constructor.name !== 'YabokuPlugin')
          throw new YabokuError(
            1,
            'Plugin must be an instance of YabokuPlugin.',
          );
        plugin.load(this);
      }
    }

    this.players = new Map<string, YabokuPlayer>();
  }

  /**
   * Creates a new player.
   * @param options The player options.
   * @returns Promise<YabokuPlayer>
   */
  public async createPlayer<T extends YabokuPlayer>(
    options: CreatePlayerOptions,
  ): Promise<T | YabokuPlayer> {
    const exists = this.players.has(options.guildId);
    if (exists) throw new YabokuError(2, 'Player already exists.');

    const finalOptions: CreatePlayerOptions = options;

    let node;
    if (options.loadBalance) {
      node = this.getLeastUsedNode();
    } else if (options.nodeName) {
      node = this.shoukaku.getNode(options.nodeName);
    } else {
      node = this.shoukaku.getNode('auto');
    }

    if (!options.selfDeafen) finalOptions.selfDeafen = false;
    if (!options.selfMute) finalOptions.selfMute = false;

    if (!node) throw new YabokuError(3, 'No node found.');

    const shoukakuPlayer = await node.joinChannel({
      guildId: finalOptions.guildId,
      channelId: finalOptions.voiceChannelId,
      deaf: finalOptions.selfDeafen,
      mute: finalOptions.selfMute,
      shardId:
        finalOptions.shardId && !Number.isNaN(finalOptions.shardId)
          ? finalOptions.shardId
          : 0,
    });

    const yabokuPlayer = new (this.yabokuOptions.extends?.player ??
      YabokuPlayer)(
      this,
      shoukakuPlayer,
      {
        guildId: finalOptions.guildId,
        voiceChannelId: finalOptions.voiceChannelId,
        textChannelId: finalOptions.textChannelId,
        selfDeafen: finalOptions.selfDeafen || false,
      },
      finalOptions.data,
    );
    this.players.set(finalOptions.guildId, yabokuPlayer);
    this.emit('playerCreate', yabokuPlayer);
    return yabokuPlayer;
  }

  /**
   * Gets a player by a guildId.
   * @param guildId The id of the guild to get the player of.
   * @returns YabokuPlayer | null
   */
  public getPlayer<T extends YabokuPlayer>(
    guildId: string,
  ): (T | YabokuPlayer) | null {
    return this.players.get(guildId) || null;
  }

  public destroyPlayer<T extends YabokuPlayer>(guildId: string): void {
    const player = this.getPlayer<T>(guildId);
    if (!player) return;
    (player as YabokuPlayer).destroy();
    this.players.delete(guildId);
  }

  /**
   * Gets the least used node.
   * @returns Node
   */
  public getLeastUsedNode(): Node {
    const nodes: Node[] = [...this.shoukaku.nodes.values()];

    const onlineNodes = nodes.filter((node) => node.state === State.CONNECTED);
    if (!onlineNodes.length) {
      throw new YabokuError(2, "There aren't any nodes online.");
    }

    const leastUsedNode = onlineNodes.reduce((a, b) =>
      a.players.size < b.players.size ? a : b,
    );
    return leastUsedNode;
  }

  public async search(
    query: string,
    options?: YabokuSearchOptions,
  ): Promise<YabokuSearchResult> {
    const node = this.getLeastUsedNode();
    if (!node) throw new YabokuError(3, 'No node found.');
    const sources = SourceIds;
    const sourceSetting =
      (options?.engine &&
      ['youtube', 'youtube_music', 'soundcloud'].includes(options.engine)
        ? options.engine
        : null) ||
      (!!this.yabokuOptions.defaultSearchEngine &&
      ['youtube', 'youtube_music', 'soundcloud'].includes(
        this.yabokuOptions.defaultSearchEngine,
      )
        ? this.yabokuOptions.defaultSearchEngine
        : null) ||
      'youtube';
    const source = sources[sourceSetting];

    const isUrl = /^https?:\/\/.*/.test(query);

    const result = await node.rest
      .resolve(!isUrl ? `${source}search:${query}` : query)
      .catch(() => null);

    if (!result) return this.buildSearch(undefined, [], SearchResult.Search);
    let loadType = isUrl ? SearchResult.Track : SearchResult.Search;
    if (result.playlistInfo.name) loadType = SearchResult.Playlist;

    return this.buildSearch(
      result.playlistInfo.name ?? undefined,
      result.tracks.map(
        (track) => new YabokuTrack(track, options?.requester as User),
      ),
      loadType,
    );
  }

  private buildSearch(
    playlistName?: string,
    tracks: YabokuTrack[] = [],
    type?: SearchResult,
  ): YabokuSearchResult {
    return {
      playlistName,
      tracks,
      type: type ?? SearchResult.Search,
    };
  }
}

export default Yaboku;
