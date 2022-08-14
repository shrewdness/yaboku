# Yaboku

#### A [Shoukaku](https://github.com/Deivu/Shoukaku) wrapper with built-in queue system. (A [Kazagumo](https://github.com/Takiyo0/Shoukaku) fork.)

## Features:

- Built-in queue system.
- Easy to use.
- Plugin system, with ability to create custom plugins.
- Uses the latest Shoukaku version.

## Documentation

- [Yaboku documentation](https://shrewdness.github.io/yaboku/)
- [Shoukaku documentation](https://deivu.github.io/Shoukaku/)

## Installation

> Install using npm

```
npm install --save @shrewdness/yaboku
```

> Install using yarn

```
yarn add @shrewdness/yaboku
```

> Install using pnpm

```
pnpm add @shrewdness/yaboku
```

## Basic usage:

```typescript
// Creating a player.
<Yaboku>.createPlayer(...)

// Getting an existing player.
<Yaboku>.players.get(guildId);

// Searching tracks.
<YabokuPlayer>.search('KANA-BOON - Silhouette');

// Adding track/tracks to the queue.
// (Each track must be be an instance of YabokuTrack.
//  Search results are automatically YabokuTracks.)
<YabokuPlayer>.queue.add(track|track[]);

// Starting the player. (play the first track in the queue)
<YabokuPlayer>.play();
```

## Example bot written in typescript, using Discord.js v14

```typescript
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { Connectors } from 'shoukaku';
import {
  SearchEngines,
  SearchResult,
  Yaboku,
  YabokuEvents,
  YabokuPlayer,
  YabokuTrack,
} from '@shrewdness/yaboku';

const nodes = [
  {
    name: 'Node 1',
    url: 'localhost:2333',
    auth: 'password',
    secure: false,
  },
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const yaboku = new Yaboku(
  {
    defaultSearchEngine: SearchEngines.YouTube,
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  nodes,
);

yaboku.shoukaku.on('ready', (nodeName) =>
  console.log(`Node ${nodeName} ready.`),
);

yaboku.on(
  YabokuEvents.TrackStart,
  (player: YabokuPlayer, track: YabokuTrack) => {
    const channel = client.channels.cache.get(
      player.textChannelId,
    ) as TextChannel;
    if (channel) {
      channel
        .send({ content: `Now playing: ${track.title}` })
        .catch((err) => console.log(err));
    }
  },
);

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  console.log(msg.content);

  if (msg.content.startsWith('!play')) {
    const args = msg.content.split(' ');
    const query = args.slice(1).join(' ');

    const channel = msg.member?.voice.channel;
    if (!channel) {
      await msg.reply('ya aint in a voice channel');
      return;
    }

    const player = await yaboku.createPlayer({
      guildId: msg.guild?.id as string,
      textChannelId: msg.channel.id,
      voiceChannelId: channel?.id,
      selfDeafen: true,
    });

    const result = await yaboku.search(query, {
      requester: msg.author,
      engine: SearchEngines.YouTube,
    });

    if (!result.tracks.length) {
      await msg.reply('no results');
      return;
    }
    if (result.type === SearchResult.Playlist) {
      for (let index = 0; index < result.tracks.length; index += 1) {
        player.queue.add(result.tracks[index]);
      }
    } else {
      player.queue.add(result.tracks[0]);
    }
    if (!player.playing && !player.paused)
      player.play().catch((err) => console.log(err));
    await msg.reply({
      content:
        result.type === SearchResult.Playlist
          ? `Queued ${result.tracks.length} tracks from ${
              result.playlistName as string
            }`
          : `Queued ${result.tracks[0].title}`,
    });
  }
});

client.login('').catch((err) => console.log(err));
```
