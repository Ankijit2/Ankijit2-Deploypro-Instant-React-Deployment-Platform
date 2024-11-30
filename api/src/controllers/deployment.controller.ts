import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../utils/prisma-client.js";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { ecsClient, config } from "../utils/ecs-client.js";
import { deleteDeploymentBuilds } from "../utils/s3-client.js";

const createDeployment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    const { id } = req.params;

    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: {
            id: id,
            userId: user.id
        }
    });

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    // Create deployment
    const deployment = await prisma.deployement.create({
        data: {
            id: uuidv4(),
            projectId: id,
            is_main:true,
            status: "QUEUED",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: process.env.ECS_SUBNETS?.split(',') || [],
                securityGroups: [process.env.ECS_SECURITY!]
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'build-task',
                    environment: [
                        { name: 'GIT_REPOSITORY_URL', value: project.gitURL },
                        { name: 'PROJECT_ID', value: id },
                        { name: 'DEPLOYEMENT_ID', value: deployment.id },
                        { name: 'AWS_ACCESS_ID', value: process.env.AWS_ACCESS_ID! },
                        { name: 'AWS_ACCESS_SECRET', value: process.env.AWS_ACCESS_SECRET! },
                        { name: 'AWS_REGION', value: process.env.AWS_REGION! },
                        { name: 'KAFKA_BROKER', value: process.env.KAFKA_BROKER! },
                        { name: 'KAFKA_USERNAME', value: process.env.KAFKA_USERNAME! },
                        { name: 'KAFKA_PASSWORD', value: process.env.KAFKA_PASSWORD! },
                        { name: 'KAFKA_CA', value: process.env.KAFKA_CA! },
                        { name: 'AWS_BUCKET_NAME', value: process.env.AWS_BUCKET_NAME!},
                        {name:'KAFKA_CA',value:process.env.KAFKA_CA!}
                    ]
                }
            ]
        }
    })

    await ecsClient.send(command)

    return res.status(201).json(
        new ApiResponse(201, deployment, "Deployment created successfully")
    );
});

const getDeployments = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    const { project_id } = req.params;

    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: {
            id: project_id,
            userId: user.id
        }
    });

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    const deployments = await prisma.deployement.findMany({
        where: {
            projectId: project_id
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return res.status(200).json(
        new ApiResponse(200, deployments, "Deployments fetched successfully")
    );
});

const getDeploymentById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    const { project_id, deployment_id } = req.params;

    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    // Verify project ownership and get deployment
    const deployment = await prisma.deployement.findFirst({
        where: {
            id: deployment_id,
            projectId: project_id,
            project: {
                userId: user.id
            }
        }
    });

    if (!deployment) {
        throw new ApiError(404, "Deployment not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, deployment, "Deployment fetched successfully")
    );
});

const deleteDeployment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    const { project_id, deployment_id } = req.params;

    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    // Verify project ownership and deployment existence
    const deployment = await prisma.deployement.findFirst({
        where: {
            id: deployment_id,
            projectId: project_id,
            project: {
                userId: user.id
            }
        }
    });

    if (!deployment) {
        throw new ApiError(404, "Deployment not found or unauthorized");
    }

    await deleteDeploymentBuilds(project_id, deployment_id)

    // Check if deployment can be deleted (e.g., not in progress)
    if (deployment.status === "IN_PROGRESS") {
        throw new ApiError(400, "Cannot delete deployment in progress");
    }

    await prisma.deployement.delete({
        where: {
            id: deployment_id
        }
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Deployment deleted successfully")
    );
});

export {
    createDeployment,
    getDeployments,
    getDeploymentById,
    deleteDeployment
};