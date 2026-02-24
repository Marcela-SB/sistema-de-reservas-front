import * as React from "react";
import { useEffect, useState, useContext, useRef } from "react";
import {
    Button, Dialog, DialogProps, AppBar, Toolbar, Typography, Slide,
    Stack, TextField, Autocomplete, FormControl, List, IconButton
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { Close } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { useMutation } from "@tanstack/react-query";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { TimePicker } from "@mui/x-date-pickers";

import { RoomT } from "../types/RoomT";
import { UserT } from "../types/UserT";
import { StateContext } from "../context/ReactContext";
import axiosInstance from "../utils/axiosInstance";
import { queryClient } from "../utils/queryClient";
import CheckUserDialog from "./CheckUserDialog";
import DraggablePaper from "./DraggablePaper";
import PaperComponent from "./PaperComponent";
import roomDynamicSort from "../utils/roomDynamicSort.ts";
import KeyWithdrawRoomList from "./KeyWithdrawRoomList.tsx";
import { useEnterSubmit } from "../utils/enterKeyButtonActivate.ts";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
};

export default function KeyWithdraDialog({ isOpen, setIsOpen }: Props) {
    const {
        roomList,
        activeUsersList,
        loggedUser,
        setSnackBarText,
        setSnackBarSeverity,
    } = useContext(StateContext);

    // ESTADOS DO FORMULÁRIO
    const [searchedText, setSearchedText] = useState<string>("");
    const [formRoom, setFormRoom] = useState<RoomT[]>([]);
    const [formWithdrawTime, setFormWithdrawTime] = useState<Dayjs | null>(dayjs());
    const [formReturnTime, setFormReturnTime] = useState<Dayjs | null>(null);
    const [formReservatedTo, setFormReservatedTo] = useState<UserT | null>(null);
    
    // ESTADOS DE CONTROLE
    const [checkDialogIsOpen, setCheckDialogIsOpen] = useState(false);
    const [checkSucess, setCheckSucess] = useState(false);
    const [filteredRoomArray, setFilteredRoomArray] = useState<RoomT[]>([]);

    const cleanInputs = () => {
        setFormRoom([]);
        setFormWithdrawTime(dayjs());
        setFormReturnTime(null);
        setFormReservatedTo(null);
        setSearchedText("");
    };

    const handleClose: DialogProps["onClose"] = (event, reason) => {
        if (reason && reason === "backdropClick") return;
        setIsOpen(false);
        cleanInputs();
    };

    const createMutation = useMutation({
        mutationFn: (header: any) => axiosInstance.post("keydelivery/create", header),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["keyListContext"] });
            setSnackBarText("Entrega de chave criada com sucesso");
            setSnackBarSeverity("success");
            //setIsOpen(false);
            cleanInputs();
        },
        onError: (error: any) => {
            setSnackBarText(error.response?.data || "Erro ao criar retirada");
            setSnackBarSeverity("error");
        },
    });

    // Filtro de salas
    useEffect(() => {
        if (roomList) {
            const filtered = roomList
                .filter((room: RoomT) =>
                    room.name?.toLowerCase().includes(searchedText.toLowerCase())
                )
                .sort(roomDynamicSort());
            setFilteredRoomArray(filtered);
        }
    }, [searchedText, roomList]);

    // Envio após validação do CheckUserDialog
    useEffect(() => {
        if (checkSucess && formRoom.length > 0) {
            formRoom.forEach((room) => {
                const header = {
                    roomId: room.id,
                    withdrawResponsibleId: loggedUser.id,
                    responsibleForTheKeyId: formReservatedTo?.id,
                    withdrawTime: formWithdrawTime?.format("YYYY-MM-DDTHH:mm:ss"),
                    returnPrevision: formReturnTime?.format("YYYY-MM-DDTHH:mm:ss") || null,
                    isKeyReturned: false,
                };
                createMutation.mutate(header);
            });
            setCheckSucess(false);
        }
    }, [checkSucess]);

    const submitWithdraw = () => {
        if (formReservatedTo && formRoom.length > 0) {
            setCheckDialogIsOpen(true);
        } else {
            setSnackBarText("Selecione ao menos uma sala e o responsável");
            setSnackBarSeverity("error");
        }
    };

    // Função de toggle de sala corrigida (imutabilidade)
    const changeRoomList = (room: RoomT) => {
        setFormRoom((prev) => {
            const exists = prev.find((r) => r.id === room.id);
            if (exists) return prev.filter((r) => r.id !== room.id);
            return [...prev, room];
        });
    };

    const dialogRef = useRef<HTMLDivElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    useEnterSubmit(isOpen, submitButtonRef, dialogRef);

    return (
        <DraggablePaper>
            <Dialog
                ref={dialogRef}
                open={isOpen}
                onClose={handleClose}
                TransitionComponent={Transition}
                fullWidth
                maxWidth={false} // Desabilita o maxWidth padrão para respeitar o style width
                PaperComponent={PaperComponent}
                hideBackdrop
                PaperProps={{
                    elevation: 0,
                    sx: {
                        border: "solid 1px #004586",
                    },
                }}
                disableEnforceFocus
                // MANTIDO: Estilos originais de posicionamento e tamanho
                style={{
                    top: "30%",
                    left: "30%",
                    height: "fit-content",
                    width: "42rem",
                }}
            >
                <AppBar sx={{ position: "relative" }} className="draggable-dialog">
                    <Toolbar>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" textAlign="center">
                            RETIRADA DE CHAVE
                        </Typography>
                        <IconButton edge="start" color="inherit" onClick={handleClose}>
                            <Close />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Stack direction="row" justifyContent="space-between" marginX={2} gap={2} marginTop={2}>
                    <Stack
                        direction="column"
                        sx={{
                            width: "50%", // Garante divisão proporcional
                            border: "solid 1px rgba(0, 0, 0, 0.26)",
                            borderRadius: ".5rem .5rem 2% 2%",
                        }}
                    >
                        <List sx={{ overflow: "auto", height: "18rem" }}>
                            {(roomList || []).sort(roomDynamicSort()).map((room, index) => {
                                const isVisible = filteredRoomArray.some((f) => f.id === room.id);
                                return (
                                    <KeyWithdrawRoomList
                                        key={`${room.id}-${index}`}
                                        changeRoomList={changeRoomList}
                                        room={room}
                                        checkSucess={checkSucess}
                                        visible={isVisible}
                                    />
                                );
                            })}
                        </List>
                        <FormControl>
                            <TextField
                                label="Nome do espaço"
                                placeholder="Digite o nome do espaço"
                                sx={{ margin: 2 }}
                                value={searchedText}
                                onChange={(e) => setSearchedText(e.target.value)}
                            />
                        </FormControl>
                    </Stack>

                    <Stack direction="column" justifyContent="space-evenly" gap={2} sx={{ width: "50%" }}>
                        <Autocomplete
                            value={formReservatedTo}
                            onChange={(_, newValue) => setFormReservatedTo(newValue)}
                            options={activeUsersList || []}
                            getOptionLabel={(user: UserT) => user.name || ""}
                            renderInput={(params) => <TextField {...params} label="Sala reservada para..." />}
                        />
                        
                        <TextField label="Supervisor da reserva" value={loggedUser?.name || ""} disabled fullWidth />

                        <DemoContainer components={["TimePicker"]}>
                            <TimePicker
                                label="Hora de retirada"
                                value={formWithdrawTime}
                                onChange={(val) => setFormWithdrawTime(val)}
                                sx={{ width: "100%" }}
                            />
                        </DemoContainer>

                        <DemoContainer components={["TimePicker"]}>
                            <TimePicker
                                label="Previsão de retorno"
                                value={formReturnTime}
                                onChange={(val) => setFormReturnTime(val)}
                                sx={{ width: "100%" }}
                                slotProps={{ field: { clearable: true } }}
                            />
                        </DemoContainer>
                    </Stack>
                </Stack>

                <CheckUserDialog
                    isOpen={checkDialogIsOpen}
                    setIsOpen={setCheckDialogIsOpen}
                    chekedUser={formReservatedTo}
                    setCheckSucess={setCheckSucess}
                    info={{
                        sala: formRoom.map(r => r.name).join(", "),
                        reservadoPara: formReservatedTo?.name,
                        reservadoPor: loggedUser?.name,
                    }}
                />

                <Button
                    ref={submitButtonRef}
                    variant="contained"
                    sx={{ marginX: 6, marginY: 2 }}
                    onClick={submitWithdraw}
                    disabled={createMutation.isPending}
                >
                    Criar retirada
                </Button>
            </Dialog>
        </DraggablePaper>
    );
}