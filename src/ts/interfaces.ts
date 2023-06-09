import { User } from 'discord.js';
import type { Snowflake } from 'discord.js';
import type { Constructor } from './types';
import { YabokuPlayer, YabokuPlugin, YabokuTrack } from '../structures';
import {
  SearchEngines,
  SearchResult,
  YoutubeThumbnailResolution,
} from './enums';

interface YabokuOptions {
  /** Default search engine if no engine was provided. */
  defaultSearchEngine: SearchEngines;

  /** Yaboku plugins to load. */
  plugins?: YabokuPlugin[];

  /** Source that will be forced to resolve when playing it. */
  sourceForceResolve?: string[];

  /** The track resolver. (Ensure <YabokuTrack>.track is set for it to work.) */
  trackResolver?: (
    this: YabokuTrack,
    options?: ResolveOptions,
  ) => Promise<boolean>;

  /** The default YouTube video thumbnail resolution. */
  defaultYoutubeThumbnailResolution?: YoutubeThumbnailResolution;

  /** Custom structures. */
  extends?: {
    player?: Constructor<YabokuPlayer>;
  };

  /** Send payload to guild's shard. */
  send: (guildId: Snowflake, payload: Payload) => void;
}

interface YabokuPlayerOptions {
  guildId: Snowflake;
  voiceChannelId: Snowflake;
  textChannelId: Snowflake;
  selfDeafen: boolean;
  /**
   * Whether the player should use the same node for searching tracks and playing tracks.
   * Default: true
   */
  searchWithSameNode?: boolean;
}

interface YabokuSearchOptions {
  requester: User;
  engine: SearchEngines;
  nodeName?: string;
}

interface YabokuSearchResult {
  type: SearchResult;
  playlistName?: string;
  tracks: YabokuTrack[];
}

interface Payload {
  op: number;
  d: {
    guild_id: string;
    channel_id: string | null;
    self_mute: boolean;
    self_deaf: boolean;
  };
}

interface CreatePlayerOptions {
  /** The id of this guild. */
  guildId: Snowflake;
  /** The id of the voice channel for the player to join. */
  voiceChannelId: Snowflake;
  /** The id of the text channel for player to bind to. */
  textChannelId: Snowflake;
  /** Whether the bot should be deafened. */
  selfDeafen?: boolean;
  /** Whether the bot should be muted. */
  selfMute?: boolean;
  /** The id of the shard this guild is in. */
  shardId?: number;
  /** Whether to use the least used node. */
  loadBalance?: boolean;
  /** The name of the node to use. */
  nodeName?: string;
  /** The player's data, usable when the player has been extended. */
  data?: unknown;
}

interface RawYabokuTrack {
  track: string;
  info: {
    title: string;
    uri: string;
    identifier: string;
    sourceName: string;
    isSeekable: boolean;
    isStream: boolean;
    author?: string;
    length?: number;
    position?: number;
    thumbnail?: string;
  };
}

interface ResolveOptions {
  overwrite?: boolean;
  forceResolve?: boolean;
  player?: YabokuPlayer;
}

interface PlayOptions {
  noReplace?: boolean;
  pause?: boolean;
  startTime?: boolean;
  endTime?: boolean;
  replaceCurrent?: boolean;
}

interface PlayerUpdateChannels {
  oldVoiceChannelId?: Snowflake;
  newVoiceChannelId?: Snowflake;
}

export {
  YabokuOptions,
  YabokuPlayerOptions,
  YabokuSearchOptions,
  YabokuSearchResult,
  Payload,
  CreatePlayerOptions,
  RawYabokuTrack,
  ResolveOptions,
  PlayOptions,
  PlayerUpdateChannels,
};
