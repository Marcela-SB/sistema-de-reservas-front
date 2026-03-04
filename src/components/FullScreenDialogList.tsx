import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import ScrollableList from "./ScrollableList";
import { ReservationT } from "../types/ReservationT";
import { StateContext } from "../context/ReactContext";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { RoomT } from "../types/RoomT";
import dayjs, { Dayjs } from "dayjs";
import { UserT } from "../types/UserT";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers";
import PaperComponent from "./PaperComponent";
import DraggablePaper from "./DraggablePaper";
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
    text: string;
    setSelectedReservation: (r: ReservationT | null) => void;
    setReservationDIsOpen: (b: boolean) => void;
};

export default function FullScreenDialogList({
    isOpen,
    setIsOpen,
    text,
    setSelectedReservation,
    setReservationDIsOpen,
}: Props) {
    const handleClose = () => {
        setIsOpen(false);
    };

    const [optionsList, setOptionsList] = useState<ReservationT[]>([]);

    const [formSchedule, setFormSchedule] = useState<boolean[]>([
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ]);

    const [formRoom, setFormRoom] = useState<RoomT | null>(null);

    const [formStartDay, setFormStartDay] = useState<Dayjs | null>(null);

    const [formEndDay, setFormEndDay] = useState<Dayjs | null>(null);

    const [formReservatedTo, setFormReservatedTo] = useState<UserT | null>(
        null
    );

    const [formResponsible, setFormResponsible] = useState<UserT | null>(null);

    const [selectedInternalReservation, setSelectedInternalReservation] =
        useState<ReservationT | null>(null);

    const { roomList, allUsersList, reservationList } =
        React.useContext(StateContext);

    const submitReservation = () => {
        setSelectedReservation(selectedInternalReservation);
        setSelectedInternalReservation(null);
        handleClose();
        setReservationDIsOpen(true);
    };

    React.useEffect(() => {
        if (reservationList) {
            let holderList = reservationList;

            if (formRoom) {
                holderList = holderList.filter(
                    (r: ReservationT) => r.roomsId.some(
                        (roomId : string) => roomId == formRoom.id
                    ) 
                );
            }

            if (formReservatedTo) {
                holderList = holderList.filter(
                    (r: ReservationT) => r.reservatedToId == formReservatedTo.id
                );
            }

            if (formResponsible) {
                holderList = holderList.filter(
                    (r: ReservationT) => r.reservatedToId == formResponsible.id
                );
            }

            if (formStartDay) {
                holderList = holderList.filter((r: ReservationT) => {
                    if (
                        dayjs(r.reservationStart).isAfter(
                            dayjs(formStartDay),
                            "day"
                        ) ||
                        dayjs(r.reservationStart).isSame(
                            dayjs(formStartDay),
                            "day"
                        )
                    ) {
                        return true;
                    }
                });
            }


            if (formEndDay) {
                holderList = holderList.filter((r: ReservationT) => {
                    if (
                        dayjs(r.reservationStart).isBefore(
                            dayjs(formEndDay),
                            "day"
                        ) ||
                        dayjs(r.reservationStart).isSame(
                            dayjs(formEndDay),
                            "day"
                        )
                    ) {
                        return true;
                    }
                });
            }


            if (formSchedule) {
                if (formSchedule.some((formS: boolean) => formS)) {
                    holderList = holderList.filter((r: ReservationT) => {
                        return r.schedule.some((daylySchdule: boolean[]) => {
                            return daylySchdule.some(
                                (
                                    hourlySchedule: boolean,
                                    hourlyIndex: number
                                ) => {
                                    if (
                                        hourlySchedule &&
                                        formSchedule[hourlyIndex]
                                    ) {
                                        return true;
                                    }
                                }
                            );
                        });
                    });
                }
            }


            setOptionsList([...holderList]);
        }
    }, [
        reservationList,
        formRoom,
        formReservatedTo,
        formResponsible,
        formStartDay,
        formEndDay,
        formSchedule,
    ]);
        
    const dialogRef = React.useRef<HTMLDivElement>(null);
    const submitButtonRef = React.useRef<HTMLButtonElement>(null);
    useEnterSubmit(isOpen, submitButtonRef, dialogRef);

    return (
        <DraggablePaper>
            <Dialog
                ref={dialogRef}
                open={isOpen}
                onClose={handleClose}
                TransitionComponent={Transition}
                PaperComponent={PaperComponent}
                hideBackdrop
                PaperProps={{
                    elevation: 0,
                    sx: {
                        border: "solid 1px #004586",
                    },
                }}
                disableEnforceFocus
                style={{
                    top: "30%",
                    left: "30%",
                    height: "fit-content",
                    width: "36.5rem",
                }}
            >
                <AppBar
                    sx={{ position: "relative" }}
                    className="draggable-dialog"
                >
                    <Toolbar>
                        <Typography
                            sx={{ ml: 2, flex: 1 }}
                            variant="h6"
                            component="div"
                        >
                            {text.toUpperCase()}
                        </Typography>
                        <Button color="inherit" onClick={handleClose}>
                            cancelar
                        </Button>
                    </Toolbar>
                </AppBar>

                <Stack direction={"row"} height={"85%"} padding={2} gap={2}>
                    <ScrollableList
                        formSchedule={formSchedule}
                        setFormSchedule={setFormSchedule}
                    />
                    <Stack
                        direction={"column"}
                        justifyContent={"space-between"}
                    >
                        <Autocomplete
                            value={formRoom}
                            onChange={(
                                _event: React.SyntheticEvent<Element, Event>,
                                newValue: RoomT | null
                            ) => {
                                setFormRoom(newValue);
                            }}
                            id="controllable-states-demo"
                            options={roomList}
                            getOptionLabel={(room: RoomT) => {
                                let roomN = "";
                                if (room.roomNumber) {
                                    roomN = room.roomNumber;
                                }
                                return `${room.name} ${roomN}`;
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Sala reservada" />
                            )}
                        />
                        <Autocomplete
                            value={formReservatedTo}
                            onChange={(
                                _event: React.SyntheticEvent<Element, Event>,
                                newValue: UserT | null
                            ) => {
                                setFormReservatedTo(newValue);
                            }}
                            id="controllable-states-demo"
                            options={allUsersList}
                            getOptionLabel={(user: UserT) => {
                                return user.name + (user.active ? "" : " (inativo)");
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Sala reservada para..."
                                />
                            )}
                        />
                        <Autocomplete
                            value={formResponsible}
                            onChange={(
                                _event: React.SyntheticEvent<Element, Event>,
                                newValue: UserT | null
                            ) => {
                                setFormResponsible(newValue);
                            }}
                            id="controllable-states-demo"
                            options={allUsersList}
                            getOptionLabel={(user: UserT) => {
                                return user.name + (user.active ? "" : " (inativo)");
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Sala reservada por..."
                                />
                            )}
                        />
                        <DemoContainer components={["DatePicker"]}>
                            <DatePicker
                                label="Inicio da reserva"
                                value={formStartDay}
                                onChange={(newValue) =>
                                    setFormStartDay(newValue)
                                }
                                sx={{ width: "100%" }}
                            />
                        </DemoContainer>
                        <DemoContainer components={["DatePicker"]}>
                            <DatePicker
                                label="Final da reserva"
                                value={formEndDay}
                                onChange={(newValue) => setFormEndDay(newValue)}
                                sx={{ width: "100%" }}
                            />
                        </DemoContainer>
                    </Stack>
                </Stack>
                <Autocomplete
                    sx={{ padding: 2 }}
                    value={selectedInternalReservation}
                    onChange={(_event: any, newValue: ReservationT | null) => {
                        setSelectedInternalReservation(newValue);
                    }}
                    id="controllable-states-demo"
                    options={optionsList}
                    getOptionLabel={(reservation: ReservationT) => {
                        return reservation.name;
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Reserva selecionada..." />
                    )}
                    noOptionsText={'Sem reservas correspondentes.'}
                />
                <Button
                    ref={submitButtonRef}
                    variant="contained"
                    sx={{ marginX: 6, marginBottom: 2 }}
                    onClick={submitReservation}
                >
                    Continuar
                </Button>
            </Dialog>
        </DraggablePaper>
    );
}
