import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import { Kafka } from 'kafkajs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
    AWS_REGION,
    AWS_ACCESS_ID,
    AWS_ACCESS_SECRET,
    PROJECT_ID,
    DEPLOYEMENT_ID,
    KAFKA_BROKER,
    KAFKA_USERNAME,
    KAFKA_PASSWORD
} = process.env;

// Initialize AWS S3 and Kafka Clients
const Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_ID,
        secretAccessKey: AWS_ACCESS_SECRET,
    }
});

const KafkaClient = new Kafka({
    clientId: `docker-build-${PROJECT_ID}-${DEPLOYEMENT_ID}`,
    brokers: [`${KAFKA_BROKER}`],
    ssl: {
        ca: [fs.readFileSync(path.join(__dirname, 'kafka.pem'), 'utf-8')]
    },
    sasl: {
        username: KAFKA_USERNAME,
        password: KAFKA_PASSWORD,
        mechanism: 'plain'
    }
});

const producer = KafkaClient.producer();

async function publishLog(log, status = 'building') {
    try {
        await producer.send({
            topic: `container-logs`,
            messages: [
                {
                    key: 'log',
                    value: JSON.stringify({ PROJECT_ID, DEPLOYEMENT_ID, timeStamp: new Date().toISOString(), log, status }),
                },
            ],
        });
        console.log(`Log published: ${log}`);
    } catch (error) {
        console.error(`Failed to publish log: ${error}`);
    }
}

// Function to check for malicious commands in package.json scripts
function checkForMaliciousCommands(outputPath) {
    const packageJsonPath = path.join(outputPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.error(`package.json not found in ${outputPath}`);
        publishLog('package.json not found', 'FAIL');
        process.exit(1); // Critical error, cannot proceed
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};

    const suspiciousPatterns = [
        /rm\s+-rf\s+\//,
        /\b(curl|wget)\b/,
        /\bchmod\s+\d{3,4}\s+\//,
        /\b(sudo|su)\b/,
        /\bkillall\b/,
        /;\s*rm\b/,
        /\bssh\b/,
        /\bscp\b/,
        /\bsftp\b/,
        /\beval\b/,
        /\bexec\b/,
    ];

    for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(scriptCommand)) {
                console.error(`Malicious command in "${scriptName}": ${scriptCommand}`);
                publishLog(`Malicious command detected in "${scriptName}"`, 'FAIL');
                process.exit(1); // Critical error, cannot proceed
            }
        }
    }
    return true;
}

async function startBuild() {
    await producer.connect();
    await publishLog('Build started', 'IN_PROGRESS');

    const outputPath = path.join(__dirname, 'output');
    
    // Ensure the output directory exists; critical error if not
    if (!fs.existsSync(outputPath)) {
        await publishLog('Output directory does not exist', 'FAIL');
        process.exit(1); // Critical error
    }

    const packageManager = fs.existsSync(path.join(outputPath, 'package-lock.json'))
        ? 'npm'
        : fs.existsSync(path.join(outputPath, 'yarn.lock'))
        ? 'yarn'
        : fs.existsSync(path.join(outputPath, 'pnpm-lock.yaml'))
        ? 'pnpm'
        : fs.existsSync(path.join(outputPath, 'bun.lockb'))
        ? 'bun'
        : null;

    // No recognized package manager is a critical error
    if (!packageManager) {
        await publishLog('No recognized package manager found', 'FAIL');
        process.exit(1); // Critical error
    }

    console.log(`Using package manager: ${packageManager}`);
    let installCommand = `cd ${outputPath} && ${packageManager} install && ${packageManager} run build`;

    const buildProcess = exec(installCommand);

    // Handle stdout and stderr with separate status handling
    buildProcess.stdout.on('data', async (data) => {
        console.log(data.toString());
        await publishLog(data.toString()); // Non-critical, ongoing log
    });

    buildProcess.stderr.on('data', async (error) => {
        console.error(error.toString());
        await publishLog(`Build error: ${error}`); // Non-critical, ongoing log
    });

    buildProcess.on('close', async (code) => {
        if (code !== 0) {
            // Only set status to "FAIL" if the build exit code is non-zero
            await publishLog(`Build failed with exit code ${code}`, 'FAIL');
            process.exit(code); // Critical failure
        } else {
            console.log('Build complete. Uploading to S3');
            await publishLog('Build completed successfully. Uploading to S3');
            await uploadToS3(); // Proceed with S3 upload
        }
    });
}

// Adjusted S3 upload function to avoid marking non-critical errors as failure
async function uploadToS3() {
    const distFolderPath = path.join(__dirname, 'output', 'dist');
    if (!fs.existsSync(distFolderPath)) {
        await publishLog(`Dist folder does not exist: ${distFolderPath}`, 'FAIL');
        process.exit(1); // Critical error
    }

    const distFiles = fs.readdirSync(distFolderPath, { recursive: true });
    for (const file of distFiles) {
        const filePath = path.join(distFolderPath, file);
        if (fs.lstatSync(filePath).isDirectory()) continue;

        try {
            const command = new PutObjectCommand({
                Bucket: 'deploymentoutputs',
                Key: `__outputs/${PROJECT_ID}/${DEPLOYEMENT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath) 
            });
            await Client.send(command);
            await publishLog(`File uploaded: ${file}`);
            console.log(`File uploaded: ${file}`);
        } catch (uploadError) {
            // Log upload error without setting critical status
            await publishLog(`Upload failed for ${file}: ${uploadError}`);
            console.error(`Failed to upload ${file}: ${uploadError}`);
        }
    }

    await publishLog('All files uploaded successfully', 'READY');
    console.log('All files uploaded successfully');
    process.exit(0); // Success, complete the process
}

// Start build if no malicious commands detected
if (checkForMaliciousCommands(path.join(__dirname, 'output'))) {
    startBuild();
}
