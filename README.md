
# CarrotView 🥕

> **Stop Watching. Start Knowing.**

CarrotView is an AI-powered video intelligence platform that transforms how businesses monitor and analyze video footage. Using advanced computer vision and AI technology, we help organizations maintain compliance, ensure safety, track attendance, and resolve conflicts—all without the need to manually watch hours of video.

## 🚀 What We Do

- **Smart Safety & Compliance Monitoring**: Automatically detect safety violations and compliance issues in real-time
- **Time Intelligence**: Save countless hours with instant AI video analysis—get insights in seconds, not days  
- **Automated Attendance Tracking**: Accurate monitoring without manual checks for education, corporate, and events
- **AI-Powered Conflict Resolution**: Quickly resolve disputes with objective, AI-analyzed evidence

## 📊 Results That Matter

- **95% Time Saved** on video review processes
- **24/7 Monitoring** capabilities
- **Real-time Detection** of critical events
- **Objective Evidence** for dispute resolution

## Project info

**URL**: https://carrotview.com

## How can I edit this code?

This is being done through the GitHub 

## 🛠️ Development Setup

### Prerequisites & Isolation
This project uses **local dependency management** - no global installations needed!

**Option 1: Using nvm (Recommended for isolation)**
```sh
# Install nvm (Windows)
winget install CoreyButler.NVMforWindows
# OR on macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use project Node version (reads .nvmrc)
nvm use
# OR install specific version
nvm install 18.19.0 && nvm use 18.19.0
```

**Option 2: Direct Node.js**
- **Node.js** v18.19.0+ - [Download](https://nodejs.org/)

### Package Manager
Choose **one** (we recommend Bun for speed):
- **Bun** - `npm install -g bun` 
- **npm** - comes with Node.js

### Getting Started (Isolated Environment)

**Quick setup (recommended):**
```sh
# Windows
./setup.bat

# macOS/Linux  
chmod +x setup.sh && ./setup.sh
```

**Manual setup:**
```sh
# 1. Clone & navigate
git clone https://github.com/carrotview/carrotview.github.io.git
cd carrotview.github.io

# 2. Use correct Node version (with nvm)
nvm use  # reads .nvmrc automatically

# 3. Install dependencies (LOCAL to this project)
bun install     # creates local node_modules/
# OR
npm install

# 4. Start development (runs on localhost:8080)
bun dev
# OR  
npm run dev
```

### Why This Approach Works
✅ **Dependencies isolated** - stored in local `node_modules/`  
✅ **No global pollution** - each project has its own deps  
✅ **Version consistency** - `.nvmrc` ensures same Node version  
✅ **Lock files** - `bun.lockb` ensures exact dependency versions

### Available Scripts
- `bun dev` / `npm run dev` - Start development server (http://localhost:8080)
- `bun build` / `npm run build` - Build for production  
- `bun build:dev` / `npm run build:dev` - Build in development mode
- `bun lint` / `npm run lint` - Run ESLint
- `bun preview` / `npm run preview` - Preview production build locally

### Troubleshooting Isolation Issues

**Problem**: Global package conflicts  
**Solution**: Use nvm to switch Node versions per project

**Problem**: Different dependency versions  
**Solution**: Delete `node_modules` and reinstall

```sh
# Clean slate (when having issues)
rm -rf node_modules bun.lockb  # or package-lock.json
nvm use                        # ensure correct Node version  
bun install                    # reinstall dependencies
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Hero.tsx        # Landing page hero section
│   ├── Features.tsx    # Features showcase
│   └── ...
├── pages/              # Route components
│   ├── Index.tsx       # Homepage
│   └── NotFound.tsx    # 404 page
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open GitHub Actions in the repo and run a job.

