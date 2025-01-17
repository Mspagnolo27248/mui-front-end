export interface ModelMetaData {
  startDate: number;
  runDays: number;
  uid: string;
  id_description: string;
}

export interface ProductsForModelItem {
  ProductCode: string;
  ProductDescription: string;
  TankCapacityGals: number;
  CurrentInventoryGals: number;
}

export interface ReceiptsProductDateKeys {
  [ProductCode:string]:{
      [Date:string]:
      number;
  };
};


export interface DemandForecastProductDateKeys {
[ProductCode:string]:{
    [Date:string]:
    number;
};
};
export interface OpenOrdersProductDateKeys {
  [ProductCode:string]:{
      [Date:string]:
      number;
  };
};

export interface ScheduleUnitProductDateKeys {
  [Unit:string]:{
       [ProductCode:string]:{
          [Date:string]:number
       }
      }
  };

export type UnitYieldObject = {
  [Unit: string]: {
  [Charge_ProductCode: string]:{Output_ProductCode: string,OutputPercent: number}[];     
  }
  };

export type ProductFormulationsObject = {
  [ProductCode: string]: { ComponentCode: string, FormulaPercent: number }[];
  };

export interface ForecastModelInputs {
  ModelMetaData: ModelMetaData;
  ProductsForModelItem: ProductsForModelItem[],
  Receipts:ReceiptsProductDateKeys,
  DailyOpenOrders:OpenOrdersProductDateKeys,
  DailyDemandForecast:DemandForecastProductDateKeys,
  ProductFormulation:ProductFormulationsObject,
  ScheduleItem:ScheduleUnitProductDateKeys,
  UnitYieldItem:UnitYieldObject;
}













type RollForwardOutput = {[Product:string]:{[Date: string]: OutputItems[]}} 

export type ForecastModelOutputParams = ForecastModelInputs & {Outputs:RollForwardOutput}

export interface OutputItems{
  OpenInventory:number;
  Receipts:number;
  ProductionIn:number;
  ProductionOut:number;
  OpenOrders:number;
  DemandForecast:number;
  BlendRequirements:number;
  EndingInventory:number;
}
