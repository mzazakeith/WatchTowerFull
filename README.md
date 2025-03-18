# WatchTower: Enhanced Service Monitoring System

WatchTower is a modern, elegant, and powerful monitoring system for tracking the health and performance of web services, APIs, and server resources across cloud and on-premises environments. It provides detailed health metrics, customizable thresholds, real-time alerts, and advanced analytics.

## Features

- **Service Health Monitoring**: Configure checks and thresholds for various service health metrics.
- **Beautiful Modern UI**: Clean, elegant interface built with Next.js and Tailwind CSS.
- **Multi-level Alerting**: Alerts with customizable severity levels and thresholds.
- **Incident Management**: Tracking and resolution of service disruptions.
- **User Management**: Role-based access control for teams and users.
- **Passwordless Authentication**: Simple and secure login with email verification codes.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes with MongoDB
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: Passwordless via email

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB database (local or cloud)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/watchtower.git
   cd watchtower
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/watchtower
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Next.js app router pages and API routes
- `/app/(dashboard)`: Dashboard pages for authenticated users
- `/app/(auth)`: Authentication pages
- `/components`: React components
- `/lib`: Utility functions, database models, and validators

## Monitoring Capabilities

### Supported Check Types

- **HTTP/HTTPS**: Check web endpoints with customizable request parameters
- **Ping**: Simple availability check
- **TCP/UDP**: Port availability checks
- **DNS**: Domain name resolution checks
- **SSL**: Certificate validity checks
- **Custom**: Custom script checks

### Service Health Status Levels

- **Healthy**: Optimal performance
- **Degraded**: Below optimal thresholds
- **Warning**: Concerning metrics
- **Critical**: Severely impaired but responsive
- **Down**: Completely unavailable

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 