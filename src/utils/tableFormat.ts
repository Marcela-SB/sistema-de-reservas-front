import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ReservationT } from "../types/ReservationT";
import { RoomT } from "../types/RoomT";

dayjs.extend(isBetween);

export default function tableFormat(
    date: Dayjs,
    reservationList: ReservationT[],
    roomList: RoomT[]
) {
    const dayOfWeek = date.day();

    // Filtra as reservas com base nas datas de cada RoomsSchedule
    let filteredReservations = reservationList.filter((r: ReservationT) => {
        if (!r.schedules || r.schedules.length === 0) return false;

        // A reserva passa se pelo menos um dos seus schedules abranger a 'date' informada
        return r.schedules.some(roomsSchedule => {
            const schedStart = dayjs(roomsSchedule.startDate);
            const schedEnd = dayjs(roomsSchedule.endDate);

            return (
                date.isSame(schedStart, "day") ||
                date.isSame(schedEnd, "day") ||
                date.isBetween(schedStart, schedEnd, "day", "[]")
            );
        });
    });

    const filteredReservationsByRooms: any[] = [];

    roomList.forEach((room: RoomT, index) => {
        filteredReservationsByRooms.push([room]);

        filteredReservations.forEach((reservation: ReservationT) => {
            // Procura nos schedules se algum bloco pertence a esta sala E abrange a data atual
            reservation.schedules?.forEach(roomsSchedule => {
                const matchesRoom = roomsSchedule.roomsId?.some(roomId => roomId === room.id);
                
                if (matchesRoom) {
                    const schedStart = dayjs(roomsSchedule.startDate);
                    const schedEnd = dayjs(roomsSchedule.endDate);

                    const isDateInScheduleRange =
                        date.isSame(schedStart, "day") ||
                        date.isSame(schedEnd, "day") ||
                        date.isBetween(schedStart, schedEnd, "day");

                    if (isDateInScheduleRange) {
                        // Guardamos a reserva associada ao seu respectivo bloco de horário da sala
                        filteredReservationsByRooms[index].push({
                            reservation,
                            roomsSchedule
                        });
                    }
                }
            });
        });
    });

    const finalSchedule: any[] = [];

    const falseSchedule = Array(16).fill(false);

    filteredReservationsByRooms.forEach((reservationsInARoom) => {
        let baseSchedule: any = [
            reservationsInARoom[0], // RoomT
            ...Array(16).fill(null)
        ];

        let shouldPrint = reservationsInARoom[0]?.name === "teste domingo";

        // Iterar a partir do índice 1 (onde começam os itens { reservation, roomsSchedule })
        for (let i = 1; i < reservationsInARoom.length; i++) {
            const item = reservationsInARoom[i];
            const reserv: ReservationT = item.reservation;
            const roomsSchedule = item.roomsSchedule;

            if (!roomsSchedule || !roomsSchedule.schedule) continue;

            let holdDay = dayOfWeek;
            const hasSunday = roomsSchedule.schedule.length > 6;
            
            if (!hasSunday) {
                holdDay -= 1;
            }

            let targetScheduleDay: boolean[];

            if (!hasSunday && holdDay < 0) {
                // Se não tem domingo e o dia buscado é sábado/outro ajuste de índice
                const tempSchedule = [...roomsSchedule.schedule];
                tempSchedule.unshift([...falseSchedule]);
                targetScheduleDay = tempSchedule[0] || falseSchedule;
            } else {
                targetScheduleDay = roomsSchedule.schedule[holdDay] || falseSchedule;
            }

            targetScheduleDay.forEach((h: boolean, index: number) => {
                if (h) {
                    if (shouldPrint) {
                        console.log(reserv.name);
                    }
                    baseSchedule[index + 1] = [reserv, 1];
                }
            });
        }

        let controlVector = 1;
        let softCap = 0;

        while (controlVector < baseSchedule.length && softCap < 20) {
            if (
                baseSchedule[controlVector] &&
                baseSchedule[controlVector + 1]
            ) {
                if (
                    baseSchedule[controlVector][0].id ===
                    baseSchedule[controlVector + 1][0].id
                ) {
                    baseSchedule[controlVector][1]++;
                    baseSchedule.splice(controlVector + 1, 1);
                } else {
                    controlVector++;
                }
            } else {
                controlVector++;
            }

            softCap++;
        }

        finalSchedule.push(baseSchedule);
    });

    const headers: any[] = [];
    const processedSchedule: any[] = [];

    finalSchedule.forEach((obj) => {
        const head = obj.shift();
        headers.push(head);
        processedSchedule.push(obj);
    });

    return [headers, processedSchedule];
}