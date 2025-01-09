import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { ForecastModelAPI } from '../services/api';
import { RollingForecastInputParams, ModelOutputParams } from '../types/dto';
import ModelEditor from './ModelEditor';

interface ModelInputProps {
  onModelOutput: (output: ModelOutputParams) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ModelInput: React.FC<ModelInputProps> = ({ onModelOutput }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string>('');
  const [modelData, setModelData] = useState<RollingForecastInputParams | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLoadModel = async () => {
    if (!modelId) {
      setError('Please enter a model ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ForecastModelAPI.loadModel(modelId);
      console.log('Loaded model data:', data);
      setModelData(data);
      setTabValue(1); // Switch to editor tab after loading
    } catch (err) {
      console.error('Load model error:', err);
      setError('Failed to load model');
    } finally {
      setLoading(false);
    }
  };

  const handleRunModel = async () => {
    if (!modelData) {
      setError('Please load a model first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Running model with data:', modelData);
      const output = await ForecastModelAPI.runModel(modelData);
      console.log('Received model output:', output);
      
      if (!output || (!(output as any).Output && !(output as any).Outputs)) {
        throw new Error('Invalid output format received');
      }
      onModelOutput(output);
    } catch (err) {
      console.error('Run model error:', err);
      setError('Failed to run model');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModel = async () => {
    if (!modelData) {
      setError('No model data to save');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ForecastModelAPI.saveModel(modelId, modelData);
      setModelId(result.id);
    } catch (err) {
      console.error('Save model error:', err);
      setError('Failed to save model');
    } finally {
      setLoading(false);
    }
  };

  const handleModelUpdate = (updatedModel: RollingForecastInputParams) => {
    setModelData(updatedModel);
  };

  return (
    <Paper elevation={3}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Model Controls
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Model ID"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={handleLoadModel}
                disabled={loading || !modelId}
              >
                Load Model
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveModel}
                disabled={loading || !modelData}
              >
                Save Model
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunModel}
                disabled={loading || !modelData}
              >
                Run Model
              </Button>
            </Box>
          </Grid>

          {loading && (
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          )}

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {modelData && (
            <Grid item xs={12}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Preview" />
                  <Tab label="Edit" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Paper variant="outlined">
                  <Box p={2}>
                    <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
                      {JSON.stringify(modelData, null, 2)}
                    </pre>
                  </Box>
                </Paper>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <ModelEditor 
                  modelData={modelData} 
                  onModelUpdate={handleModelUpdate}
                />
              </TabPanel>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
};

export default ModelInput; 