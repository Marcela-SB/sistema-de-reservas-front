import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { tableSchedule } from "../types/tableSchedules";
import { Checkbox, Tooltip } from "@mui/material";
import { weekDays } from "../types/weekDays";

type Props = {
    formSchedule: boolean[][];
    setFormSchedule: (b: boolean[][]) => void;
    activeDays: number[];
};

export default function FullScreenTableDialog({
    formSchedule,
    setFormSchedule,
    activeDays
}: Props) {
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        wIndex: number,
        hIndex: number
    ) => {
        const holder = formSchedule;
        holder[wIndex][hIndex] = event.target.checked;
        setFormSchedule([...holder]);
    };

    if(formSchedule.length <= 6){
        // O novo array que você quer adicionar no início
        const novoHorario = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];

        // Criamos um novo array começando com 'novoHorario' e depois
        // "espalhando" todos os itens do 'formSchedule' original
        const novoFormSchedule = [novoHorario, ...formSchedule];

        console.log(novoFormSchedule);
        
        // Atualizamos o estado com o novo array
        setFormSchedule(novoFormSchedule);
    }

    return (
        <TableContainer component={Paper} sx={{ marginX: "auto" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
                                    transition: "0.3s"
                                }}
                            >
                                <TableCell 
                                    sx={{ 
                                        textAlign: 'center',
                                        color: isDayDisabled ? "text.disabled" : "text.primary",
                                        fontWeight: isDayDisabled ? 400 : 600 
                                    }}
                                >
                                    {wd.name}
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
                                                {formSchedule[weekIndex][
                                                    hourIndex
                                                ] ? (
                                                    <Checkbox
                                                        disabled={isDayDisabled}
                                                        sx={{
                                                            "& .MuiSvgIcon-root": {
                                                                fontSize: 26,
                                                            },
                                                        }}
                                                        checked={
                                                            formSchedule[weekIndex][
                                                                hourIndex
                                                            ]
                                                        }
                                                        onChange={(e) => {
                                                            handleChange(
                                                                e,
                                                                weekIndex,
                                                                hourIndex
                                                            );
                                                        }}
                                                    />
                                                ) : (
                                                    <Checkbox
                                                        disabled={isDayDisabled}
                                                        sx={{
                                                            "& .MuiSvgIcon-root": {
                                                                fontSize: 26,
                                                            },
                                                        }}
                                                        checked={
                                                            formSchedule[weekIndex][
                                                                hourIndex
                                                            ]
                                                        }
                                                        onChange={(e) => {
                                                            handleChange(
                                                                e,
                                                                weekIndex,
                                                                hourIndex
                                                            );
                                                        }}
                                                    />
                                                )}
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
