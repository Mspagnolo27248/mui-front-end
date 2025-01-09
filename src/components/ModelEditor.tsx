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

const ModelEditor: React.FC<ModelEditorProps> = ({ modelData, onModelUpdate }) => {
  const [localModel, setLocalModel] = useState<RollingForecastInputParams>(modelData);

  useEffect(() => {
    setLocalModel(modelData);
  }, [modelData]);

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

  const handleScheduleChange = (index: number, field: keyof ScheduleItem) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSchedule = [...localModel.ScheduleItem];
    const value = field === 'bbls' || field === 'Date'
      ? parseFloat(event.target.value)
      : event.target.value;

    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value
    };

    setLocalModel({
      ...localModel,
      ScheduleItem: newSchedule
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

  const handleSave = () => {
    onModelUpdate(localModel);
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

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default ModelEditor; 