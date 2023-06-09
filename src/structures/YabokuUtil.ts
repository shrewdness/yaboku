import type { Track } from 'shoukaku';
import type YabokuTrack from './YabokuTrack';

export default class YabokuUtil {
  static convertTrack(track: YabokuTrack | Track): Track {
    if ((track as Track).info) return track as Track;
    track = track as YabokuTrack;
    return {
      track: track.track,
      info: {
        isSeekable: track.isSeekable,
        isStream: track.isStream,
        title: track.title,
        uri: track.uri,
        identifier: track.identifier,
        sourceName: track.sourceName,
        author: track.author ?? '',
        length: track.length ?? 0,
        position: track.position ?? 0,
      },
    };
  }
}
