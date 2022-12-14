export default class YabokuError extends Error {
  public code: number;

  public message: string;

  public constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
