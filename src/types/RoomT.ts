export type RoomT = {
    id: string;
    name: string;
    roomNumber: string | null;
    capacity: number;
    chairQuantity: number;
    computerQuantity: number;
    airConditioning: boolean;
    airConditioningWorking: boolean;
    projector: boolean;
    projectorWorking: boolean;
    bigTables: boolean;
    sinks: boolean;
    hasKey:boolean;
    reservable:boolean;
    administrative:boolean;
    responsibleId: string | null;
  };
  