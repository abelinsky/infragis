import express from 'express';
import { currentUser } from '@infragis/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  // console.log('currentuser router called');
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
