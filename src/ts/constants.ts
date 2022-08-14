const SourceIds = {
  youtube: 'yt',
  youtube_music: 'ytm',
  soundcloud: 'sc',
};

const SupportedSources = [
  'bandcamp',
  'beam',
  'getyarn',
  'http',
  'local',
  'nico',
  'soundcloud',
  'stream',
  'twitch',
  'vimeo',
  'youtube',
];

const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export { SourceIds, SupportedSources, escapeRegExp };
