import { YabokuError, YabokuTrack } from '.';

export default class YabokuQueue extends Array<YabokuTrack> {
  /** The size of the queue. */
  public get size() {
    return this.length;
  }

  /** The size of the queue including current. */
  public get totalSize(): number {
    return this.length + (this.current ? 1 : 0);
  }

  /** Check if the queue is empty or not. */
  public get isEmpty() {
    return this.length === 0;
  }

  /** The queue's duration. */
  public get duration() {
    return this.reduce((acc, cur) => acc + (cur.length || 0), 0);
  }

  /** The track that is currently playing. */
  public current: YabokuTrack | undefined | null = null;

  /** The track that played before the current one. */
  public previous: YabokuTrack | undefined | null = null;

  /**
   * Add track(s) to the queue.
   * @param tracks The track or an array of tracks to add to the queue.
   * @returns {YabokuQueue}
   */
  public add(tracks: YabokuTrack | YabokuTrack[]): YabokuQueue {
    let track = tracks;
    if (
      Array.isArray(tracks) &&
      tracks.some((t) => !(t instanceof YabokuTrack))
    ) {
      throw new YabokuError(1, 'The track must be an instance of YabokuTrack.');
    }
    if (!Array.isArray(track) && !(tracks instanceof YabokuTrack))
      track = [track];

    if (!this.current) {
      if (Array.isArray(track)) {
        this.current = track.shift();
      } else {
        this.current = track;
        return this;
      }
    }

    if (Array.isArray(track)) {
      for (let index = 0; index < track.length; index += 1) {
        this.push(track[index]);
      }
    } else {
      this.push(track);
    }
    return this;
  }

  /**
   * Remove a track from the queue by its position.
   * @param position The position of the track to remove from the queue.
   * @returns {YabokuQueue}
   */
  public remove(position: number): YabokuQueue {
    if (position < 0 || position >= this.length) {
      throw new YabokuError(
        1,
        `Position must be between 0 and ${this.length - 1}`,
      );
    }
    this.splice(position, 1);
    return this;
  }

  /**
   * Shuffle the queue.
   * @returns {YabokuQueue}
   */
  public shuffle(): YabokuQueue {
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
  public clear(): YabokuQueue {
    this.splice(0, this.length);
    return this;
  }
}
