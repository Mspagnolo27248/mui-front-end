# Forecast Model Frontend

A React-based frontend application for interacting with the Forecast Model API.

## Features

- Load existing forecast models
- Save new forecast models
- Run forecast calculations
- View detailed model outputs in a tabular format

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API URL:
```
REACT_APP_API_URL=http://localhost:3001
```

## Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Project Structure

```
src/
  ├── components/          # React components
  │   ├── ModelInput.tsx  # Model input form
  │   └── ModelOutput.tsx # Model results display
  ├── services/           # API services
  │   └── api.ts         # API client
  ├── types/              # TypeScript types
  │   └── dto.ts         # Data transfer objects
  ├── App.tsx            # Main application component
  └── index.tsx          # Application entry point
```

## API Integration

The frontend integrates with three main API endpoints:

- `POST /forecast-model/save/:id?` - Save a model
- `POST /forecast-model/load/:id` - Load an existing model
- `POST /forecast-model/run` - Run model calculations

## Usage

1. **Loading a Model**
   - Enter the model ID in the input field
   - Click "Load Model" to retrieve the model data

2. **Saving a Model**
   - Load or create a model
   - Click "Save Model" to persist the changes
   - The model ID will be updated if a new model is created

3. **Running Calculations**
   - Load a model
   - Click "Run Model" to execute calculations
   - Results will be displayed in the output tab 