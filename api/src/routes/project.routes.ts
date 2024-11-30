import { createDeployment,getDeploymentById,getDeployments,deleteDeployment } from "../controllers/deployment.controller.js";

import { getLogs } from "../controllers/logs.controller.js";
import { createProject,getProjects,getProjectById,updateProject,deleteProject } from "../controllers/project.controller.js";
import authenticateJWT from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

router.post("/:id/deployments", createDeployment);
router.get("/:id/deployments", getDeployments);
router.get("/:id/deployments/:deploymentId", getDeploymentById);
router.delete("/:id/deployments/:deploymentId", deleteDeployment);
router.get("/:id/deployments/:deploymentId/logs", getLogs);

export default router;

