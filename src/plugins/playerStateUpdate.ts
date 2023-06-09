import { Client, VoiceState } from 'discord.js';
import { Yaboku, YabokuPlugin } from '../structures';
import { PlayerUpdateState } from '../ts/enums';

export default class PlayerStateUpdatePlugin extends YabokuPlugin {
  /** The Yaboku instance. */
  public yaboku: Yaboku | null = null;

  /**
   * Initializes the plugin.
   * @param client A discord client instance.
   */
  constructor(public client: Client) {
    super();
  }

  /**
   * Loads the plugin.
   * @param yaboku The Yaboku instance.
   */
  public load(yaboku: Yaboku): void {
    this.yaboku = yaboku;
    this.client.on('voiceStateUpdate', this.onVoiceStateUpdate.bind(this));
  }

  public unload(): void {
    this.client.removeListener(
      'voiceStateUpdate',
      this.onVoiceStateUpdate.bind(this),
    );
    this.yaboku = null;
  }

  private onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): void {
    if (!this.yaboku || oldState.id !== this.client.user?.id) return;

    const newChannelId = newState.channelId;
    const oldChannelId = oldState.channelId;
    const guildId = newState.guild.id;

    const player = this.yaboku.getPlayer(guildId);
    if (!player) return;

    let state = PlayerUpdateState.Unknown;
    if (!oldChannelId && newChannelId) state = PlayerUpdateState.Joined;
    else if (oldChannelId && !newChannelId) state = PlayerUpdateState.Left;
    else if (oldChannelId && newChannelId && oldChannelId !== newChannelId)
      state = PlayerUpdateState.Moved;

    if (state === PlayerUpdateState.Unknown) return;

    this.yaboku.emit('playerStateUpdate', player, state, {
      oldChannelId,
      newChannelId,
    });
  }
}
