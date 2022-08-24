import {
  Node,
  Player,
  PlayerUpdate,
  TrackExceptionEvent,
  TrackStuckEvent,
  WebSocketClosedEvent,
} from 'shoukaku';
import { LoopMode, PlayerState } from '../ts/enums';
import {
  PlayOptions,
  YabokuPlayerOptions,
  YabokuSearchOptions,
  YabokuSearchResult,
} from '../ts/interfaces';
import { Yaboku, YabokuError, YabokuQueue, YabokuTrack } from '.';
import { YabokuEvents } from '../ts/types';

export default class YabokuPlayer {
  /** YabokuPlayer options. */
  private options: YabokuPlayerOptions;

  /** The Yaboku instance. */
  private yaboku: Yaboku;

  /** The Shoukaku player instance. */
  public shoukaku: Player;

  /** The id of the guild the player is in. */
  public readonly guildId: string;

  /** The id of the voice channel the player is in. */
  public voiceChannelId: string | null;

  /** The id of the text channel the player is bound to. */
  public textChannelId: string;

  /** The player's queue. */
  public readonly queue: YabokuQueue;

  /** The player's current state. */
  public state: PlayerState = PlayerState.Connecting;

  /** The player's current pause state.
   * (Whether the player is paused or not.)
   */
  public paused = false;

  /** The player's curreny playing state
   * (Whether the player is playing or not.)
   */
  public playing = false;

  /** The player's current loop mode. */
  public loop: LoopMode = LoopMode.None;

  /** Search for tracks. */
  public search: (
    query: string,
    options?: YabokuSearchOptions,
  ) => Promise<YabokuSearchResult>;

  /** The player's custom data. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly data: Map<string, any> = new Map();

  constructor(
    yaboku: Yaboku,
    player: Player,
    options: YabokuPlayerOptions,
    private readonly customData: unknown,
  ) {
    this.options = options;
    this.yaboku = yaboku;
    this.shoukaku = player;
    this.guildId = options.guildId;
    this.voiceChannelId = options.voiceChannelId;
    this.textChannelId = options.textChannelId;
    this.queue = new YabokuQueue();

    this.search = this.yaboku.search.bind(this.yaboku);

    this.shoukaku.on('start', () => {
      this.playing = true;
      this.emit('trackStart', this, this.queue.current);
    });

    this.shoukaku.on('end', (data) => {
      if (
        this.state === PlayerState.Destroying ||
        this.state === PlayerState.Destroyed
      )
        return;
      if (data.reason === 'REPLACED') this.emit('trackEnd', this, null);

      if (['LOAD_FAILED', 'CLEAN_UP'].includes(data.reason)) {
        this.queue.previous = this.queue.current;
        this.playing = false;
        if (!this.queue.length) this.emit('playerEmpty', this);
        this.emit('trackEnd', this);
        this.queue.current = null;
        this.play().catch(() => null);
      }

      if (this.loop === LoopMode.Track && this.queue.current)
        this.queue.unshift(this.queue.current);
      if (this.loop === LoopMode.Queue && this.queue.length)
        this.queue.push(this.queue.current as YabokuTrack);

      this.queue.previous = this.queue.current;
      const currentTrack = this.queue.current;
      this.queue.current = null;
      if (this.queue.length) {
        this.emit('trackEnd', this, currentTrack);
      } else {
        this.playing = false;
        this.emit('playerEmpty', this);
      }
      this.play().catch(() => null);
    });

    this.shoukaku.on('closed', (data: WebSocketClosedEvent) => {
      this.playing = false;
      this.emit('playerClose', this, data);
    });

    this.shoukaku.on('exception', (data: TrackExceptionEvent) => {
      this.playing = false;
      this.emit('trackException', this, data);
    });

    this.shoukaku.on('update', (data: PlayerUpdate) => {
      this.emit('playerUpdate', this, data);
    });

    this.shoukaku.on('stuck', (data: TrackStuckEvent) => {
      this.emit('trackStuck', this, data);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(event: YabokuEvents, ...args: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.yaboku.emit(event, ...args);
  }

  private get node(): Node {
    return this.shoukaku.node;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private send(...args: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.node.queue.add(...args);
  }

  /**
   * Pauses the player.
   * @param pause Whether to pause or unpause the player.
   * @returns A YabokuPlayer instance.
   */
  public pause(pause: boolean): YabokuPlayer {
    if (typeof pause !== 'boolean')
      throw new YabokuError(1, 'Invalid argument passed to pause().');

    if (this.paused === pause || !this.queue.totalSize) return this;
    this.paused = pause;
    this.playing = !pause;
    this.shoukaku.setPaused(pause);
    return this;
  }

  /**
   * Sets the text channel for the player.
   * @param textChannelId The id of the text channel to bind to.
   * @returns A YabokuPlayer instance.
   */
  public setTextChannel(textChannelId: string): YabokuPlayer {
    if (this.state === PlayerState.Destroyed)
      throw new YabokuError(1, 'Player is destroyed.');
    this.textChannelId = textChannelId;
    return this;
  }

