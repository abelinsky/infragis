export interface StoredSnapshot<T = any> {
  aggregateId: string;
  version: number;
  data: T;
}
