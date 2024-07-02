import { Router } from "express";

import { identify } from "../controllers/contact.controller";
import { validateContactInput } from "../validators/validateContactInput.validator";

const apiRouter: Router = Router();

apiRouter.post("/", validateContactInput, identify);

export default apiRouter;
