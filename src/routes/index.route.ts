import { Router } from "express";

import { identify } from "../controllers/contact.controller";

const apiRouter: Router = Router();

apiRouter.post("/", identify);

export default apiRouter;
