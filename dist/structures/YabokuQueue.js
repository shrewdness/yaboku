"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class YabokuQueue extends Array {
    /** The size of the queue. */
    get size() {
        return this.length;
    }
    /** The size of the queue including current. */
    get totalSize() {
        return this.length + (this.current ? 1 : 0);
    }
    /** Check if the queue is empty or not. */
    get isEmpty() {
        return this.length === 0;
    }
    /** The queue's duration. */
    get duration() {
        return this.reduce((acc, cur) => acc + (cur.length || 0), 0);
    }
    /** The track that is currently playing. */
    current = null;
    /** The track that played before the current one. */
    previous = null;
    /**
     * Add track(s) to the queue.
     * @param tracks The track or an array of tracks to add to the queue.
     * @returns {YabokuQueue}
     */
    add(tracks) {
        let track = tracks;
        if (Array.isArray(tracks) &&
            tracks.some((t) => !(t instanceof _1.YabokuTrack))) {
            throw new _1.YabokuError(1, 'The track must be an instance of YabokuTrack.');
        }
        if (!Array.isArray(track) && !(tracks instanceof _1.YabokuTrack))
            track = [track];
        if (!this.current) {
            if (Array.isArray(track)) {
                this.current = track.shift();
            }
            else {
                this.current = track;
                return this;
            }
        }
        if (Array.isArray(track)) {
            for (let index = 0; index < track.length; index += 1) {
                this.push(track[index]);
            }
        }
        else {
            this.push(track);
        }
        return this;
    }
    /**
     * Remove a track from the queue by its position.
     * @param position The position of the track to remove from the queue.
     * @returns {YabokuQueue}
     */
    remove(position) {
        if (position < 0 || position >= this.length) {
            throw new _1.YabokuError(1, `Position must be between 0 and ${this.length - 1}`);
        }
        this.splice(position, 1);
        return this;
    }
    /**
     * Shuffle the queue.
     * @returns {YabokuQueue}
     */
    shuffle() {
        for (let i = this.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
    /**
     * Clear the queue.
     * @returns {YabokuQueue}
     */
    clear() {
        this.splice(0, this.length);
        return this;
    }
}
exports.default = YabokuQueue;
