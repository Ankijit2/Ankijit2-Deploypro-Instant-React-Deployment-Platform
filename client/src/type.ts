import { z } from "zod";
import { Prisma } from "@prisma/client";

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const SignupSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});


const gitCloneURLPattern = /^https:\/\/(github|gitlab|bitbucket)\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\.git)?$/;

// Update ProjectSchema with checks for `gitURL` and `name`
export const ProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Name should be at least 3 characters long.")
    .max(50, "Name should be no longer than 50 characters."),

  gitURL: z
    .string()
    .refine((url) => gitCloneURLPattern.test(url), {
      message: "Invalid Git clone URL. URL must be a valid GitHub, GitLab, or Bitbucket clone link.",
    }),
});
  export const ProjectWithDeployment = Prisma.validator<Prisma.ProjectDefaultArgs>()({
    include: { Deployement: true }
});

export type ProjectWithDeployment = Prisma.ProjectGetPayload<typeof ProjectWithDeployment>;


export type logEntry = {
  event_id: string
  deployment_id: string;
  log: string;
  timestamp: Date;
  project_id: string;
  status: string
  
}

