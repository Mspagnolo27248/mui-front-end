import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useModel } from '../context/ModelContext';

// Memoized cell component to prevent unnecessary re-renders
const ScheduleCell = memo(({ 
  unit, 
  product, 
  date, 
  value, 
  onChange, 
  onCopy 
}: { 
  unit: string;
  product: string;
  date: string;
  value: number;
  onChange: (value: string) => void;
  onCopy: () => void;
}) => (
  <Box display="flex" alignItems="center">
    <TextField
      size="small"
      type="number"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      sx={{ width: '80px' }}
    />
    <IconButton
      size="small"
      onClick={onCopy}
      title="Copy value to next 7 days"
    >
      <ContentCopyIcon fontSize="small" />
    </IconButton>
  </Box>
));

// Memoized row component
const ScheduleRow = memo(({ 
  unit, 
  product, 
  dates, 
  dateValues, 
  onValueChange, 
  onCopyValues, 
  onRemove 
}: {
  unit: string;
  product: string;
  dates: number[];
  dateValues: { [key: string]: number };
  onValueChange: (date: string, value: string) => void;
  onCopyValues: (date: string) => void;
  onRemove: () => void;
}) => (
  <TableRow>
    <TableCell>{product}</TableCell>
    {dates.map(date => (
      <TableCell key={date} align="right" sx={{ minWidth: '100px' }}>
        <ScheduleCell
          unit={unit}
          product={product}
          date={date.toString()}
          value={dateValues[date.toString()] || 0}
          onChange={(value) => onValueChange(date.toString(), value)}
          onCopy={() => onCopyValues(date.toString())}
        />
      </TableCell>
    ))}
    <TableCell>
      <IconButton onClick={onRemove} size="small">
        <DeleteIcon />
      </IconButton>
    </TableCell>
  </TableRow>
));

