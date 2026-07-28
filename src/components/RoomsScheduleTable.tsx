import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { tableSchedule } from "../types/tableSchedules";
import { Autocomplete, Checkbox, Chip, TextField, Tooltip } from "@mui/material";
import { weekDays } from "../types/weekDays";
import { CheckBoxOutlineBlankOutlined, CheckBoxOutlined } from "@mui/icons-material";
import { RoomT } from "../types/RoomT";
import { useState } from "react";
import { StateContext } from "../context/ReactContext";

type Props = {
    formSchedule: boolean[][];
    setFormSchedule: (b: boolean[][]) => void;
    activeDays: number[];
};

export default function RoomsScheduleTable({
    formSchedule,
    setFormSchedule,
    activeDays
}: Props) {
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        wIndex: number,
        hIndex: number
    ) => {
        const newSchedule = formSchedule.map((day, di) => 
            di === wIndex 
                ? day.map((val, hi) => (hi === hIndex ? event.target.checked : val))
                : day
        );
        setFormSchedule(newSchedule);
    };

    const handleToggleRow = (weekIndex: number) => {
        // Verifica se todos os itens daquela linha já estão marcados
        const allChecked = formSchedule[weekIndex].every(val => val);

        const newSchedule = formSchedule.map((day, di) =>
            di === weekIndex 
                ? day.map(() => !allChecked) // Se todos estavam marcados, desmarca; senão, marca tudo
                : day
        );
        setFormSchedule(newSchedule);
    };

    const [formRoom, setFormRoom] = useState<RoomT[]>([]);
    const { roomList } = React.useContext(StateContext);

    return (
        <TableContainer component={Paper} sx={{ marginX: "auto", border: 'solid 1px lightgray' }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                <TableHead>
                    <TableRow>
                        
                        <TableCell></TableCell>
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

                        const isDayDisabled = !activeDays.includes(weekIndex);

                        return(
                            <TableRow 
                                key={wd.name}
                                sx={{ 
                                    backgroundColor: isDayDisabled ? "rgba(0, 0, 0, 0.04)" : "inherit",
                                    transition: "0.3s",
                                }}
                            >
                                <TableCell 
                                    sx={{ 
                                        textAlign: 'center',
                                        color: isDayDisabled ? "text.disabled" : "text.primary",
                                        fontWeight: isDayDisabled ? 400 : 600,
                                        minWidth: 120,
                                        borderRight: 'solid 1px gray'
                                    }}
                                >
                                    <div 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            paddingLeft: '8px',
                                            fontSize: '120%',
                                        }}
                                    >
                                        <Checkbox
                                            size="medium"
                                            disabled={isDayDisabled}
                                            // Estado indeterminado se alguns estiverem marcados, mas não todos
                                            indeterminate={
                                                formSchedule[weekIndex].some(val => val) && 
                                                !formSchedule[weekIndex].every(val => val)
                                            }
                                            checked={formSchedule[weekIndex].every(val => val)}
                                            onChange={() => handleToggleRow(weekIndex)}
                                        />
                                        {wd.name}
                                    </div>
                                </TableCell>

                                {tableSchedule.map((schedule, hourIndex) => {
                                
                                    return (
                                        <Tooltip
                                            title={""}
                                            key={weekIndex + hourIndex}
                                        >
                                            <TableCell
                                                padding="checkbox"
                                                key={
                                                    "row" +
                                                    schedule.shift +
                                                    schedule.hourly
                                                }
                                                size="medium"
                                                align="center"
                                            >
                                                {formSchedule[weekIndex] ? (
                                                    <Checkbox
                                                        disabled={isDayDisabled}
                                                        sx={{
                                                            "& .MuiSvgIcon-root": { 
                                                                fontSize: 26 
                                                            },
                                                        }}
                                                        checked={!!formSchedule[weekIndex][hourIndex]}
                                                        onChange={(e) => handleChange(e, weekIndex, hourIndex)}
                                                    />
                                                ) : null}
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
