export class Timestamp {
  protected constructor(private readonly date: string) {}

  static now(): Timestamp {
    return new Timestamp(new Date().toISOString())
  }

  static fromString(isoDate: string):
      Timestamp{return new Timestamp(new Date(isoDate).toISOString())}

  toString(): string {
    return this.date;
  }
}