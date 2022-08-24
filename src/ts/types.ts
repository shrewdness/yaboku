type YabokuEvents =
  | 'playerCreate'
  | 'playerUpdate'
  | 'playerStateUpdate'
  | 'playerDestroy'
  | 'playerEmpty'
  | 'playerClose'
  | 'trackStart'
  | 'trackEnd'
  | 'trackStuck'
  | 'trackException'
  | 'trackResolveException';

export { YabokuEvents };
