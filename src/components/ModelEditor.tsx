import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { RollingForecastInputParams, ProductsForModelItem, ScheduleItem } from '../types/dto';

interface ModelEditorProps {
  modelData: RollingForecastInputParams;
  onModelUpdate: (updatedModel: RollingForecastInputParams) => void;
}

interface ScheduleMatrixItem {
  Unit: string;
  Charge_ProductCode: string;
  dates: { [key: string]: number };
}

interface ScheduleData {
  [unit: string]: {
    [product: string]: {
      [date: string]: number;
    };
  };
}

const ModelEditor: React.FC<ModelEditorProps> = ({ modelData, onModelUpdate }) => {
  const [localModel, setLocalModel] = useState<RollingForecastInputParams>(modelData);
  const [scheduleMatrix, setScheduleMatrix] = useState<ScheduleMatrixItem[]>([]);

  useEffect(() => {
    setLocalModel(modelData);
    convertScheduleToMatrix(modelData.ScheduleItem || []);
  }, [modelData]);

  const convertScheduleToMatrix = (scheduleItems: any) => {
    const matrix: { [key: string]: ScheduleMatrixItem } = {};
    
    // Handle the nested structure: unit -> product -> dates
    if (scheduleItems && typeof scheduleItems === 'object') {
      // Iterate over units (CRUDE, EXTRACT, etc.)
      Object.entries(scheduleItems).forEach(([unit, products]) => {
        // Iterate over products for each unit
        Object.entries(products as object).forEach(([product, dates]) => {
          const key = `${unit}-${product}`;
          if (!matrix[key]) {
            matrix[key] = {
              Unit: unit,
              Charge_ProductCode: product,
              dates: {}
            };
          }
          // Add all dates for this unit-product combination
          Object.entries(dates as object).forEach(([date, bbls]) => {
            if (typeof bbls === 'number') {
              matrix[key].dates[date] = bbls;
            }
          });
        });
      });
    }

    setScheduleMatrix(Object.values(matrix));
  };

  const convertMatrixToSchedule = (matrix: ScheduleMatrixItem[]): any => {
    const schedule: any = {};
    
    matrix.forEach(row => {
      // Initialize unit if it doesn't exist
      if (!schedule[row.Unit]) {
        schedule[row.Unit] = {};
      }
      
      // Initialize product if it doesn't exist
      if (!schedule[row.Unit][row.Charge_ProductCode]) {
        schedule[row.Unit][row.Charge_ProductCode] = {};
      }
      
      // Add all non-zero values for dates
      Object.entries(row.dates).forEach(([date, bbls]) => {
        if (bbls > 0) {
          schedule[row.Unit][row.Charge_ProductCode][date] = bbls;
        }
      });
    });

    return schedule;
  };

  const handleScheduleMatrixChange = (rowIndex: number, date: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMatrix = [...scheduleMatrix];
    newMatrix[rowIndex].dates[date] = parseFloat(event.target.value) || 0;
    setScheduleMatrix(newMatrix);

    setLocalModel({
      ...localModel,
      ScheduleItem: convertMatrixToSchedule(newMatrix)
    });
  };

  const addScheduleRow = () => {
    setScheduleMatrix([
      ...scheduleMatrix,
      {
        Unit: '',
        Charge_ProductCode: '',
        dates: {}
      }
    ]);
  };

  const removeScheduleRow = (index: number) => {
    const newMatrix = scheduleMatrix.filter((_, i) => i !== index);
    setScheduleMatrix(newMatrix);
    setLocalModel({
      ...localModel,
      ScheduleItem: convertMatrixToSchedule(newMatrix)
    });
  };

  const handleScheduleUnitChange = (index: number) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMatrix = [...scheduleMatrix];
    newMatrix[index].Unit = event.target.value;
    setScheduleMatrix(newMatrix);
    setLocalModel({
      ...localModel,
      ScheduleItem: convertMatrixToSchedule(newMatrix)
    });
  };

  const handleScheduleProductChange = (index: number) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMatrix = [...scheduleMatrix];
    newMatrix[index].Charge_ProductCode = event.target.value;
    setScheduleMatrix(newMatrix);
    setLocalModel({
      ...localModel,
      ScheduleItem: convertMatrixToSchedule(newMatrix)
    });
  };

  const getDates = () => {
    const dates: number[] = [];
    const startDate = localModel.ModelMetaData.startDate;
    const runDays = localModel.ModelMetaData.runDays;

    for (let i = 0; i < runDays; i++) {
      dates.push(startDate + i);
    }
    return dates;
  };

  const handleMetaDataChange = (field: keyof typeof localModel.ModelMetaData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'startDate' || field === 'runDays' 
      ? parseInt(event.target.value) 
      : event.target.value;

    setLocalModel({
      ...localModel,
      ModelMetaData: {
        ...localModel.ModelMetaData,
        [field]: value
      }
    });
  };

  const handleProductChange = (index: number, field: keyof ProductsForModelItem) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newProducts = [...localModel.ProductsForModelItem];
    const value = field === 'TankCapacityGals' || field === 'CurrentInventoryGals'
      ? parseFloat(event.target.value)
      : event.target.value;

    newProducts[index] = {
      ...newProducts[index],
      [field]: value
    };

    setLocalModel({
      ...localModel,
      ProductsForModelItem: newProducts
    });
  };

  const addProduct = () => {
    const newProduct: ProductsForModelItem = {
      ProductCode: '',
      ProductDescription: '',
      TankCapacityGals: 0,
      CurrentInventoryGals: 0
    };

    setLocalModel({
      ...localModel,
      ProductsForModelItem: [...localModel.ProductsForModelItem, newProduct]
    });
  };

  const removeProduct = (index: number) => {
    const newProducts = localModel.ProductsForModelItem.filter((_, i) => i !== index);
    setLocalModel({
      ...localModel,
      ProductsForModelItem: newProducts
    });
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Model Metadata
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="number"
              value={localModel.ModelMetaData.startDate}
              onChange={handleMetaDataChange('startDate')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Run Days"
              type="number"
              value={localModel.ModelMetaData.runDays}
              onChange={handleMetaDataChange('runDays')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={localModel.ModelMetaData.id_description}
              onChange={handleMetaDataChange('id_description')}
            />
          </Grid>
        </Grid>
      </Paper>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Products ({localModel.ProductsForModelItem.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Tank Capacity (Gals)</TableCell>
                  <TableCell>Current Inventory (Gals)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {localModel.ProductsForModelItem.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={product.ProductCode}
                        onChange={handleProductChange(index, 'ProductCode')}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={product.ProductDescription}
                        onChange={handleProductChange(index, 'ProductDescription')}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={product.TankCapacityGals}
                        onChange={handleProductChange(index, 'TankCapacityGals')}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={product.CurrentInventoryGals}
                        onChange={handleProductChange(index, 'CurrentInventoryGals')}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => removeProduct(index)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            startIcon={<AddIcon />}
            onClick={addProduct}
            sx={{ mt: 2 }}
          >
            Add Product
          </Button>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Schedule Matrix</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Product</TableCell>
                  {getDates().map(date => (
                    <TableCell key={date} align="right">{date}</TableCell>
                  ))}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduleMatrix.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.Unit}
                        onChange={handleScheduleUnitChange(rowIndex)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.Charge_ProductCode}
                        onChange={handleScheduleProductChange(rowIndex)}
                      />
                    </TableCell>
                    {getDates().map(date => (
                      <TableCell key={date} align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={row.dates[date] || ''}
                          onChange={handleScheduleMatrixChange(rowIndex, date.toString())}
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <IconButton onClick={() => removeScheduleRow(rowIndex)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            startIcon={<AddIcon />}
            onClick={addScheduleRow}
            sx={{ mt: 2 }}
          >
            Add Schedule Row
          </Button>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onModelUpdate(localModel)}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default ModelEditor; 