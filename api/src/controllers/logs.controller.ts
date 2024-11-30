import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { client } from "../utils/clickhouse-client.js";
import { prisma } from "../utils/prisma-client.js";


const getLogs = asyncHandler(async (req: Request, res: Response): Promise<any> => {{
    const  user=req.session
    if (!user?.id) {
        throw new ApiError(401, "Unauthorized access");
    }
    const deploymentId= req.params.deploymentId;
    const projectId = req.params.id

  

   
    if(!deploymentId || !projectId) {
        throw new ApiError(400, "Deployment ID and projectId is required");
    }
    const validateDeployment = await prisma.deployement.findFirst({
        where: {
            id: deploymentId,
            projectId: projectId,
            project: {
                userId: user.id
            }
        },
        include: {
            project: true
        }
    });

    if (!validateDeployment) {
        throw new ApiError(404, "Deployment not found or unauthorized access");
    }
    
        const logs = await client.query({
            query: 
            `SELECT 
                event_id, 
                deployment_id, 
                log, 
                timestamp 
            FROM log_events 
            WHERE deployment_id = {deployment_id:String}
            ORDER BY timestamp ASC`,
            query_params: {
                deployment_id: 'aa1d3e05-3363-4288-9a8f-cc5b105a78bf',
            },
            format: 'JSONEachRow',
        });

        const rawLogs = await logs.json();
      
        return res.status(200).json(new ApiResponse(200, rawLogs, "Logs fetched successfully"));
    
}})

export { getLogs };
