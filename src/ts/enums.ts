enum PlayerState {
  Connecting,
  Connected,
  Disconnecting,
  Disconnected,
  Destroying,
  Destroyed,
}

enum PlayerUpdateState {
  Unknown = 'UNKNOWN',
  Joined = 'JOINED',
  Left = 'LEFT',
  Moved = 'MOVED',
}

enum LoopMode {
  None = 'none',
  Queue = 'queue',
  Track = 'track',
}

enum SearchEngines {
  YouTube = 'youtube',
  SoundCloud = 'soundcloud',
  YouTubeMusic = 'youtube_music',
}

enum SearchResult {
  Playlist = 'PLAYLIST',
  Track = 'TRACK',
  Search = 'SEARCH',
}

enum YoutubeThumbnailResolution {
  /** Default resolution. */
  Default = 'default',
  /** Standard resolution. */
  SdDefault = 'sddefault',
  /** Medium resolution. */
  MdDefault = 'mqdefault',
  /** High resolution. */
  HqDefault = 'hqdefault',
  /** Maximum resolution. */
  MaxResDefault = 'maxresdefault',
}

enum YabokuEvents {
  PlayerCreate = 'playerCreate',
  PlayerUpdate = 'playerUpdate',
  PlayerStateUpdate = 'playerStateUpdate',
  PlayerDestroy = 'playerDestroy',
  PlayerEmpty = 'playerEmpty',
  PlayerClose = 'playerClose',
  TrackStart = 'trackStart',
  TrackEnd = 'trackEnd',
  TrackStuck = 'trackStuck',
  TrackException = 'trackException',
  TrackResolveException = 'trackResolveException',
}

export {
  PlayerState,
  PlayerUpdateState,
  LoopMode,
  SearchEngines,
  SearchResult,
  YoutubeThumbnailResolution,
  YabokuEvents,
};
