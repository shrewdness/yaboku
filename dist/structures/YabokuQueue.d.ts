import { YabokuTrack } from '.';
export default class YabokuQueue extends Array<YabokuTrack> {
    /** The size of the queue. */
    get size(): number;
    /** The size of the queue including current. */
    get totalSize(): number;
    /** Check if the queue is empty or not. */
    get isEmpty(): boolean;
    /** The queue's duration. */
    get duration(): number;
    /** The track that is currently playing. */
    current: YabokuTrack | undefined | null;
    /** The track that played before the current one. */
    previous: YabokuTrack | undefined | null;
    /**
     * Add track(s) to the queue.
     * @param tracks The track or an array of tracks to add to the queue.
     * @returns {YabokuQueue}
     */
    add(tracks: YabokuTrack | YabokuTrack[]): YabokuQueue;
    /**
     * Remove a track from the queue by its position.
     * @param position The position of the track to remove from the queue.
     * @returns {YabokuQueue}
     */
    remove(position: number): YabokuQueue;
    /**
     * Shuffle the queue.
     * @returns {YabokuQueue}
     */
    shuffle(): YabokuQueue;
    /**
     * Clear the queue.
     * @returns {YabokuQueue}
     */
    clear(): YabokuQueue;
}
