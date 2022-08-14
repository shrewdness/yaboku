"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YabokuEvents = exports.YoutubeThumbnailResolution = exports.SearchResult = exports.SearchEngines = exports.LoopMode = exports.PlayerUpdateState = exports.State = exports.PlayerState = void 0;
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Connecting"] = 0] = "Connecting";
    PlayerState[PlayerState["Connected"] = 1] = "Connected";
    PlayerState[PlayerState["Disconnecting"] = 2] = "Disconnecting";
    PlayerState[PlayerState["Disconnected"] = 3] = "Disconnected";
    PlayerState[PlayerState["Destroying"] = 4] = "Destroying";
    PlayerState[PlayerState["Destroyed"] = 5] = "Destroyed";
})(PlayerState || (PlayerState = {}));
exports.PlayerState = PlayerState;
var State;
(function (State) {
    State[State["CONNECTING"] = 0] = "CONNECTING";
    State[State["CONNECTED"] = 1] = "CONNECTED";
    State[State["DISCONNECTING"] = 2] = "DISCONNECTING";
    State[State["DISCONNECTED"] = 3] = "DISCONNECTED";
})(State || (State = {}));
exports.State = State;
var PlayerUpdateState;
(function (PlayerUpdateState) {
    PlayerUpdateState["Unknown"] = "UNKNOWN";
    PlayerUpdateState["Joined"] = "JOINED";
    PlayerUpdateState["Left"] = "LEFT";
    PlayerUpdateState["Moved"] = "MOVED";
})(PlayerUpdateState || (PlayerUpdateState = {}));
exports.PlayerUpdateState = PlayerUpdateState;
var LoopMode;
(function (LoopMode) {
    LoopMode["None"] = "none";
    LoopMode["Queue"] = "queue";
    LoopMode["Track"] = "track";
})(LoopMode || (LoopMode = {}));
exports.LoopMode = LoopMode;
var SearchEngines;
(function (SearchEngines) {
    SearchEngines["YouTube"] = "youtube";
    SearchEngines["SoundCloud"] = "soundcloud";
    SearchEngines["YouTubeMusic"] = "youtube_music";
})(SearchEngines || (SearchEngines = {}));
exports.SearchEngines = SearchEngines;
var SearchResult;
(function (SearchResult) {
    SearchResult["Playlist"] = "PLAYLIST";
    SearchResult["Track"] = "TRACK";
    SearchResult["Search"] = "SEARCH";
})(SearchResult || (SearchResult = {}));
exports.SearchResult = SearchResult;
var YoutubeThumbnailResolution;
(function (YoutubeThumbnailResolution) {
    /** Default resolution. */
    YoutubeThumbnailResolution["Default"] = "default";
    /** Standard resolution. */
    YoutubeThumbnailResolution["SdDefault"] = "sddefault";
    /** Medium resolution. */
    YoutubeThumbnailResolution["MdDefault"] = "mqdefault";
    /** High resolution. */
    YoutubeThumbnailResolution["HqDefault"] = "hqdefault";
    /** Maximum resolution. */
    YoutubeThumbnailResolution["MaxResDefault"] = "maxresdefault";
})(YoutubeThumbnailResolution || (YoutubeThumbnailResolution = {}));
exports.YoutubeThumbnailResolution = YoutubeThumbnailResolution;
var YabokuEvents;
(function (YabokuEvents) {
    YabokuEvents["PlayerCreate"] = "playerCreate";
    YabokuEvents["PlayerUpdate"] = "playerUpdate";
    YabokuEvents["PlayerStateUpdate"] = "playerStateUpdate";
    YabokuEvents["PlayerDestroy"] = "playerDestroy";
    YabokuEvents["PlayerEmpty"] = "playerEmpty";
    YabokuEvents["PlayerClose"] = "playerClose";
    YabokuEvents["TrackStart"] = "trackStart";
    YabokuEvents["TrackEnd"] = "trackEnd";
    YabokuEvents["TrackStuck"] = "trackStuck";
    YabokuEvents["TrackException"] = "trackException";
    YabokuEvents["TrackResolveException"] = "trackResolveException";
})(YabokuEvents || (YabokuEvents = {}));
exports.YabokuEvents = YabokuEvents;
