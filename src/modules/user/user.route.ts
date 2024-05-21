import { Router, Request, Response } from 'express';

const userRouter = Router();

// Users routes
userRouter.get('/', (req: Request, res: Response) => {
  res.send('Users route!');
});

userRouter.get('/:id', (req: Request, res: Response) => {
  res.send(`User ${req.params.id} route!`);
});

export default userRouter;
