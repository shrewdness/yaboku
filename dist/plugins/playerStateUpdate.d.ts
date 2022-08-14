import { Client } from 'discord.js';
import { Yaboku, YabokuPlugin } from '../structures';
export default class PlayerStateUpdatePlugin extends YabokuPlugin {
    client: Client;
    /** The Yaboku instance. */
    yaboku: Yaboku | null;
    /**
     * Initialize the plugin.
     * @param client A discord client instance.
     */
    constructor(client: Client);
    /**
     * Load the plugin.
     * @param yaboku The Yaboku instance.
     */
    load(yaboku: Yaboku): void;
    unload(): void;
    private onVoiceStateUpdate;
}
