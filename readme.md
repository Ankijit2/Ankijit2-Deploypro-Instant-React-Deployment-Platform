# DeployPro - Instant React Deployment Platform 🚀

**DeployPro** is a cutting-edge platform designed to streamline the deployment of React applications. It offers an automated, scalable, and secure solution for building, hosting, and serving static assets with real-time updates.



## 📺 Tutorial Video

Watch the tutorial 

<video controls width="100%" height="auto">
  <source src="./deploypro.mp4" type="video/mp4">
  
</video>


## 🛠️ Tech Stack

### **Core Technologies**
- **Next.js**: Framework for the client-side and server-side rendering.
- **NextAuth**: User authentication.
- **shadcn/ui**: Elegant and customizable UI components.
- **TypeScript**: Type-safe and scalable codebase.
- **Zod**: Schema validation and type checking.
- **PostgreSQL**: Database for managing project data.
- **Kafka**: Log streaming and message queuing.
- **ClickHouse**: High-performance log storage and analytics.
- **AWS S3**: Static asset storage.
- **CloudFront**: CDN for serving assets globally.
- **Socket.IO**: Real-time communication.
- **Prisma**: ORM for interacting with PostgreSQL.
- **Docker**: Containerization for isolated environments.
- **http-proxy**: managing the proxy server

---

## 📋 Components

### 1. **Client**
- **Frontend** built with Next.js and styled using shadcn/ui.
- Provides an intuitive interface for managing projects, viewing logs, and monitoring deployment status.

### 2. **API**
- Handles project creation, build initiation, and log management.
- Triggers Docker containers to run the build process, 
- Logs from the container are streamed via **Kafka** and stored in **ClickHouse** for real-time monitoring.

### 3. **Proxy**
- Acts as an HTTP proxy to serve deployed projects.
- Workflow:
  1. Matches incoming subdomain requests with project records in **PostgreSQL**.
  2. Fetches the corresponding HTML, CSS, and JS files from **AWS S3**.
  3. Serves the assets via **CloudFront**, ensuring fast and reliable delivery.

### 4. **Build**
- A Dockerized build system that:
- Runs user projects in isolated containers.
 -  Automatically identifies and installs project dependencies.
  - Detects and blocks malicious commands in build scripts.
  - Builds the project and uploads the generated assets (HTML, CSS, JS) to an **S3 bucket**.
  - Logs build processes and errors for debugging.


---

## 📂 Project Workflow

1. **Project Creation**
   - Users create a new project via the frontend.
   - The backend generates a unique subdomain for the project and stores metadata in **PostgreSQL**.

2. **Build Process**
   - The API triggers a Docker container to build the project.
   - After a successful build:
     - Static assets are uploaded to **S3**.
     - The subdomain mapping is updated in **PostgreSQL**.

3. **Serving the Application**
   - When a user visits the subdomain:
     - The **Proxy** checks the subdomain against the database.
     - Fetches the assets from **S3**.
     - Serves them to the user via **CloudFront**.

4. **Real-Time Monitoring**
   - Logs from the build process are streamed using **Kafka**.
   - Logs are stored in **ClickHouse** and visualized in the frontend for real-time monitoring.

---

## 🌟 Features

### **Frontend**
- Responsive, user-friendly interface with type-safe code.
- Real-time updates on build and deployment status.

### **Backend**
- Automated build and deployment pipeline with security checks.
- Efficient log management and analytics using Kafka and ClickHouse.

### **Proxy**
- Seamless mapping of subdomains to projects.
- Fast and secure delivery of static assets using S3 and CloudFront.

### **Build System**
- Dockerized builds for consistent environments.
- Automated dependency management and malicious script detection.

---


---

## 📞 Support

For any questions or support, feel free to reach out to [ankijitroy15@gmail.com](mailto:ankijitroy15@gmail.com).
