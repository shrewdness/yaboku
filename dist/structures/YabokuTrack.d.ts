import { User } from 'discord.js';
import { RawYabokuTrack, ResolveOptions } from '../ts/interfaces';
import { Yaboku } from '.';
export default class YabokuTrack {
    /** The Yaboku instance. */
    yaboku: Yaboku | undefined;
    /** The track requester. */
    requester: User | undefined;
    /** The track's Base64. */
    track: string;
    /** The track's source. */
    sourceName: string;
    /** The track's title. */
    title: string;
    /** The track's URI. */
    uri: string;
    /** The track's identifier. */
    identifier: string;
    /** Whether the track is seekable. */
    isSeekable: boolean;
    /** Whether the track is a stream. */
    isStream: boolean;
    /** The track's author. */
    author: string | undefined;
    /** The track's length. */
    length: number | undefined;
    /** The track's position in queue. */
    position: number | undefined;
    /** The track's thumbnail, if available. */
    thumbnail: string | undefined;
    /** The original URI for this track. */
    realUri: string | null;
    resolvedBySource: boolean;
    constructor(raw: RawYabokuTrack, requester: User);
    /**
     * Get the raw data (json) of a track.
     * @returns {RawYabokuTrack}
     */
    getRaw(): RawYabokuTrack;
    /**
     * Set the Yaboku instance.
     * @param yaboku The Yaboku instance.
     * @returns {YabokuTrack}
     */
    setYaboku(yaboku: Yaboku): YabokuTrack;
    /** Check whether the track is ready to play or needs to be resolved. */
    get readyToPlay(): boolean;
    /**
     * Resolve a track.
     * @param options Resolve options.
     * @returns {Promise<YabokuTrack>}
     */
    resolveTrack(options?: ResolveOptions): Promise<YabokuTrack>;
    private getTrack;
}
