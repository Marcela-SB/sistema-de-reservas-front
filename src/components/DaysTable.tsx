import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { tableSchedule } from "../types/tableSchedules";
import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Stack,
    Tooltip,
    Typography,
    styled,
} from "@mui/material";
import { StateContext } from "../context/ReactContext";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import tableFormat from "../utils/tableFormat";
import DaysTableCell from "./DaysTableCell";
import { ReservationT } from "../types/ReservationT";
import { RoomT } from "../types/RoomT";
import daysTabledynamicSort from "../utils/daysTabledynamicSort";
import PersonIcon from "@mui/icons-material/Person";

const OrangeTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
}));

type Props = {
    setReservationToDetail: (r: ReservationT) => void;
    setReserDIsOpen: (b: boolean) => void;
};

export default function DaysTable({
    setReservationToDetail,
    setReserDIsOpen,
}: Props) {
    const { roomList, reservationList } = React.useContext(StateContext);

    const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(
        dayjs()
    );

    const [finalSchedule, setFinalSchedule] = React.useState([]);

    React.useEffect(() => {
        if (roomList && reservationList && selectedDate) {
            const reservableRoomList = roomList.filter(
                (r: RoomT) => r.reservable == true
            );
            const holder = tableFormat(
                selectedDate,
                reservationList,
                reservableRoomList
            );

            const holderSchedule = [];
            
            for (let index = 0; index < holder[0].length; index++) {
                holderSchedule.push([holder[0][index], holder[1][index]]);
            }

            holderSchedule?.sort(daysTabledynamicSort());

            setFinalSchedule(holderSchedule);
        }
    }, [roomList, reservationList, selectedDate]);

    const handleCellClick = (reservation: ReservationT) => {
        setReservationToDetail(reservation);
        setReserDIsOpen(true);
    };

    return (
        <Box mb={2}>
            <Stack direction={"row"} justifyContent={"space-between"}>
                <DemoContainer
                    components={["DatePicker"]}
                    sx={{ marginLeft: 0, marginBottom: 1 }}
                >
                    <DatePicker
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        sx={{ width: "10%" }}
                    />
                </DemoContainer>
                <ButtonGroup
                    disableElevation
                    variant="contained"
                    aria-label="Basic button group"
                    sx={{ py: 2, color: "#2b2b2b" }}
                >
                    <Button
                        sx={{
                            backgroundColor: "#a4c2f4",
                            color: "inherit",
                            pointerEvents: "none",
                        }}
                    >
                        Teatro
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: "#ffe599",
                            color: "inherit",
                            pointerEvents: "none",
                        }}
                    >
                        Artes
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: "#b6d7a8",
                            color: "inherit",
                            pointerEvents: "none",
                        }}
                    >
                        Design
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: "#f4cccc",
                            color: "inherit",
                            pointerEvents: "none",
                        }}
                    >
                        Dança
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: "#eecca7",
                            color: "inherit",
                            pointerEvents: "none",
                        }}
                    >
                        Pós
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: "#d9c9ff",
                            color: "inherit",
                            pointerEvents: "none",
                        }}
                    >
                        Proj. Extensão
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: "#e4ecf7",
                            color: "inherit",
                            pointerEvents: "none",
                        }}
                    >
                        Ativ. Diversas
                    </Button>
                </ButtonGroup>
            </Stack>

            <TableContainer
                component={Paper}
                sx={{
                    position: "relative",
                    width: "100%",
                    margin: "auto",
                }}
            >
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <colgroup>
                        <col style={{ width: "20%" }} />
                        {Array.from({ length: 16 }, (_, i) => i + 1).map(
                            (number) => {
                                return (
                                    <col
                                        key={"colgroup-" + number}
                                        style={{ width: "5%" }}
                                    />
                                );
                            }
                        )}
                    </colgroup>
                    <TableHead>
                        <OrangeTableRow>
                            <TableCell
                                size="small"
                                align="center"
                                padding="none"
                            >
                                <Typography
                                    variant="body1"
                                    noWrap
                                    sx={{
                                        fontFamily: "monospace",
                                        fontWeight: 700,
                                        color: "white",
                                        textDecoration: "none",
                                    }}
                                >
                                    HORÁRIOS
                                </Typography>
                            </TableCell>
                            {tableSchedule.map((schedule) => {
                                let color = "#7dc6ed";
                                if (schedule.shift == "T") {
                                    color = "#ffd320";
                                } else if (schedule.shift == "N") {
                                    color = "#4969f3";
                                }

                                const currentTime = dayjs();

                                let percentageWidth = 0;
                                let borderRight =
                                    "0rem solid hsla(120, 100%, 25%, 1)";

                                const currentDay =
                                    currentTime.format("YYYY-MM-DD");

                                const startTime = dayjs(
                                    `${currentDay} ${schedule.startTime}`
                                );
                                const endTime = dayjs(
                                    `${currentDay} ${schedule.endTime}`
                                );
                                if (
                                    currentTime.isAfter(startTime, "minute") &&
                                    currentTime.isBefore(endTime, "minute")
                                ) {
                                    const currentMinutes =
                                        currentTime.minute() +
                                        currentTime.hour() * 60;
                                    const startMinutes =
                                        startTime.minute() +
                                        startTime.hour() * 60;
                                    const subtractedMinutes =
                                        currentMinutes - startMinutes;
                                    percentageWidth =
                                        (subtractedMinutes / 50) * 100;
                                    borderRight =
                                        ".15rem solid hsla(120, 100%, 25%, 1)";
                                } else if (
                                    currentTime.isBefore(startTime, "minute")
                                ) {
                                    percentageWidth = 0;
                                } else if (
                                    currentTime.isAfter(endTime, "minute") ||
                                    currentTime.isSame(endTime, "minute")
                                ) {
                                    percentageWidth = 100;
                                }

                                return (
                                    <>
                                        <Tooltip
                                            title={
                                                schedule.startTime +
                                                "-" +
                                                schedule.endTime
                                            }
                                        >
                                            <TableCell
                                                rowSpan={2}
                                                key={
                                                    "row" +
                                                    schedule.shift +
                                                    schedule.hourly
                                                }
                                                size="small"
                                                padding="none"
                                                align="center"
                                                sx={{
                                                    border: "1px solid white;",

                                                    position: "relative",
                                                    "::before": {
                                                        content: '""',
                                                        position: "absolute",
                                                        left: 0,
                                                        top: 0,
                                                        backgroundColor:
                                                            "hsla(120, 100%, 25%, 0.4)",
                                                        display: "flex",
                                                        width: `${percentageWidth}%`,
                                                        height: "100%",
                                                        overflow: "hidden",
                                                        borderRight: `${borderRight}`,
                                                        pointerEvents: "none",
                                                    },
                                                }}
                                            >
                                                <Box
                                                    component="span"
                                                    fontWeight="600"
                                                    color={"white"}
                                                >
                                                    {schedule.shift +
                                                        schedule.hourly}
                                                </Box>
                                            </TableCell>
                                        </Tooltip>
                                    </>
                                );
                            })}
                        </OrangeTableRow>
                        <OrangeTableRow>
                            <TableCell
                                size="small"
                                align="center"
                                padding="none"
                            >
                                <Typography
                                    variant="body1"
                                    noWrap
                                    sx={{
                                        fontFamily: "monospace",
                                        fontWeight: 700,
                                        color: "white",
                                        textDecoration: "none",
                                    }}
                                >
                                    SALAS
                                </Typography>
                            </TableCell>
                        </OrangeTableRow>
                    </TableHead>
                    <TableBody>
                        {finalSchedule?.map(
                                (
                                    rowContent: [RoomT, any[]],
                                    roomArrayIndex: number
                                ) => {
                                    const room = rowContent[0];
                                    const roomSchedule = rowContent[1];

                                    let cellsToIgnore = 0;
                                    let cellsIgnored = 0;

                                    let spanCount = 0;

                                    return (
                                        <TableRow key={room.id + "-row"}>
                                            <TableCell
                                                padding="none"
                                                align="left"
                                                sx={{
                                                    width: "15%",
                                                    bgcolor: "#004586",
                                                }}
                                            >
                                                <Stack
                                                    direction={"row"}
                                                    width={"100%"}
                                                    justifyContent={
                                                        "space-between"
                                                    }
                                                    spacing={2}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: "white",
                                                            fontWeight: 600,
                                                            pl: 2,
                                                        }}
                                                        variant="body2"
                                                        noWrap
                                                    >
                                                        {room.name +
                                                            " - " +
                                                            room.roomNumber}
                                                    </Typography>
                                                    <Box
                                                        display={"inline-flex"}
                                                        pr={2}
                                                        alignItems={"end"}
                                                    >
                                                        <PersonIcon
                                                            fontSize="small"
                                                            sx={{
                                                                color: "white",
                                                            }}
                                                        />
                                                        <Typography
                                                            sx={{
                                                                color: "white",
                                                                fontWeight: 600,
                                                            }}
                                                            variant="caption"
                                                            lineHeight={1.5}
                                                        >
                                                            {room.capacity}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            {roomSchedule?.map(   // Protege caso roomSchedule venha nulo/undefined
                                                (hourschedule, dayIndex) => {
                                                    
                                                    let passedSchedule = null;
                                                    let passedSpan = 1;
                                                    
                                                    // Proteção contra hourschedule nulo/indefinido antes de ler o índice [0] ou [1]
                                                    if (hourschedule?.[0]) {
                                                        passedSchedule = hourschedule[0];
                                                        passedSpan = hourschedule[1] ?? 1;
                                                        cellsToIgnore = (hourschedule[1] ?? 1) - 1;
                                                        spanCount += passedSpan;
                                                    } else {
                                                        spanCount++;
                                                    }

                                                    return (
                                                        <DaysTableCell
                                                            key={`daystablecell ${room.id}-${roomArrayIndex}-${dayIndex}`}
                                                            schedule={passedSchedule}
                                                            index={dayIndex}
                                                            span={passedSpan}
                                                            handleClick={handleCellClick}
                                                            roomName={`${room.name ?? ''} - ${room.roomNumber ?? ''}`.trim()}
                                                        />
                                                    );
                                                }
                                            )}

                                            {[...Array(Math.max(0, 16 - spanCount))].map(
                                                (e, i) => {
                                                    spanCount++;
                                                    return (
                                                        <DaysTableCell
                                                            key={`daystablecell ${room.id}-${roomArrayIndex}-${cellsIgnored + i}`}
                                                            schedule={null}
                                                            index={cellsIgnored + i}
                                                            span={1}
                                                            handleClick={handleCellClick}
                                                            roomName={`${room.name ?? ''} - ${room.roomNumber ?? ''}`.trim()}
                                                        />
                                                    );
                                                }
                                            )}
                                        </TableRow>
                                    );
                                }
                            )
                        }

                        <OrangeTableRow>
                            <TableCell
                                size="small"
                                align="center"
                                padding="none"
                            >
                                <Typography
                                    variant="body1"
                                    noWrap
                                    sx={{
                                        fontFamily: "monospace",
                                        fontWeight: 700,
                                        color: "white",
                                        textDecoration: "none",
                                    }}
                                >
                                    SALAS
                                </Typography>
                            </TableCell>
                            {tableSchedule.map((schedule) => {
                                let color = "#7dc6ed";
                                if (schedule.shift == "T") {
                                    color = "#ffd320";
                                } else if (schedule.shift == "N") {
                                    color = "#4969f3";
                                }

                                const currentTime = dayjs();

                                let percentageWidth = 0;
                                let borderRight =
                                    "0rem solid hsla(120, 100%, 25%, 1)";

                                const currentDay =
                                    currentTime.format("YYYY-MM-DD");

                                const startTime = dayjs(
                                    `${currentDay} ${schedule.startTime}`
                                );
                                const endTime = dayjs(
                                    `${currentDay} ${schedule.endTime}`
                                );
                                if (
                                    currentTime.isAfter(startTime, "minute") &&
                                    currentTime.isBefore(endTime, "minute")
                                ) {
                                    const currentMinutes =
                                        currentTime.minute() +
                                        currentTime.hour() * 60;
                                    const startMinutes =
                                        startTime.minute() +
                                        startTime.hour() * 60;
                                    const subtractedMinutes =
                                        currentMinutes - startMinutes;
                                    percentageWidth =
                                        (subtractedMinutes / 50) * 100;
                                    borderRight =
                                        ".15rem solid hsla(120, 100%, 25%, 1)";
                                } else if (
                                    currentTime.isBefore(startTime, "minute")
                                ) {
                                    percentageWidth = 0;
                                } else if (
                                    currentTime.isAfter(endTime, "minute") ||
                                    currentTime.isSame(endTime, "minute")
                                ) {
                                    percentageWidth = 100;
                                }

                                return (
                                    <>
                                        <Tooltip
                                            title={
                                                schedule.startTime +
                                                "-" +
                                                schedule.endTime
                                            }
                                        >
                                            <TableCell
                                                rowSpan={2}
                                                key={
                                                    "row" +
                                                    schedule.shift +
                                                    schedule.hourly
                                                }
                                                size="small"
                                                align="center"
                                                padding="none"
                                                sx={{
                                                    border: "1px solid white;",
                                                    width: "fit-content",
                                                    position: "relative",
                                                    "::before": {
                                                        content: '""',
                                                        position: "absolute",
                                                        left: 0,
                                                        top: 0,
                                                        backgroundColor:
                                                            "hsla(120, 100%, 25%, 0.4)",
                                                        display: "flex",
                                                        width: `${percentageWidth}%`,
                                                        height: "100%",
                                                        overflow: "hidden",
                                                        borderRight: `${borderRight}`,
                                                        pointerEvents: "none",
                                                    },
                                                }}
                                            >
                                                <Box
                                                    component="span"
                                                    fontWeight="600"
                                                    color={"white"}
                                                >
                                                    {schedule.shift +
                                                        schedule.hourly}
                                                </Box>
                                            </TableCell>
                                        </Tooltip>
                                    </>
                                );
                            })}
                        </OrangeTableRow>
                        <OrangeTableRow>
                            <TableCell
                                size="small"
                                align="center"
                                padding="none"
                            >
                                <Typography
                                    variant="body1"
                                    noWrap
                                    sx={{
                                        fontFamily: "monospace",
                                        fontWeight: 700,
                                        color: "white",
                                        textDecoration: "none",
                                    }}
                                >
                                    HORÁRIOS
                                </Typography>
                            </TableCell>
                        </OrangeTableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
