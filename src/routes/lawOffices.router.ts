import { Router, json } from "express";

import { lawOfficesController } from "../controllers/lawOffices.controller";

export const lawOfficesRouter = Router();

lawOfficesRouter.use(json());

lawOfficesRouter.get("/", lawOfficesController.getAllLawOffices);
lawOfficesRouter.get("/:id", lawOfficesController.getLawOfficeById);
lawOfficesRouter.get(
    "/law-office/email-callback/approved/:hashId",
    lawOfficesController.updateLawOfficeAfterEmailCallback
);
lawOfficesRouter.get("/:id", lawOfficesController.getLawOfficeById);
lawOfficesRouter.get(
    "/law-office/hash/:hashId",
    lawOfficesController.getLawOfficeByHashId
);

lawOfficesRouter.post("/", lawOfficesController.createLawOffice);

lawOfficesRouter.put("/law-office/:id", lawOfficesController.updateLawOffice);

lawOfficesRouter.delete("/:id", lawOfficesController.deleteLawOffice);
