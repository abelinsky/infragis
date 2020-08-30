import { decorate, injectable } from 'inversify';
import { Subject, Observable } from 'rxjs';

export const decorateThirdPartyClasses = (): void => {
  decorate(injectable(), Subject);
  decorate(injectable(), Observable);
};
