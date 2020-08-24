import { injectable } from 'inversify';

@injectable()
export class InMemoryStore {
  documents: Record<string, any> = {};

  get(key: string): any {
    return this.documents[key];
  }

  set(key: string, value: any): void {
    this.documents = { ...this.documents, [key]: value };
  }
}
