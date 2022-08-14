/* eslint-disable @typescript-eslint/no-unused-vars */
import { Yaboku, YabokuError } from '.';

export default class YabokuPlugin {
  public load(yaboku: Yaboku): void {
    throw new YabokuError(1, 'Plugin is missing implements for load().');
  }

  public unload(yaboku: Yaboku): void {
    throw new YabokuError(1, 'Plugin is missing implements for unload().');
  }
}
