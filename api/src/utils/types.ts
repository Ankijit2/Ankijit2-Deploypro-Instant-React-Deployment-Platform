import z from 'zod'
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