const ScheduleEditor: React.FC = () => {
  const { state, dispatch, getDates } = useModel();
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quickFillValue, setQuickFillValue] = useState('');
  const [quickFillStartDate, setQuickFillStartDate] = useState('');
  const [quickFillEndDate, setQuickFillEndDate] = useState('');

  const dates = useMemo(() => getDates(), [getDates]);

  const handleQuickFill = useCallback(() => {
    if (!selectedUnit || !selectedProduct || !quickFillValue) return;

    const newSchedule = { ...state.schedule };
    if (!newSchedule[selectedUnit]) {
      newSchedule[selectedUnit] = {};
    }
    if (!newSchedule[selectedUnit][selectedProduct]) {
      newSchedule[selectedUnit][selectedProduct] = {};
    }

    const startIdx = quickFillStartDate ? dates.indexOf(parseInt(quickFillStartDate)) : 0;
    const endIdx = quickFillEndDate ? dates.indexOf(parseInt(quickFillEndDate)) : dates.length - 1;

    for (let i = startIdx; i <= endIdx; i++) {
      const date = dates[i];
      newSchedule[selectedUnit][selectedProduct][date.toString()] = parseFloat(quickFillValue) || 0;
    }

    dispatch({ type: 'SET_SCHEDULE', payload: newSchedule });
  }, [selectedUnit, selectedProduct, quickFillValue, quickFillStartDate, quickFillEndDate, dates, state.schedule, dispatch]);

  const handleValueChange = useCallback((unit: string, product: string, date: string, value: string) => {
    const newSchedule = { ...state.schedule };
    if (!newSchedule[unit]) {
      newSchedule[unit] = {};
    }
    if (!newSchedule[unit][product]) {
      newSchedule[unit][product] = {};
    }
    newSchedule[unit][product][date] = parseFloat(value) || 0;
    dispatch({ type: 'SET_SCHEDULE', payload: newSchedule });
  }, [state.schedule, dispatch]);

  const handleCopyValues = useCallback((unit: string, product: string, fromDate: string, days: number) => {
    const newSchedule = { ...state.schedule };
    const value = newSchedule[unit][product][fromDate];
    const startIdx = dates.indexOf(parseInt(fromDate));

    for (let i = 1; i <= days; i++) {
      const nextDate = dates[startIdx + i];
      if (nextDate) {
        newSchedule[unit][product][nextDate.toString()] = value;
      }
    }

    dispatch({ type: 'SET_SCHEDULE', payload: newSchedule });
  }, [state.schedule, dates, dispatch]);

  const addUnit = useCallback(() => {
    if (!selectedUnit) return;
    const newSchedule = { ...state.schedule };
    if (!newSchedule[selectedUnit]) {
      newSchedule[selectedUnit] = {};
    }
    dispatch({ type: 'SET_SCHEDULE', payload: newSchedule });
  }, [selectedUnit, state.schedule, dispatch]);

  const addProduct = useCallback(() => {
    if (!selectedUnit || !selectedProduct) return;
    const newSchedule = { ...state.schedule };
    if (!newSchedule[selectedUnit]) {
      newSchedule[selectedUnit] = {};
    }
    if (!newSchedule[selectedUnit][selectedProduct]) {
      newSchedule[selectedUnit][selectedProduct] = {};
    }
    dispatch({ type: 'SET_SCHEDULE', payload: newSchedule });
  }, [selectedUnit, selectedProduct, state.schedule, dispatch]);

  const removeProduct = useCallback((unit: string, product: string) => {
    const newSchedule = { ...state.schedule };
    if (newSchedule[unit] && newSchedule[unit][product]) {
      delete newSchedule[unit][product];
      if (Object.keys(newSchedule[unit]).length === 0) {
        delete newSchedule[unit];
      }
    }
    dispatch({ type: 'SET_SCHEDULE', payload: newSchedule });
  }, [state.schedule, dispatch]);

  const existingUnits = useMemo(() => Object.keys(state.schedule), [state.schedule]);
  const existingProducts = useMemo(() => 
    selectedUnit && state.schedule[selectedUnit] 
      ? Object.keys(state.schedule[selectedUnit])
      : [], 
    [selectedUnit, state.schedule]
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Schedule Editor
      </Typography>

      {/* Quick Fill Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Quick Fill
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Unit</InputLabel>
              <Select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                label="Unit"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {existingUnits.map(unit => (
                  <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Product</InputLabel>
              <Select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                label="Product"
                disabled={!selectedUnit}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {existingProducts.map(product => (
                  <MenuItem key={product} value={product}>{product}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              size="small"
              label="Value"
              type="number"
              value={quickFillValue}
              onChange={(e) => setQuickFillValue(e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="number"
              value={quickFillStartDate}
              onChange={(e) => setQuickFillStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="number"
              value={quickFillEndDate}
              onChange={(e) => setQuickFillEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              onClick={handleQuickFill}
              disabled={!selectedUnit || !selectedProduct || !quickFillValue}
              fullWidth
            >
              Fill
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Schedule Table */}
      {Object.entries(state.schedule).map(([unit, products]) => (
        <Accordion key={unit}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Unit: {unit}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    {dates.map(date => (
                      <TableCell key={date} align="right">{date}</TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(products).map(([product, dateValues]) => (
                    <ScheduleRow
                      key={`${unit}-${product}`}
                      unit={unit}
                      product={product}
                      dates={dates}
                      dateValues={dateValues}
                      onValueChange={(date, value) => handleValueChange(unit, product, date, value)}
                      onCopyValues={(date) => handleCopyValues(unit, product, date, 7)}
                      onRemove={() => removeProduct(unit, product)}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Add Controls */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>New Unit</InputLabel>
          <Select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            label="New Unit"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="CRUDE">CRUDE</MenuItem>
            <MenuItem value="EXTRACT">EXTRACT</MenuItem>
            <MenuItem value="FRAC">FRAC</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={addUnit}
          disabled={!selectedUnit}
        >
          Add Unit
        </Button>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>New Product</InputLabel>
          <Select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            label="New Product"
            disabled={!selectedUnit}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {state.products.map(product => (
              <MenuItem key={product.ProductCode} value={product.ProductCode}>
                {product.ProductCode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={addProduct}
          disabled={!selectedUnit || !selectedProduct}
        >
          Add Product
        </Button>
      </Box>
    </Box>
  );
};

export default ScheduleEditor; 