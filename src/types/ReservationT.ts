import { Courses } from "./Courses";

export type ReservationT = {
    id: string;
    reservationResponsibleId: string;
    reservatedToId: string;
    creationDate: string; 
    hasMultipleDates: boolean;
    schedules: RoomsSchedule[];
    reservationStart: string; 
    reservationEnd: string; 
    name:string;
    comment:string;
    course: Courses;
    slots: number;
  };

export type RoomsSchedule = {
  id: string;
  startDate: string;
  endDate: string;
  roomsId: string[];
  schedule: boolean[][];
}
