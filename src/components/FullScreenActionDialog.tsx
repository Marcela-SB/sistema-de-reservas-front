import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { StateContext } from "../context/ReactContext";
import { useState } from "react";
import { RoomT } from "../types/RoomT";
import dayjs, { Dayjs } from "dayjs";
import { UserT } from "../types/UserT";
import { baseInternalSchedule } from "../types/tableSchedules";
import {
    Autocomplete,
    Box,
    Checkbox,
    Chip,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    styled,
    Switch,
    TextField,
} from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers";
import FullScreenTableDialog from "./FullScreenTableDialog";
import axiosInstance from "../utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { ReservationT } from "../types/ReservationT";
import getRoomById from "../utils/getRoomById";
import getUserById from "../utils/getUserById";
import { queryClient } from "../utils/queryClient";
import ConfirmationDialog from "./ConfirmationDialog";
import { Courses } from "../types/Courses";
import {
    CheckBoxOutlineBlankOutlined,
    CheckBoxOutlined,
    Close,
} from "@mui/icons-material";
import { useEnterSubmit } from "../utils/enterKeyButtonActivate";
import { getEnabledDays } from "../utils/getEnabledDays";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const inputNumberStyle = {
    "& input[type=number]": {
        "-moz-appearance": "textfield",
    },
    "& input[type=number]::-webkit-outer-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
    },
    "& input[type=number]::-webkit-inner-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
    },
};

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

type Props = {
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
    text: string;
    selectedReservation: ReservationT | null;
    setSelectedReservation: (r: ReservationT | null) => void;
};

