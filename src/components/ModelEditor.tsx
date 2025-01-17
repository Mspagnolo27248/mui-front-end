import React from 'react';
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
import { useModel } from '../context/ModelContext';
import ScheduleEditor from './ScheduleEditor';
import { ModelMetaData, ProductsForModelItem } from '../types/dto';

const ModelEditor: React.FC = () => {
  const { state, dispatch } = useModel();

  const handleMetaDataChange = (field: keyof ModelMetaData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!state.metadata) return;
    
    const value = field === 'startDate' || field === 'runDays' 
      ? parseInt(event.target.value) 
      : event.target.value;

    dispatch({
      type: 'SET_METADATA',
      payload: {
        ...state.metadata,
        [field]: value
      }
    });
  };

  const handleProductChange = (index: number, field: keyof ProductsForModelItem) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newProducts = [...state.products];
    const value = field === 'TankCapacityGals' || field === 'CurrentInventoryGals'
      ? parseFloat(event.target.value)
      : event.target.value;

    newProducts[index] = {
      ...newProducts[index],
      [field]: value
    };

    dispatch({ type: 'SET_PRODUCTS', payload: newProducts });
  };

  const addProduct = () => {
    dispatch({
      type: 'SET_PRODUCTS',
      payload: [
        ...state.products,
        {
          ProductCode: '',
          ProductDescription: '',
          TankCapacityGals: 0,
          CurrentInventoryGals: 0
        }
      ]
    });
  };

  const removeProduct = (index: number) => {
    const newProducts = state.products.filter((_, i) => i !== index);
    dispatch({ type: 'SET_PRODUCTS', payload: newProducts });
  };

  if (!state.metadata) {
    return null;
  }

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
              value={state.metadata.startDate}
              onChange={handleMetaDataChange('startDate')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Run Days"
              type="number"
              value={state.metadata.runDays}
              onChange={handleMetaDataChange('runDays')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={state.metadata.id_description}
              onChange={handleMetaDataChange('id_description')}
            />
          </Grid>
        </Grid>
      </Paper>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Products ({state.products.length})</Typography>
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
                {state.products.map((product, index) => (
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
          <Typography>Schedule</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ScheduleEditor />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ModelEditor; 