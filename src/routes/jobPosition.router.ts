import { Router, json } from "express";
import { jobPositionController } from "../controllers/jobPosition.contoller";

export const jobPositionRouter = Router();

jobPositionRouter.use(json());

jobPositionRouter.get("/all", jobPositionController.getAllJobsPosition);
jobPositionRouter.get("/:id", jobPositionController.getJobDetail);
jobPositionRouter.get(
    "/hash/:hashId",
    jobPositionController.getJobDetailByHashId
);
jobPositionRouter.get(
    "/email-callback/approved/:hashId",
    jobPositionController.approveJobPositionAfterEmailCallback
);

jobPositionRouter.get(
    "/email-callback/delete/:hashId",
    jobPositionController.deleteJobPositionAfterEmailCallback
);

jobPositionRouter.post("/", jobPositionController.createJobPosition);
jobPositionRouter.put("/:id", jobPositionController.updateJobPosition);
