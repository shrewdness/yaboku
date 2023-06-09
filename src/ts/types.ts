type YabokuEvents =
  | 'playerCreate'
  | 'playerUpdate'
  | 'playerStateUpdate'
  | 'playerDestroy'
  | 'playerEmpty'
  | 'playerClose'
  | 'playerResumed'
  | 'trackStart'
  | 'trackEnd'
  | 'trackStuck'
  | 'trackException'
  | 'trackResolveException';

type Constructor<T> = new (...args: any[]) => T;

export { YabokuEvents, Constructor };
