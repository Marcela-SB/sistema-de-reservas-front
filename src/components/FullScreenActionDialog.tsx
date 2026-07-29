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
import dayjs, { Dayjs } from "dayjs";
import { UserT } from "../types/UserT";
import { baseInternalSchedule } from "../types/tableSchedules";
import { RoomsSchedule, ReservationT } from "../types/ReservationT";
import {
    Autocomplete,
    Box,
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
import RoomsScheduleTable from "./RoomsScheduleTable";
import axiosInstance from "../utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../utils/queryClient";
import ConfirmationDialog from "./ConfirmationDialog";
import { Courses } from "../types/Courses";
import {
    CleaningServices,
    Close,
    Delete,
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
        setFormCourse(Courses.NOCOURSE);
        setFormStartDay(dayjs());
        setFormEndDay(dayjs());
        setFormReservatedTo(null);
        setFormRoomsSchedules([{
            id: "", roomsId: [], schedule: baseInternalSchedule()
        }]);
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
    const [formCourse, setFormCourse] = useState<Courses>(Courses.NOCOURSE);
    const [formStartDay, setFormStartDay] = useState<Dayjs | null>(dayjs());
    const [formIsOneDay, setFormIsOneDay] = useState(true);
    const [formEndDay, setFormEndDay] = useState<Dayjs | null>(dayjs());
    const [formReservatedTo, setFormReservatedTo] = useState<UserT | null>(null);
    const [formComment, setFormComment] = useState("");
    const [formRoomsSchedules, setFormRoomsSchedules] = useState<RoomsSchedule[]>([
        { roomsId: [], schedule: baseInternalSchedule() }
    ]);

    const activeDays = React.useMemo(() => 
        getEnabledDays(formStartDay, formEndDay, formIsOneDay), 
    [formStartDay, formEndDay, formIsOneDay]);

    React.useEffect(() => {
        if (selectedReservation) {
            const start = dayjs(selectedReservation.reservationStart);
            const end = dayjs(selectedReservation.reservationEnd);
            const isOneDay = start.isSame(end, "day");

            setFormName(selectedReservation.name);
            setFormStartDay(start);
            setFormEndDay(end);
            setFormIsOneDay(isOneDay);

            if (activeUsersList && activeUsersList.length > 0) {
                const user = activeUsersList.find(u => u.id === selectedReservation.reservatedToId);
                setFormReservatedTo(user || null);
            }
            
            setFormCourse(selectedReservation.course as Courses);
            setFormRoomsSchedules(
                selectedReservation.schedules && selectedReservation.schedules.length > 0
                    ? selectedReservation.schedules
                    : [{ roomsId: selectedReservation.roomsId || [], schedule: baseInternalSchedule() }]
            );
            setFormComment(selectedReservation.comment || "");
            setFormSlots(selectedReservation.slots);
        }
    }, [selectedReservation, roomList, activeUsersList]);

    // Limpeza de linhas selecionadas que foram bloqueadas em todas as tabelas
    React.useEffect(() => {
        if (selectedReservation) return;
        setFormRoomsSchedules((current) => {
            return current.map((item) => {
                const newSchedule = item.schedule.map((daySchedule, dayIndex) => {
                    if (!activeDays.includes(dayIndex)) {
                        return daySchedule.map(() => false);
                    }
                    return daySchedule;
                });
                return { ...item, schedule: newSchedule };
            });
        });
    }, [activeDays, selectedReservation]);

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
        onError: (error: any) => {
            const errorMessage = error.response?.data || error.response?.data?.error || "Ocorreu um erro desconhecido.";
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
        onError: (error: any) => {
            const errorMessage = error.response?.data || error.response?.data?.error || "Ocorreu um erro desconhecido.";
            setSnackBarText(errorMessage);
            setSnackBarSeverity("error");
        },
    });

    const onSubmit = () => {
        if (!formName) {
            setSnackBarText("Por favor, nomeie a reserva.");
            setSnackBarSeverity("error");
            return;
        }

        if (!formReservatedTo) {
            setSnackBarText("Por favor, selecione o usuário da reserva.");
            setSnackBarSeverity("error");
            return;
        }

        // Validação da lista de salas e da tabela de horários (RoomsSchedule)
        if (!formRoomsSchedules || formRoomsSchedules.length === 0) {
            setSnackBarText("Por favor, adicione ao menos um grupo de salas e horários.");
            setSnackBarSeverity("error");
            return;
        }

        for (const item of formRoomsSchedules) {
            // Verifica se a lista de salas está vazia ou nula
            if (!item.roomsId || item.roomsId.length === 0) {
                setSnackBarText("Por favor, selecione ao menos uma sala em todos os grupos.");
                setSnackBarSeverity("error");
                return;
            }

            // Verifica se a tabela de horários está vazia/nula ou sem nenhum horário selecionado (true)
            if (!item.schedule || item.schedule.length === 0) {
                setSnackBarText("A tabela de horários não pode estar vazia.");
                setSnackBarSeverity("error");
                return;
            }

            const hasSelectedSchedule = item.schedule.some(daySchedule => 
                Array.isArray(daySchedule) && daySchedule.some(slot => slot === true)
            );

            if (!hasSelectedSchedule) {
                setSnackBarText("Por favor, selecione ao menos um horário na tabela.");
                setSnackBarSeverity("error");
                return;
            }
        }

        const formatedStart = formStartDay!
            .startOf("D")
            .format("YYYY-MM-DDTHH:mm:ss");
        let formatedEnd = formEndDay!.endOf("D").format("YYYY-MM-DDTHH:mm:ss");
        if (formIsOneDay) {
            formatedEnd = formStartDay!
                .endOf("D")
                .format("YYYY-MM-DDTHH:mm:ss");
        }

        // Consolida todas as salas selecionadas em todos os blocos para o campo raiz 'roomsId' (caso o back-end exija)
        // const allRoomsIdSet = new Set<string>();
        // formRoomsSchedules.forEach(item => {
        //     item.roomsId.forEach(id => allRoomsIdSet.add(id));
        // });

        const header = {
            name: formName,
            // roomsId: Array.from(allRoomsIdSet),
            course: formCourse,
            reservationStart: formatedStart,
            reservationEnd: formatedEnd,
            reservatedToId: formReservatedTo!.id,
            reservationResponsibleId: loggedUser.id,
            schedules: formRoomsSchedules,
            comment: formComment,
            slots: formSlots,
        };

        if (selectedReservation) {
            editMutation.mutate(header as any);
        } else {
            createMutation.mutate(header as any);
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
        onError: (error: any) => {
            setSnackBarText(error.response?.data);
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
                                onChange={(event) => setFormName(event.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={3} paddingX={1}>
                            <TextField
                                label="Vagas"
                                value={formSlots || ""}
                                type="number"
                                sx={inputNumberStyle}
                                onChange={(event) => setFormSlots(event.target.value as unknown as number)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={3} paddingX={1}>
                            <StyledFormControl variant="outlined" fullWidth>
                                <InputLabel id="demo-simple-select-filled-label">Curso</InputLabel>
                                <Select
                                    labelId="demo-simple-select-filled-label"
                                    id="demo-simple-select-filled"
                                    value={formCourse}
                                    onChange={(event) => setFormCourse(event.target.value as Courses)}
                                >
                                    <MenuItem value={Courses.TEATRO}>Teatro</MenuItem>
                                    <MenuItem value={Courses.ARTES}>Artes Visuais</MenuItem>
                                    <MenuItem value={Courses.DESIGN}>Design</MenuItem>
                                    <MenuItem value={Courses.DANCA}>Dança</MenuItem>
                                    <MenuItem value={Courses.POS}>Pós Graduação</MenuItem>
                                    <MenuItem value={Courses.PROJETO}>Projeto de Extensão</MenuItem>
                                    <MenuItem value={Courses.NOCOURSE}>Atividades Diversas</MenuItem>
                                </Select>
                            </StyledFormControl>
                        </Grid>

                        <Grid item xs={3} paddingX={1}>
                            <TextField
                                label="Supervisor da reserva"
                                value={loggedUser?.name || ""}
                                disabled
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={3} paddingX={1} paddingTop={1}>
                            <DemoContainer components={["DatePicker"]}>
                                <DatePicker
                                    label="Inicio da reserva"
                                    value={formStartDay}
                                    onChange={(newValue) => {
                                        setFormStartDay(newValue)
                                        if (formIsOneDay || (newValue && formEndDay && newValue.isAfter(formEndDay))) {
                                            setFormEndDay(newValue);
                                        }
                                    }}
                                    disablePast
                                    sx={{ width: "100%" }}
                                />
                            </DemoContainer>
                        </Grid>
                        <Grid item xs={3} paddingX={0} paddingTop={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formIsOneDay}
                                        onChange={(event) => setFormIsOneDay(event.target.checked)}
                                    />
                                }
                                labelPlacement="top"
                                label="Reserva unitária"
                                sx={{ width: "100%", marginX: 0 }}
                            />
                        </Grid>
                        <Grid item xs={3} paddingX={1} paddingTop={1}>
                            <DemoContainer components={["DatePicker"]}>
                                <DatePicker
                                    label="Final da reserva"
                                    value={
                                        formIsOneDay 
                                            ? formStartDay 
                                            : (formEndDay?.isBefore(formStartDay) ? formStartDay : formEndDay)
                                    }
                                    minDate={formStartDay || dayjs()}
                                    onChange={(newValue) => setFormEndDay(newValue)}
                                    disabled={formIsOneDay}
                                    disablePast
                                    sx={{ width: "100%" }}
                                />
                            </DemoContainer>
                        </Grid>
                        <Grid item xs={3} paddingX={1} paddingTop={2}>
                            <Autocomplete
                                value={formReservatedTo}
                                onChange={(_event: any, newValue: UserT | null) => {
                                    setFormReservatedTo(newValue);
                                }}
                                options={activeUsersList}
                                getOptionLabel={(user: UserT) => user.name}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Sala reservada para..."
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                    <Grid item sx={{ marginTop: 1.5}} paddingX={1}>
                        <TextField
                            label="Observações"
                            value={formComment}
                            onChange={(event) => setFormComment(event.target.value)}
                            multiline
                            fullWidth
                            rows={1}
                        />
                    </Grid>
                </Box>

                {/* Renderização dinâmica dos blocos RoomsSchedule */}
                <Box sx={{ padding: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 4, px: 10}}>
                    {formRoomsSchedules.map((roomScheduleItem, index) => {
                        const selectedRoomsObjects = roomList?.filter((r) => 
                            roomScheduleItem.roomsId?.includes(r.id)
                        ) || [];

                        return (
                            <Box key={index} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {/* Seletor de Salas específico deste bloco */}
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Autocomplete
                                            multiple
                                            options={roomList || []}
                                            getOptionLabel={(room) => room.name +" - "+ room.roomNumber}
                                            value={selectedRoomsObjects}
                                            onChange={(_e, newValue) => {
                                                const ids = newValue.map((r) => r.id);
                                                setFormRoomsSchedules((prev) => {
                                                    const updated = [...prev];
                                                    updated[index] = { ...updated[index], roomsId: ids };
                                                    return updated;
                                                });
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} label={`Salas para este horário (Bloco ${index + 1})`} placeholder="Selecione as salas" />
                                            )}
                                        />
                                    </Box>

                                    {/* Botões de Ação por Bloco */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {/* Botão de Excluir Bloco (disponível apenas se houver 2 ou mais blocos no total) */}
                                        {formRoomsSchedules.length > 1 && (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                title="Excluir este bloco"
                                                sx={{ minWidth: '40px', height: '56px', padding: 0 }}
                                                onClick={() => {
                                                    setFormRoomsSchedules((prev) => prev.filter((_, i) => i !== index));
                                                }}
                                            >
                                                <Delete />
                                            </Button>
                                        )}

                                        {/* Botão de Limpar (disponível para limpar os dados da tabela atual) */}
                                        <Button
                                            variant="contained"
                                            color="warning" 
                                            title="Limpar dados deste bloco"
                                            sx={{ minWidth: '40px', height: '56px', padding: 0 }}
                                            onClick={() => {
                                                setFormRoomsSchedules((prev) => {
                                                    const updated = [...prev];
                                                    updated[index] = { roomsId: [], schedule: baseInternalSchedule() };
                                                    return updated;
                                                });
                                            }}
                                        >
                                            <CleaningServices />
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Tabela de Horários */}
                                <RoomsScheduleTable
                                    formSchedule={roomScheduleItem.schedule}
                                    setFormSchedule={(newSched) => {
                                        setFormRoomsSchedules((prev) => {
                                            const updated = [...prev];
                                            const resolvedSchedule = typeof newSched === 'function' 
                                                ? newSched(updated[index].schedule) 
                                                : newSched;
                                            updated[index] = { ...updated[index], schedule: resolvedSchedule };
                                            return updated;
                                        });
                                    }}
                                    activeDays={activeDays}
                                />
                            </Box>
                        );
                    })}
                </Box>

                {/* Botão para Adicionar Novo Bloco de Sala-Horário */}
                <Box
                    flex={1}
                    display={'flex'}
                    justifyContent={'center'}
                    pb={5}
                >
                    <Button 
                        variant="contained"
                        onClick={() => {
                            setFormRoomsSchedules((prev) => [
                                ...prev, 
                                { roomsId: [], schedule: baseInternalSchedule() }
                            ]);
                        }}
                    >
                        Adicionar nova Sala-Horário
                    </Button>
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