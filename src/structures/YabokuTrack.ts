import { User } from 'discord.js';
import { Track } from 'shoukaku';
import { escapeRegExp, SourceIds, SupportedSources } from '../ts/constants';
import { SearchEngines } from '../ts/enums';
import { RawYabokuTrack, ResolveOptions } from '../ts/interfaces';
import { Yaboku, YabokuError, YabokuPlayer } from '.';
import YabokuUtil from './YabokuUtil';

export default class YabokuTrack {
  /** The Yaboku instance. */
  public yaboku: Yaboku | undefined;

  /** The track requester. */
  public requester: User | undefined;

  /** The track's Base64. */
  public track: string;

  /** The track's source. */
  public sourceName: string;

  /** The track's title. */
  public title: string;

  /** The track's URI. */
  public uri: string;

  /** The track's identifier. */
  public identifier: string;

  /** Whether the track is seekable. */
  public isSeekable: boolean;

  /** Whether the track is a stream. */
  public isStream: boolean;

  /** The track's author. */
  public author: string | undefined;

  /** The track's length. */
  public length: number | undefined;

  /** The track's position in queue. */
  public position: number | undefined;

  /** The track's thumbnail, if available. */
  public thumbnail: string | undefined;

  /** The original URI for this track. */
  public realUri: string | null;

  public resolvedBySource = false;

  constructor(raw: RawYabokuTrack, requester: User) {
    this.yaboku = undefined;
    this.track = raw.track;
    this.sourceName = raw.info.sourceName;
    this.title = raw.info.title;
    this.uri = raw.info.uri;
    this.identifier = raw.info.identifier;
    this.isSeekable = raw.info.isSeekable;
    this.isStream = raw.info.isStream;
    this.author = raw.info.author;
    this.length = raw.info.length;
    this.position = raw.info.position;
    this.thumbnail = raw.info.thumbnail;
    this.realUri = SupportedSources.includes(this.sourceName) ? this.uri : null;
    this.requester = requester;
    if (this.sourceName === SearchEngines.YouTube && this.identifier) {
      this.thumbnail = `https://img.youtube.com/vi/${this.identifier}/hqdefault.jpg`;
    }
  }

  /**
   * Gets the raw data (json) of a track.
   * @returns {RawYabokuTrack}
   */
  public getRaw(): RawYabokuTrack {
    return {
      track: this.track,
      info: {
        title: this.title,
        uri: this.uri,
        identifier: this.identifier,
        author: this.author,
        sourceName: this.sourceName,
        isSeekable: this.isSeekable,
        isStream: this.isStream,
        length: this.length,
        position: this.position,
        thumbnail: this.thumbnail,
      },
    };
  }

  /**
   * Sets the Yaboku instance.
   * @param yaboku The Yaboku instance.
   * @returns {YabokuTrack}
   */
  setYaboku(yaboku: Yaboku): YabokuTrack {
    this.yaboku = yaboku;
    if (this.sourceName === 'youtube' && this.identifier) {
      this.thumbnail = `https://img.youtube.com/vi/${this.identifier}/${
        yaboku.yabokuOptions.defaultYoutubeThumbnailResolution ?? 'hqdefault'
      }.jpg`;
    }
    return this;
  }

  /** Checks whether the track is ready to play or needs to be resolved. */
  get readyToPlay(): boolean {
    return (
      this.yaboku !== undefined &&
      !!this.track &&
      !!this.sourceName &&
      !!this.identifier &&
      !!this.author &&
      !!this.length &&
      !!this.title &&
      !!this.uri &&
      !!this.realUri
    );
  }

  /**
   * Resolves a track.
   * @param options Resolve options.
   * @returns {Promise<YabokuTrack>}
   */
  public async resolveTrack(options?: ResolveOptions): Promise<YabokuTrack> {
    if (!this.yaboku) throw new YabokuError(1, 'Yaboku instance is not set.');
    if (
      this.yaboku.yabokuOptions.trackResolver &&
      typeof this.yaboku.yabokuOptions.trackResolver === 'function' &&
      (await this.yaboku.yabokuOptions.trackResolver.bind(this)(options))
    )
      return this;

    const resolveSource =
      this.yaboku.yabokuOptions.sourceForceResolve?.includes(this.sourceName);
    const { forceResolve, overwrite } = options || {
      forceResolve: false,
      overwrite: false,
    };

    if (!forceResolve && this.readyToPlay) return this;
    if (resolveSource && this.resolvedBySource) return this;
    if (resolveSource) {
      this.resolvedBySource = true;
      return this;
    }

    const result = await this.getTrack(options?.player ?? null);
    if (!result) throw new YabokuError(2, 'No results.');

    this.track = result.track;
    this.realUri = result.info.uri;
    this.length = result.info.length;

    if (overwrite || resolveSource) {
      this.title = result.info.title;
      this.identifier = result.info.identifier;
      this.isSeekable = result.info.isSeekable;
      this.author = result.info.author;
      this.length = result.info.length;
      this.isStream = result.info.isStream;
      this.uri = result.info.uri;
    }
    return this;
  }

  private async getTrack(player: YabokuPlayer | null): Promise<Track> {
    if (!this.yaboku) throw new Error('Yaboku instance is not set.');

    const { defaultSearchEngine } = this.yaboku.yabokuOptions;
    const sources = SourceIds;
    const source =
      sources[defaultSearchEngine || sources.youtube] || sources.youtube;
    const query = [this.author, this.title].filter((x) => !!x).join(' - ');
    const node = this.yaboku.getLeastUsedNode();

    if (!node) throw new YabokuError(2, 'No nodes available.');

    const result = player
      ? await player?.search(`${source}:${query}`)
      : await node.rest.resolve(`${source}search:${query}`);
    if (!result || !result.tracks.length)
      throw new YabokuError(2, 'No results.');

    result.tracks = result.tracks.map((x) => YabokuUtil.convertTrack(x));

    if (this.author) {
      const author = [this.author, `${this.author} - Topic`];
      const officialTrack = result.tracks.find(
        (track) =>
          author.some((name) =>
            new RegExp(`^${escapeRegExp(name)}$`, 'i').test(track.info.author),
          ) ||
          new RegExp(`^${escapeRegExp(this.title)}$`, 'i').test(
            track.info.title,
          ),
      );
      if (officialTrack) return officialTrack;
    }
    if (this.length) {
      const sameDuration = result.tracks.find(
        (track) =>
          track.info.length >= (this.length ? this.length : 0) - 2000 &&
          track.info.length <= (this.length ? this.length : 0) + 2000,
      );
      if (sameDuration) return sameDuration;
    }
    return result.tracks[0];
  }
}
