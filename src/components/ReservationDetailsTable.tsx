import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Tooltip,
    TableBody,
    Checkbox,
} from "@mui/material";
import { tableSchedule } from "../types/tableSchedules";
import { weekDays } from "../types/weekDays";
import { getEnabledDays } from "../utils/getEnabledDays";
import { Dayjs } from "dayjs";

type Props = {
    formSchedule: boolean[][];
    reservationStart: string | number | Dayjs;
    reservationEnd: string | number | Dayjs | null;
};

export default function ReservationDetailsTable({ formSchedule, reservationStart, reservationEnd }: Props) {

    const activeDays = getEnabledDays(reservationStart, reservationEnd);

    return (
        <TableContainer component={Paper} sx={{ marginX: "auto" }}>
            <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        {tableSchedule.map((schedule) => {
                            return (
                                <Tooltip
                                    title={
                                        schedule.startTime +
                                        "-" +
                                        schedule.endTime
                                    }
                                    key={
                                        schedule.startTime +
                                        "-" +
                                        schedule.endTime
                                    }
                                >
                                    <TableCell
                                        padding="none"
                                        key={
                                            "row" +
                                            schedule.shift +
                                            schedule.hourly
                                        }
                                        size="small"
                                        align="center"
                                    >
                                        {schedule.shift + schedule.hourly}
                                    </TableCell>
                                </Tooltip>
                            );
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {weekDays.map((wd, weekIndex) => {

                        const isDayInactive = !activeDays.includes(weekIndex);

                        return(
                            <TableRow 
                                key={wd.name}
                                sx={{ 
                                    backgroundColor: isDayInactive ? "rgba(0, 0, 0, 0.03)" : "inherit",
                                    opacity: isDayInactive ? 0.5 : 1,
                                    transition: "opacity 0.2s"
                                }}
                            >
                                <TableCell align="center">{wd.name}</TableCell>

                                {tableSchedule.map((schedule, hourIndex) => {
                                    // console.log(formSchedule);

                                    const valorTratado = () => {
                                        let value = false;
                                        try {
                                            value =
                                                formSchedule[weekIndex][hourIndex];
                                        } catch (error) {
                                            console.log(error);
                                            
                                        }
                                        return value;
                                    };

                                    return (
                                        <Tooltip
                                            title={""}
                                            key={weekIndex + hourIndex}
                                        >
                                            <TableCell
                                                padding="none"
                                                key={
                                                    "row" +
                                                    schedule.shift +
                                                    schedule.hourly
                                                }
                                                size="medium"
                                                align="center"
                                            >
                                                <Checkbox
                                                    sx={{
                                                        "& .MuiSvgIcon-root": {
                                                            fontSize: 26,
                                                        },
                                                    }}
                                                    checked={
                                                        valorTratado()
                                                    }
                                                />
                                            </TableCell>
                                        </Tooltip>
                                    );
                                })}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
