# UnfoldMatch

UnfoldMatch is a progressive dating app that focuses on building relationships through a unique progression system, starting with anonymous chats and evolving through friendship and dating phases.

[![GitHub Repository](https://img.shields.io/badge/GitHub-UnfoldMatch-blue?style=flat&logo=github)](https://github.com/mayankkashyap879/unfoldmatch)

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Configuration](#configuration)
   - [Running the Application](#running-the-application)
5. [Contributing](#contributing)
6. [License](#license)

## Introduction

UnfoldMatch aims to revolutionize the online dating experience by emphasizing personality compatibility and meaningful interactions. The app features a unique progression system enhanced by interactive games at different relationship stages.

## Features

- Anonymous chat-based initial interactions
- Gradual profile reveal based on chat milestones
- Relationship progression: Anonymous Chat → Friendship → Dating
- Interactive games to enhance understanding and connection
- Compatibility-based matching without explicit filtering
- User profiles with basic info, photos, bio, interests, and personality questionnaire
- Safety features including user reporting, content moderation, and blocking options

## Technology Stack

- Frontend: Next.js (React)
- Backend: Node.js with Express
- Database: MongoDB
- Real-time communications: WebSockets (implementation details to be determined)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB (v4 or later)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/mayankkashyap879/unfoldmatch.git
   cd unfoldmatch
   ```

2. Install dependencies for both client and server
   ```
   cd client && npm install
   cd ../server && npm install
   ```

### Configuration

1. In the server directory, create a `.env` file with the following content:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

2. Replace `your_mongodb_connection_string` with your actual MongoDB connection string and `your_jwt_secret` with a secure random string.

### Running the Application

1. Start the server
   ```
   cd server
   npm run dev
   ```

2. In a new terminal, start the client
   ```
   cd client
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE.md) - see the LICENSE.md file for details.
