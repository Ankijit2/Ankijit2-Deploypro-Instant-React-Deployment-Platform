import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../utils/prisma-client.js";
import { Request, Response } from "express";
import { generateSlug } from "random-word-slugs";
import { ProjectSchema } from "../utils/types.js";
import { deleteProjectBuilds } from "../utils/s3-client.js";
import z from 'zod'

const createProject = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    const safeParsedData = ProjectSchema.safeParse(req.body);
    if (!safeParsedData.success) {
        throw new ApiError(400, "Invalid input data", safeParsedData.error.errors);
    }

    const project = await prisma.project.create({
        data: {
            name: safeParsedData.data.name,
            gitURL: safeParsedData.data.gitURL,
            subDomain: generateSlug(),
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    return res.status(201).json(
        new ApiResponse(201, project, "Project created successfully")
    );
});

const getProjects = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    const { id } = req.query;

    const projects = await prisma.project.findMany({
        where: {
            userId: user.id,
            ...(id && { id: String(id) }),
        },
        include: {
            Deployement: true
        }
    });

    return res.status(200).json(
        new ApiResponse(200, projects, "Projects fetched successfully")
    );
});

const updateProject = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Project ID is required");
    }
    const {name} =req.body
    const validateSchema = z.string().min(3, "Name should be at least 3 characters long.")
    .max(50, "Name should be no longer than 50 characters.")

    const safeParsedData = validateSchema.safeParse(name);
    if (!safeParsedData.success) {
        throw new ApiError(400, "Invalid input data", safeParsedData.error.errors);
    }

    // Verify project ownership
    const existingProject = await prisma.project.findFirst({
        where: {
            id,
            userId: user.id
        }
    });

    if (!existingProject) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    const project = await prisma.project.update({
        where: {
            id,
        },
        data: {
            name: safeParsedData.data,
            updatedAt: new Date(),
        },
    });

    return res.status(200).json(
        new ApiResponse(200, project, "Project updated successfully")
    );
});

const deleteProject = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Project ID is required");
    }

    // Verify project ownership
    const existingProject = await prisma.project.findFirst({
        where: {
            id,
            userId: user.id
        }
    });


    if (!existingProject) {
        throw new ApiError(404, "Project not found or unauthorized");
    }
    await deleteProjectBuilds(id)


    const project = await prisma.project.delete({
        where: {
            id,
        },
    });


    return res.status(200).json(
        new ApiResponse(200, project, "Project deleted successfully")
    );
});

const getProjectById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const user = req.session;
    const { id } = req.params;

    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (!id) {
        throw new ApiError(400, "Project ID is required");
    }

    const project = await prisma.project.findFirst({
        where: {
            id,
            userId: user.id
        },
        include: {
            Deployement: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5 // Get last 5 deployments
            }
        }
    });

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, project, "Project fetched successfully")
    );
});

export {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};