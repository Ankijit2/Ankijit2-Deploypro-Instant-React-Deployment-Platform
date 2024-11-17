import express, { Request, Response } from 'express';
import httpProxy from 'http-proxy';
import { prisma } from './utils/prisma-client';

const app = express();
const PORT = 8000;

const BASE_PATH = process.env.BASE_PATH;

const proxy = httpProxy.createProxy();

app.use(async (req: Request, res: Response): Promise<any> => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];
    
    const project = await prisma.project.findUnique({
        where: { subDomain: subdomain },
        select: { id: true }
    });

    const projectId = project?.id;
    const mainDeployment = await prisma.deployement.findFirst({
        where: { projectId, is_main: true },
        select: { id: true }
    });

    const deploymentId = mainDeployment?.id;
    if (!projectId || !deploymentId) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const resolvesTo = `${BASE_PATH}/${projectId}/${deploymentId}`;
    
    proxy.web(req, res, { target: resolvesTo, changeOrigin: true }, (err) => {
        if (err) {
            console.error('Proxy error:', err);
            res.status(502).json({ error: 'Failed to connect to target' });
        }
    });
});

proxy.on('proxyReq', (proxyReq, req) => {
    if (req.url === '/') {
        proxyReq.path += 'index.html';
    }
});

app.listen(PORT, () => console.log(`Reverse Proxy Running on port ${PORT}`));
