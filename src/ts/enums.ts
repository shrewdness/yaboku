enum PlayerState {
  Connecting,
  Connected,
  Disconnecting,
  Disconnected,
  Destroying,
  Destroyed,
}

enum State {
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  DISCONNECTED,
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

export {
  PlayerState,
  State,
  PlayerUpdateState,
  LoopMode,
  SearchEngines,
  SearchResult,
  YoutubeThumbnailResolution,
};
