import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';
import {
  ModelMetaData,
  ProductsForModelItem,
  ForecastModelInputs,
  ScheduleUnitProductDateKeys,
  UnitYieldObject,
  ReceiptsProductDateKeys,
  OpenOrdersProductDateKeys,
  DemandForecastProductDateKeys,
  ProductFormulationsObject
} from '../types/dto';

interface ModelState extends ForecastModelInputs {
  metadata: ModelMetaData | null;
}

type ModelAction =
  | { type: 'SET_METADATA'; payload: ModelMetaData }
  | { type: 'SET_PRODUCTS'; payload: ProductsForModelItem[] }
  | { type: 'SET_SCHEDULE'; payload: ScheduleUnitProductDateKeys }
  | { type: 'SET_UNIT_YIELDS'; payload: UnitYieldObject }
  | { type: 'SET_RECEIPTS'; payload: ReceiptsProductDateKeys }
  | { type: 'SET_OPEN_ORDERS'; payload: OpenOrdersProductDateKeys }
  | { type: 'SET_DEMAND_FORECAST'; payload: DemandForecastProductDateKeys }
  | { type: 'SET_PRODUCT_FORMULATION'; payload: ProductFormulationsObject }
  | { type: 'LOAD_MODEL'; payload: ForecastModelInputs }
  | { type: 'RESET' };

const initialState: ModelState = {
  metadata: null,
  products: [],
  schedule: {},
  unitYields: {},
  receipts: {},
  openOrders: {},
  demandForecast: {},
  productFormulation: {}
};

const modelReducer = (state: ModelState, action: ModelAction): ModelState => {
  switch (action.type) {
    case 'SET_METADATA':
      return { ...state, metadata: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_SCHEDULE':
      return { ...state, schedule: action.payload };
    case 'SET_UNIT_YIELDS':
      return { ...state, unitYields: action.payload };
    case 'SET_RECEIPTS':
      return { ...state, receipts: action.payload };
    case 'SET_OPEN_ORDERS':
      return { ...state, openOrders: action.payload };
    case 'SET_DEMAND_FORECAST':
      return { ...state, demandForecast: action.payload };
    case 'SET_PRODUCT_FORMULATION':
      return { ...state, productFormulation: action.payload };
    case 'LOAD_MODEL':
      return {
        metadata: action.payload.ModelMetaData,
        products: action.payload.ProductsForModelItem,
        schedule: action.payload.ScheduleItem,
        unitYields: action.payload.UnitYieldItem,
        receipts: action.payload.Receipts,
        openOrders: action.payload.DailyOpenOrders,
        demandForecast: action.payload.DailyDemandForecast,
        productFormulation: action.payload.ProductFormulation
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

interface ModelContextType {
  state: ModelState;
  dispatch: React.Dispatch<ModelAction>;
  consolidateModel: () => ForecastModelInputs;
  getDates: () => number[];
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(modelReducer, initialState);

  const getDates = useCallback(() => {
    if (!state.metadata) return [];
    const dates: number[] = [];
    const startDate = state.metadata.startDate;
    const runDays = state.metadata.runDays;

    for (let i = 0; i < runDays; i++) {
      dates.push(startDate + i);
    }
    return dates;
  }, [state.metadata]);

  const consolidateModel = useCallback((): ForecastModelInputs => {
    if (!state.metadata) {
      throw new Error('Model metadata is required');
    }

    return {
      ModelMetaData: state.metadata,
      ProductsForModelItem: state.products,
      ScheduleItem: state.schedule,
      UnitYieldItem: state.unitYields,
      Receipts: state.receipts,
      DailyOpenOrders: state.openOrders,
      DailyDemandForecast: state.demandForecast,
      ProductFormulation: state.productFormulation
    };
  }, [state]);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    consolidateModel,
    getDates
  }), [state, consolidateModel, getDates]);

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}; 