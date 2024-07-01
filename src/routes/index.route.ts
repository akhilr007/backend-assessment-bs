import { Router } from "express";

import { identity } from "../controllers/contact.controller";

const apiRouter: Router = Router();

apiRouter.get("/", identity);

export default apiRouter;
