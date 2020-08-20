export class StreamVersion {
  protected constructor(private version: number) {}

  static start(): StreamVersion {
    return new StreamVersion(0);
  }

  static from(num: number): StreamVersion {
    return new StreamVersion(num);
  }

  next(): void {
    this.version++;
  }

  toNumber(): number {
    return this.version;
  }

  copy(): StreamVersion {
    return StreamVersion.from(this.version);
  }
}
