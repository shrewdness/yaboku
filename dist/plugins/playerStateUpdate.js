"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const structures_1 = require("../structures");
const enums_1 = require("../ts/enums");
class PlayerStateUpdatePlugin extends structures_1.YabokuPlugin {
    client;
    /** The Yaboku instance. */
    yaboku = null;
    /**
     * Initialize the plugin.
     * @param client A discord client instance.
     */
    constructor(client) {
        super();
        this.client = client;
    }
    /**
     * Load the plugin.
     * @param yaboku The Yaboku instance.
     */
    load(yaboku) {
        this.yaboku = yaboku;
        this.client.on('voiceStateUpdate', this.onVoiceStateUpdate.bind(this));
    }
    unload() {
        this.client.removeListener('voiceStateUpdate', this.onVoiceStateUpdate.bind(this));
        this.yaboku = null;
    }
    onVoiceStateUpdate(oldState, newState) {
        if (!this.yaboku || oldState.id !== this.client.user?.id)
            return;
        const newChannelId = newState.channelId;
        const oldChannelId = oldState.channelId;
        const guildId = newState.guild.id;
        const player = this.yaboku.players.get(guildId);
        if (!player)
            return;
        let state = enums_1.PlayerUpdateState.Unknown;
        if (!oldChannelId && newChannelId)
            state = enums_1.PlayerUpdateState.Joined;
        else if (oldChannelId && !newChannelId)
            state = enums_1.PlayerUpdateState.Left;
        else if (oldChannelId && newChannelId && oldChannelId !== newChannelId)
            state = enums_1.PlayerUpdateState.Moved;
        if (state === enums_1.PlayerUpdateState.Unknown)
            return;
        this.yaboku.emit(enums_1.YabokuEvents.PlayerStateUpdate, player, state, {
            oldChannelId,
            newChannelId,
        });
    }
}
exports.default = PlayerStateUpdatePlugin;
