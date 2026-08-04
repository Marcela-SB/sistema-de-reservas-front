import * as React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Box, Divider, IconButton, Stack } from "@mui/material";
import { ReservationT } from "../types/ReservationT";
import CloseIcon from "@mui/icons-material/Close";
import getRoomById from "../utils/getRoomById";
import { StateContext } from "../context/ReactContext";
import getUserById from "../utils/getUserById";
import dayjs from "dayjs";
import ReservationDetailsTable from "./ReservationDetailsTable";
import textfyCourse from "../utils/textfyCourse";
import PaperComponent from "./PaperComponent";
import DraggablePaper from "./DraggablePaper";
import { RoomT } from "../types/RoomT";
import { Edit } from "@mui/icons-material";
import { useEnterSubmit } from "../utils/enterKeyButtonActivate";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
    reservation: ReservationT;
    setReservationToEdit: (r: ReservationT) => void;
    setEditIsOpen: (b: boolean) => void;
};

export default function ReservationDetailsDialog({
    isOpen,
    setIsOpen,
    reservation,
    setReservationToEdit,
    setEditIsOpen
}: Props) {
    const { roomList, allUsersList } = React.useContext(StateContext);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleEdit = () => {
        handleClose();
        setReservationToEdit(reservation);
        setEditIsOpen(true);
    };

    const reservationRoomList: RoomT[] = [];
    if (Array.isArray(reservation.schedules)) {
        for (const scheduleObj of reservation.schedules) {
            if (Array.isArray(scheduleObj.roomsId)) {
                for (const roomId of scheduleObj.roomsId) {
                    const foundRoom = getRoomById(roomId, roomList);
                    if (foundRoom && !reservationRoomList.some((r) => r.id === foundRoom.id)) {
                        reservationRoomList.push(foundRoom);
                    }
                }
            }
        }
    }

    const startDate = dayjs(reservation.reservationStart).format("DD/MM/YYYY");
    const endDate = dayjs(reservation.reservationEnd).format("DD/MM/YYYY");
            
    const dialogRef = React.useRef<HTMLDivElement>(null);
    const submitButtonRef = React.useRef<HTMLButtonElement>(null);
    useEnterSubmit(isOpen, submitButtonRef, dialogRef);

    return (
        <DraggablePaper>
            <Dialog
                ref={dialogRef}
                maxWidth={"md"}
                fullWidth
                open={isOpen}
                onClose={handleClose}
                TransitionComponent={Transition}
                PaperComponent={PaperComponent}
                hideBackdrop
                PaperProps={{
                    elevation: 0,
                    sx: {
                        border: "solid 1px #004586",
                        maxHeight: "80vh",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    },
                }}
                disableEnforceFocus
                style={{
                    top: "10%",
                    left: "25%",
                }}
            >
                <AppBar
                    sx={{ position: "relative" }}
                    className="draggable-dialog"
                >
                    <Toolbar>
                        <Typography
                            sx={{ ml: 0, flex: 1 }}
                            variant="h6"
                            component="div"
                        >
                            Detalhes da reserva
                        </Typography>
                        <Stack direction={"row"} spacing={1} >
                            <IconButton
                                ref={submitButtonRef}
                                edge="start"
                                color="inherit"
                                onClick={handleEdit}
                                aria-label="edit"
                            >
                                <Edit />
                            </IconButton>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleClose}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </Toolbar>
                </AppBar>
                <Box 
                    sx={{ 
                        padding: 2, 
                        flexGrow: 1, 
                        overflowY: "auto", 
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <Stack 
                        direction={"column"}
                        spacing={2} 
                        divider={
                            <Divider orientation="horizontal" flexItem />
                        }
                    >
                        <Stack
                            direction={"row"}
                            sx={{ minWidth: 0 }}
                            divider={
                                <Divider orientation="vertical" flexItem />
                            }
                            spacing={2}
                        >
                            <Box width={"50%"} flexGrow={1}>
                                <Typography variant="body1" noWrap>
                                    Nome da reserva: {reservation.name}
                                </Typography>
                                <Typography variant="body1" noWrap>
                                    Vagas da reserva: {reservation.slots}
                                </Typography>
                                <Typography variant="body1" noWrap>
                                    Curso: {textfyCourse(reservation.course)}
                                </Typography>
                                <Typography variant="body1" noWrap>
                                    Reservador por: {getUserById(reservation.reservatedToId, allUsersList)?.name}
                                </Typography>
                                <Typography variant="body1" noWrap>
                                    Duração da reserva: {startDate}
                                    {reservation.reservationEnd.split('T')[0] !== reservation.reservationStart.split('T')[0] && ` - ${endDate}`}
                                </Typography>
                                <Typography variant="body1" noWrap>
                                    Responsavel pela reserva: {getUserById(reservation.reservationResponsibleId, allUsersList)?.name}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2">
                                    Observações:
                                </Typography>
                                <Typography variant="body2">
                                    {reservation.comment}
                                </Typography>
                            </Box>
                        </Stack>

                        {Array.isArray(reservation.schedules) && reservation.schedules.map((singleSchedule, index) => {
                            // Mapeia os IDs das salas do schedule atual para os objetos reais de sala
                            const scheduleRooms = (singleSchedule.roomsId || []).map((roomId) => 
                                getRoomById(roomId, roomList)
                            ).filter(Boolean);

                            return (
                                <Box key={`schedule-block-${index}`} display="flex" flexDirection="column" gap={1}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {reservation.hasMultipleDates && <>
                                            <b>Período:</b> {dayjs(singleSchedule.startDate).format("DD/MM/YYYY")} - {dayjs(singleSchedule.endDate).format("DD/MM/YYYY")}
                                            <br />
                                        </>}

                                        <b>Salas reservadas neste horário:</b> {scheduleRooms.map((room, rIndex) => (
                                            <span key={room?.id || rIndex}>
                                                {room?.name} - {room?.roomNumber}{rIndex < scheduleRooms.length - 1 ? ", " : ""}
                                            </span>
                                        ))}
                                    </Typography>
                                    <ReservationDetailsTable
                                        formSchedule={singleSchedule.schedule}
                                        reservationStart={reservation.reservationStart}
                                        reservationEnd={reservation.reservationEnd}
                                    />
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            </Dialog>
        </DraggablePaper>
    );
}