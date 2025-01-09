import React, { useState } from 'react';
import { Container, Box, Tab, Tabs, Typography } from '@mui/material';
import ModelInput from './components/ModelInput';
import ModelOutput from './components/ModelOutput';
import { RollingForecastInputParams, ModelOutputParams } from './types/dto';

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

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [modelOutput, setModelOutput] = useState<ModelOutputParams | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleModelOutput = (output: ModelOutputParams) => {
    setModelOutput(output);
    setTabValue(1); // Switch to output tab
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Forecast Model Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Model Input" />
            <Tab label="Model Output" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ModelInput onModelOutput={handleModelOutput} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ModelOutput modelOutput={modelOutput} />
        </TabPanel>
      </Box>
    </Container>
  );
}

export default App; 