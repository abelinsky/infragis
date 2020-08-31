import { decorate, injectable } from 'inversify';

/**
 * Job that performs a task and finishes it's execution.
 */
@injectable()
export abstract class Job {
  abstract readonly name: string;
  /**
   * Executes a Job.
   * @returns Result of the execution.
   */
  abstract execute(): Promise<boolean>;
}

/**
 * Decorator for {@link Job}.
 */

export const JOBS_METADATA = '__JobsList___';

export const ApplicationJob = () => {
  return function ApplicationJobDecorator<T extends new (...args: any[]) => any>(target: T) {
    if (!(target.prototype instanceof Job)) {
      throw new Error(
        '@ApplicationJob descorator can only be applied to Job class.' +
          `But ${target} does not extend it.`
      );
    }

    decorate(injectable(), target);

    // We need to create an array that contains all `jobs`
    // in the application, the metadata cannot be
    // attached to a particular job. It needs to be attached to a global.
    // We attach metadata to the Reflect object itself to avoid
    // declaring additonal globals. Also, the Reflect is avaiable
    // in both node and web browsers.
    const previousData = Reflect.getMetadata(JOBS_METADATA, Reflect) || [];
    const newData = [target, ...previousData];
    Reflect.defineMetadata(JOBS_METADATA, newData, Reflect);
  };
};

export function getJobCtrsFromMetadata<T extends Job>(): Array<new () => T> {
  return Reflect.getMetadata(JOBS_METADATA, Reflect) || [];
}
