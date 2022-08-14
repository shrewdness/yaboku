declare enum PlayerState {
    Connecting = 0,
    Connected = 1,
    Disconnecting = 2,
    Disconnected = 3,
    Destroying = 4,
    Destroyed = 5
}
declare enum PlayerUpdateState {
    Unknown = "UNKNOWN",
    Joined = "JOINED",
    Left = "LEFT",
    Moved = "MOVED"
}
declare enum LoopMode {
    None = "none",
    Queue = "queue",
    Track = "track"
}
declare enum SearchEngines {
    YouTube = "youtube",
    SoundCloud = "soundcloud",
    YouTubeMusic = "youtube_music"
}
declare enum SearchResult {
    Playlist = "PLAYLIST",
    Track = "TRACK",
    Search = "SEARCH"
}
declare enum YoutubeThumbnailResolution {
    /** Default resolution. */
    Default = "default",
    /** Standard resolution. */
    SdDefault = "sddefault",
    /** Medium resolution. */
    MdDefault = "mqdefault",
    /** High resolution. */
    HqDefault = "hqdefault",
    /** Maximum resolution. */
    MaxResDefault = "maxresdefault"
}
declare enum YabokuEvents {
    PlayerCreate = "playerCreate",
    PlayerUpdate = "playerUpdate",
    PlayerStateUpdate = "playerStateUpdate",
    PlayerDestroy = "playerDestroy",
    PlayerEmpty = "playerEmpty",
    PlayerClose = "playerClose",
    TrackStart = "trackStart",
    TrackEnd = "trackEnd",
    TrackStuck = "trackStuck",
    TrackException = "trackException",
    TrackResolveException = "trackResolveException"
}
export { PlayerState, PlayerUpdateState, LoopMode, SearchEngines, SearchResult, YoutubeThumbnailResolution, YabokuEvents, };
