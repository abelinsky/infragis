import { Router } from 'express';
import { adaptRoute } from '@/main/adapters/express-route-adapter';
import { createSignUpController } from '@/main/factories/controllers/signup-contoller-factory';

export default (router: Router): void => {
  router.post('/users/signup', adaptRoute(createSignUpController()));
};
