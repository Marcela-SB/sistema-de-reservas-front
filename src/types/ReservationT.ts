import { Courses } from "./Courses";

export type ReservationT = {
    id: string;
    roomsId: string[];
    reservationResponsibleId: string;
    reservatedToId: string;
    creationDate: string; 
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
  roomsId: string[];
  schedule: boolean[][];
}
