# SunbulaFrontEnd

This project is the frontend for the Sunbula Graduation Project.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher is recommended)
- **npm** (comes with Node.js)

To validate your Node.js and npm installation, run the following commands in your terminal:

```bash
node -v
npm -v
```
Both commands should output the respective version numbers.

## Installation

### 1. Install Angular CLI Globally

If you don't have the Angular CLI installed on your machine, you need to install it globally. Run the following command:

```bash
npm install -g @angular/cli
```

To verify the installation, run:

```bash
ng version
```

### 2. Install Project Dependencies

Navigate to the root directory of the project (`SunbulaFrontEnd`) and run the following command to install all required dependencies:

```bash
npm install
```
*(or `npm i` for short)*

## Running the Application

To start a local development server, run:

```bash
ng s --o 
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Additional Commands

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running unit tests