  /**
   * Sets the voice channel for the player and move the player to it.
   * @param voiceChannelId The id of the voice channel to move to.
   * @returns A YabokuPlayer instance.
   */
  public setVoiceChannel(voiceChannelId: string): YabokuPlayer {
    if (this.state === PlayerState.Destroyed)
      throw new YabokuError(1, 'Player is destroyed.');
    this.state = PlayerState.Connecting;
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
   * Sets the loop mode.
   * @param mode The loop mode to set.
   * @returns A YabokuPlayer instance.
   */
  public setLoop(mode: LoopMode): YabokuPlayer {
    if (mode === undefined) {
      if (this.loop === LoopMode.None) this.loop = LoopMode.Queue;
      else if (this.loop === LoopMode.Queue) this.loop = LoopMode.Track;
      else if (this.loop === LoopMode.Track) this.loop = LoopMode.None;
      return this;
    }

    this.loop = mode;
    return this;
  }

  /**
   * Plays a track.
   * @param track The track to play.
   * @param options Play options.
   * @returns A YabokuPlayer instance.
   */
  public async play(
    track?: YabokuTrack,
    options?: PlayOptions,
  ): Promise<YabokuPlayer> {
    if (this.state === PlayerState.Destroyed)
      throw new YabokuError(1, 'Player is destroyed.');

    if (track && !(track instanceof YabokuTrack))
      throw new YabokuError(1, 'Track must be an instance of YabokuTrack.');

    if (!track && !this.queue.totalSize)
      throw new YabokuError(1, "The queue is empty, there's nothing to play.");

    if (!options || typeof options.replaceCurrent !== 'boolean')
      options = { ...options, replaceCurrent: false };

    if (track) {
      if (!options.replaceCurrent && this.queue.current)
        this.queue.unshift(this.queue.current);
      this.queue.current = track;
    } else if (!this.queue.current) this.queue.current = this.queue.shift();

    if (!this.queue.current)
      throw new YabokuError(1, "There's nothing to play.");

    const { current } = this.queue;
    current.setYaboku(this.yaboku);

    let errorMessage: string | undefined;

    const resolveResult = await current.resolveTrack().catch((e: Error) => {
      errorMessage = e.message;
      return null;
    });

    if (!resolveResult) {
      this.emit('trackResolveException', this, current, errorMessage);
      this.queue.current = null;
      if (this.queue.size) {
        this.play().catch(() => null);
      } else {
        this.emit('playerEmpty', this);
      }
      return this;
    }

    const playOptions = { track: current.track, options: {} };
    if (options) playOptions.options = { ...options, noReplace: false };
    else playOptions.options = { noReplace: false };

    this.shoukaku.playTrack(playOptions);

    return this;
  }

  /**
   * Skips the currently playing track.
   * @returns A YabokuPlayer instance.
   */
  public skip(): YabokuPlayer {
    if (this.state === PlayerState.Destroyed)
      throw new YabokuError(1, 'Player is destroyed.');
    this.shoukaku.stopTrack();
    return this;
  }

  /**
   * Sets the volume of the player.
   * @param volume The volume to set.
   * @returns A YabokuPlayer instance.
   */
  public setVolume(volume: number): YabokuPlayer {
    if (this.state === PlayerState.Destroyed)
      throw new YabokuError(1, 'Player is destroyed.');
    if (Number.isNaN(volume))
      throw new YabokuError(1, 'Volume parameter must be a number.');
    this.shoukaku.filters.volume = volume / 100;
    this.send({
      op: 'volume',
      guildId: this.guildId,
      volume: this.shoukaku.filters.volume * 100,
    });
    return this;
  }

  /**
   * Connects to the voice channel.
   * @returns A YabokuPlayer instance.
   */
  public connect(): YabokuPlayer {
    if (this.state === PlayerState.Destroyed)
      throw new YabokuError(1, 'Player is destroyed.');
    if (this.state === PlayerState.Connected || !!this.voiceChannelId)
      throw new YabokuError(1, 'Player is already connected.');
    this.state = PlayerState.Connecting;

    this.yaboku.yabokuOptions.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: this.voiceChannelId,
        self_mute: false,
        self_deaf: this.options.selfDeafen,
      },
    });

    this.state = PlayerState.Connected;

    return this;
  }

  /**
   * Disconnects from the voice channel.
   * @returns A YabokuPlayer instance.
   */
  public disconnect(): YabokuPlayer {
    if (this.state === PlayerState.Disconnected || !this.voiceChannelId)
      throw new YabokuError(1, 'Player is already disconnected.');
    this.state = PlayerState.Disconnecting;

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
    this.state = PlayerState.Disconnected;

    return this;
  }

  /**
   * Destroys the player.
   * @returns A YabokuPlayer instance.
   */
  public destroy(): YabokuPlayer {
    if (
      this.state === PlayerState.Destroying ||
      this.state === PlayerState.Destroyed
    )
      throw new YabokuError(1, 'Player is already destroyed.');

    this.disconnect();
    this.state = PlayerState.Destroying;
    this.shoukaku.connection.destroyLavalinkPlayer();
    this.shoukaku.removeAllListeners();
    this.yaboku.players.delete(this.guildId);
    this.state = PlayerState.Destroyed;

    this.emit('playerDestroy', this);

    return this;
  }
}