export default function FullScreenActionDialog({
    isOpen,
    setIsOpen,
    text,
    selectedReservation,
    setSelectedReservation,
}: Props) {
    const handleClose = () => {
        createMutation.reset();
        setIsOpen(false);
        setFormName("");
        setFormRoom([]);
        setFormCourse(Courses.NOCOURSE);
        setFormStartDay(dayjs());
        setFormEndDay(dayjs());
        setFormReservatedTo(null);
        setFormSchedule(baseInternalSchedule);
        setFormIsOneDay(true);
        setSelectedReservation(null);
        setFormComment("");
        setFormSlots(null);
    };

    const {
        roomList,
        activeUsersList,
        loggedUser,
        setSnackBarText,
        setSnackBarSeverity,
    } = React.useContext(StateContext);

    const [formName, setFormName] = useState("");

    const [formSlots, setFormSlots] = useState<number | null>(null);

    const [formRoom, setFormRoom] = useState<RoomT[]>([]);

    const [formCourse, setFormCourse] = useState<Courses>(Courses.NOCOURSE);

    const [formStartDay, setFormStartDay] = useState<Dayjs | null>(dayjs());

    const [formIsOneDay, setFormIsOneDay] = useState(true);

    const [formEndDay, setFormEndDay] = useState<Dayjs | null>(dayjs());

    const [formReservatedTo, setFormReservatedTo] = useState<UserT | null>(
        null
    );

    const [formComment, setFormComment] = useState("");
    const [formSchedule, setFormSchedule] = useState<boolean[][]>(baseInternalSchedule);

    const activeDays = getEnabledDays(formStartDay, formEndDay, formIsOneDay);

    React.useEffect(() => {
        if (selectedReservation) {
            setFormName(selectedReservation.name);

            const roomListToPush : RoomT[] = []
            for (const roomId of selectedReservation.roomsId) {
                const room : RoomT = getRoomById(
                    roomId,
                    roomList
                );
                roomListToPush.push(room)
            }
            setFormRoom(roomListToPush);

            setFormCourse(selectedReservation.course);

            setFormStartDay(dayjs(selectedReservation.reservationStart));

            setFormEndDay(dayjs(selectedReservation.reservationEnd));

            if (
                dayjs(selectedReservation.reservationStart).isSame(
                    dayjs(selectedReservation.reservationEnd),
                    "day"
                )
            ) {
                setFormIsOneDay(true);
            } else {
                setFormIsOneDay(false);
            }

            const user: UserT = getUserById(
                selectedReservation.reservatedToId,
                activeUsersList
            );
            setFormReservatedTo(user);

            setFormSchedule(selectedReservation.schedule);

            setFormComment(selectedReservation.comment);

            setFormSlots(selectedReservation.slots);
        }
    }, [selectedReservation]);

    const createMutation = useMutation({
        mutationFn: (header) => {
            return axiosInstance.post("reservation/create", header);
        },
        onSuccess: (_data) => {
            handleClose();
            queryClient.invalidateQueries({
                queryKey: ["reservationListContext"],
            });
            setSnackBarText("Reserva criada com sucesso");
            setSnackBarSeverity("success");
        },
        onError: (error) => {
            const errorMessage = error.response.data || error.response?.data?.error || "Ocorreu um erro desconhecido.";
            setSnackBarText(errorMessage);
            setSnackBarSeverity("error");
        },
    });

    const editMutation = useMutation({
        mutationFn: (header) => {
            return axiosInstance.put(
                "reservation/edit/" + selectedReservation?.id,
                header
            );
        },
        onSuccess: () => {
            handleClose();
            queryClient.invalidateQueries({
                queryKey: ["reservationListContext"],
            });
            setSnackBarText("Reserva editada com sucesso");
            setSnackBarSeverity("success");
        },
        onError: (error) => {
            setSnackBarText(error.response.data);
            setSnackBarSeverity("error");
            alert("DEU ERRO. CHAME O DEV.")
        },
    });

    const onSubmit = () => {
        const formatedStart = formStartDay!
            .startOf("D")
            .format("YYYY-MM-DDTHH:mm:ss");
        let formatedEnd = formEndDay!.endOf("D").format("YYYY-MM-DDTHH:mm:ss");
        if (formIsOneDay) {
            formatedEnd = formStartDay!
                .endOf("D")
                .format("YYYY-MM-DDTHH:mm:ss");
        }

        const roomIdList : string[] = []
        for(const room of formRoom){
            roomIdList.push(room.id)
        }

            const header = {
                name: formName,
                roomsId: roomIdList,
                course: formCourse,
                reservationStart: formatedStart,
                reservationEnd: formatedEnd,
                reservatedToId: formReservatedTo!.id,
                reservationResponsibleId: loggedUser.id,
                schedule: formSchedule,
                comment: formComment,
                slots: formSlots,
            };

            if (selectedReservation) {
                editMutation.mutate(header);
            } else {
                createMutation.mutate(header);
            }
        
    };

    const deleteMutation = useMutation({
        mutationFn: () => {
            return axiosInstance.delete(
                "reservation/delete/" + selectedReservation?.id
            );
        },
        onSuccess: () => {
            handleClose();
            queryClient.invalidateQueries({
                queryKey: ["reservationListContext"],
            });
            setSnackBarText("Reserva deletada com sucesso");
            setSnackBarSeverity("success");
        },
        onError: (error) => {
            setSnackBarText(error.response.data);
            setSnackBarSeverity("error");
        },
    });

    const onRemove = () => {
        deleteMutation.mutate();
    };

    const [isRequestPending, setIsRequestPending] = useState(false);
    React.useEffect(() => {
        setIsRequestPending(
            createMutation.isPending ||
                editMutation.isPending ||
                deleteMutation.isPending
        );
    }, [createMutation, editMutation, deleteMutation]);

    const [isConfirmationDOpen, setIsConfirmationDOpen] = useState(false);
        
    const dialogRef = React.useRef<HTMLDivElement>(null);
    const submitButtonRef = React.useRef<HTMLButtonElement>(null);
    useEnterSubmit(isOpen, submitButtonRef, dialogRef);

    return (
        <React.Fragment>
            <Dialog
                ref={dialogRef}
                fullScreen
                open={isOpen}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <Typography
                            sx={{ ml: 2, flex: 1 }}
                            variant="h6"
                            component="div"
                        >
                            {text.toUpperCase()}
                        </Typography>
                        <Stack direction={"row"} spacing={1}>
                            <Button
                                ref={submitButtonRef}
                                color="success"
                                onClick={onSubmit}
                                disabled={isRequestPending}
                                variant="contained"
                            >
                                {selectedReservation ? "editar" : "salvar"}
                            </Button>
                            {selectedReservation ? (
                                <Button
                                    color="error"
                                    variant="contained"
                                    onClick={() => {
                                        setIsConfirmationDOpen(true);
                                    }}
                                    disabled={isRequestPending}
                                >
                                    excluir
                                </Button>
                            ) : null}
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleClose}
                                disabled={isRequestPending}
                                aria-label="close"
                            >
                                <Close />
                            </IconButton>
                        </Stack>
                    </Toolbar>
                </AppBar>
                <Box sx={{ padding: 2, flexGrow: 1 }}>
                    <Grid container>
                        <Grid item xs={3} paddingX={1}>
                            <TextField
                                id="outlined-controlled"
                                label="Nome da reserva"
                                value={formName}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setFormName(event.target.value);
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2} paddingX={1}>
                            <TextField
                                label="Vagas"
                                value={formSlots}
                                type="number"
                                sx={inputNumberStyle}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setFormSlots(
                                        event.target.value as unknown as number
                                    );
                                }}
                            ></TextField>
                        </Grid>
                        <Grid item xs={3} paddingX={1}>
                            <Autocomplete
                                multiple
                                id="controllable-states-demo"
                                options={roomList}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Sala reservada"
                                        sx={{ flexWrap: "nowrap" }}
                                    />
                                )}
                                limitTags={1}
                                renderTags={(value, getTagProps) =>
                                    value.map((room, index) => {
                                        const { key, ...tagProps } =
                                            getTagProps({ index });
                                        if (index > 0) return;
                                        return (
                                            <Chip
                                                key={key}
                                                variant="outlined"
                                                label={room.name}
                                                size="small"
                                                {...tagProps}
                                            />
                                        );
                                    })
                                }
                                getOptionLabel={(room: RoomT) => {
                                    let roomN = "";
                                    if (room.roomNumber) {
                                        roomN = room.roomNumber;
                                    }
                                    return `${room.name} ${roomN}`;
                                }}
                                value={formRoom}
                                onChange={(event, values) => {
                                    setFormRoom(values);
                                }}
                                renderOption={(props, room, { selected }) => {
                                    const { key, ...optionProps } = props;
                                    let roomN = "";
                                    if (room.roomNumber) {
                                        roomN = room.roomNumber;
                                    }
                                    return (
                                        <li
                                            key={key}
                                            {...optionProps}
                                            style={{}}
                                        >
                                            <Checkbox
                                                icon={
                                                    <CheckBoxOutlineBlankOutlined fontSize="small" />
                                                }
                                                checkedIcon={
                                                    <CheckBoxOutlined fontSize="small" />
                                                }
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {room.name} {roomN}
                                        </li>
                                    );
                                }}
                            />
                        </Grid>
                        <Grid item xs={2} paddingX={1}>
                            <StyledFormControl variant="outlined" fullWidth>
                                <InputLabel id="demo-simple-select-filled-label">
                                    Curso
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-filled-label"
                                    id="demo-simple-select-filled"
                                    value={formCourse}
                                    onChange={(event) => {
                                        setFormCourse(event.target.value);
                                    }}
                                >
                                    <MenuItem value={Courses.TEATRO}>
                                        Teatro
                                    </MenuItem>
                                    <MenuItem value={Courses.ARTES}>
                                        Artes Visuais
                                    </MenuItem>
                                    <MenuItem value={Courses.DESIGN}>
                                        Design
                                    </MenuItem>
                                    <MenuItem value={Courses.DANCA}>
                                        Dança
                                    </MenuItem>
                                    <MenuItem value={Courses.POS}>
                                        Pós Graduação
                                    </MenuItem>
                                    <MenuItem value={Courses.PROJETO}>
                                        Projeto de Extensão
                                    </MenuItem>
                                    <MenuItem value={Courses.NOCOURSE}>
                                        Atividades Diversas
                                    </MenuItem>
                                </Select>
                            </StyledFormControl>
                        </Grid>

                        <Grid item xs={2} paddingX={1}>
                            <TextField
                                id="outlined-controlled"
                                label="Supervisor da reserva"
                                value={loggedUser?.name}
                                disabled
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={3} paddingX={1} paddingTop={1}>
                            <DemoContainer components={["DatePicker"]}>
                                <DatePicker
                                    label="Inicio da reserva"
                                    value={formStartDay}
                                    onChange={(newValue) =>
                                        setFormStartDay(newValue)
                                    }
                                    disablePast
                                    sx={{ width: "100%" }}
                                />
                            </DemoContainer>
                        </Grid>
                        <Grid item xs={2} paddingX={0} paddingTop={1.5}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formIsOneDay}
                                        onChange={(event) => {
                                            setFormIsOneDay(
                                                event.target.checked
                                            );
                                        }}
                                        inputProps={{
                                            "aria-label": "controlled",
                                        }}
                                    />
                                }
                                labelPlacement="top"
                                label="Reserva unitária"
                                sx={{ width: "100%", marginX: 0 }}
                            />
                        </Grid>
                        {formIsOneDay == true ? (
                            <Grid item xs={3} paddingX={1} paddingTop={1}>
                                <DemoContainer components={["DatePicker"]}>
                                    <DatePicker
                                        label="Final da reserva"
                                        value={formEndDay}
                                        disabled
                                        sx={{ width: "100%" }}
                                    />
                                </DemoContainer>
                            </Grid>
                        ) : (
                            <Grid item xs={3} paddingX={1} paddingTop={1}>
                                <DemoContainer components={["DatePicker"]}>
                                    <DatePicker
                                        label="Final da reserva"
                                        value={formEndDay}
                                        onChange={(newValue) =>
                                            setFormEndDay(newValue)
                                        }
                                        disablePast
                                        sx={{ width: "100%" }}
                                    />
                                </DemoContainer>
                            </Grid>
                        )}
                        <Grid item xs paddingX={1} paddingTop={2}>
                            <Autocomplete
                                value={formReservatedTo}
                                onChange={(
                                    _event: any,
                                    newValue: UserT | null
                                ) => {
                                    setFormReservatedTo(newValue);
                                }}
                                id="controllable-states-demo"
                                options={activeUsersList}
                                getOptionLabel={(user: UserT) => {
                                    return user.name;
                                }}
                                sx={{ flexGrow: 1 }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Sala reservada para..."
                                    />
                                )}
                            />
                        </Grid>
                        <Grid container sx={{ marginTop: 2, paddingX: 1 }}>
                            <Grid item xs={3} sx={{ paddingRight: 2 }}>
                                <TextField
                                    label="Observações"
                                    value={formComment}
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        setFormComment(event.target.value);
                                    }}
                                    multiline
                                    fullWidth
                                    rows={14}
                                />
                            </Grid>
                            <Grid item xs={9}>
                                <FullScreenTableDialog
                                    formSchedule={formSchedule}
                                    setFormSchedule={setFormSchedule}
                                    activeDays={activeDays}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
                {selectedReservation ? (
                    <ConfirmationDialog
                        setIsOpen={setIsConfirmationDOpen}
                        isOpen={isConfirmationDOpen}
                        toExclude={selectedReservation.name}
                        excludeFunction={onRemove}
                    />
                ) : null}
            </Dialog>
        </React.Fragment>
    );
}
