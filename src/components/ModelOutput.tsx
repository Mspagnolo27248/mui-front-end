import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import { ModelOutputParams } from '../types/dto';

interface ModelOutputProps {
  modelOutput: ModelOutputParams | null;
}

const ModelOutput: React.FC<ModelOutputProps> = ({ modelOutput }) => {
  useEffect(() => {
    console.log('ModelOutput received:', modelOutput);
  }, [modelOutput]);

  if (!modelOutput) {
    console.log('No model output available');
    return (
      <Alert severity="info">
        No model output available. Please run a model first.
      </Alert>
    );
  }

  // Handle both "Output" and "Outputs" property names
  const outputData = (modelOutput as any).Output || (modelOutput as any).Outputs;

  if (!outputData) {
    console.log('No output data found in model');
    return (
      <Alert severity="info">
        No output data found in model response.
      </Alert>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Type guard to ensure dateData is the correct type
  const isValidDateData = (data: any): data is Record<string, any[]> => {
    return data && typeof data === 'object';
  };

  return (
    <Paper elevation={3}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Model Results
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Model ID: {modelOutput.ModelMetaData?.uid || 'N/A'}
        </Typography>

        {Object.entries(outputData).map(([product, dateData]) => {
          console.log('Rendering product:', product, 'with data:', dateData);
          if (!isValidDateData(dateData)) {
            console.log('Invalid date data for product:', product);
            return null;
          }

          return (
            <Box key={product} mt={3}>
              <Typography variant="h6" gutterBottom>
                Product: {product}
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Opening Inventory</TableCell>
                      <TableCell align="right">Receipts</TableCell>
                      <TableCell align="right">Production In</TableCell>
                      <TableCell align="right">Production Out</TableCell>
                      <TableCell align="right">Open Orders</TableCell>
                      <TableCell align="right">Demand Forecast</TableCell>
                      <TableCell align="right">Blend Requirements</TableCell>
                      <TableCell align="right">Ending Inventory</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(dateData).map(([date, items]) => {
                      console.log('Rendering date:', date, 'with items:', items);
                      return (Array.isArray(items) ? items : []).map((item, index) => (
                        <TableRow key={`${date}-${index}`}>
                          <TableCell>{date}</TableCell>
                          <TableCell align="right">{formatNumber(item?.OpenInventory || 0)}</TableCell>
                          <TableCell align="right">{formatNumber(item?.Receipts || 0)}</TableCell>
                          <TableCell align="right">{formatNumber(item?.ProductionIn || 0)}</TableCell>
                          <TableCell align="right">{formatNumber(item?.ProductionOut || 0)}</TableCell>
                          <TableCell align="right">{formatNumber(item?.OpenOrders || 0)}</TableCell>
                          <TableCell align="right">{formatNumber(item?.DemandForecast || 0)}</TableCell>
                          <TableCell align="right">{formatNumber(item?.BlendRequirements || 0)}</TableCell>
                          <TableCell align="right">{formatNumber(item?.EndingInventory || 0)}</TableCell>
                        </TableRow>
                      ));
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default ModelOutput; 