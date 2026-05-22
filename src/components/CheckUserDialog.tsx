import * as React from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {
    Alert,
    DialogActions,
    DialogContent,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import InputMask from "react-input-mask";
import axiosInstance from "../utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { UserT } from "../types/UserT";
import { Close } from "@mui/icons-material";
import DraggablePaper from "./DraggablePaper";
import PaperComponent from "./PaperComponent";
import { useEnterSubmit } from "../utils/enterKeyButtonActivate";

type Props = {
    setIsOpen: (b: boolean) => void;
    isOpen: boolean;
    chekedUser: UserT | null;
    setCheckSucess: (b: boolean) => void;
    info: {
        sala?: string;
        reservadoPara?: string;
        reservadoPor?: string;
        retornadoPor?: string;
    };
};

export default function CheckUserDialog({
    setIsOpen,
    isOpen,
    chekedUser,
    setCheckSucess,
    info,
}: Props) {
    const [username, setUsername] = React.useState<string | null>(null);
    const [password, setPassword] = React.useState<string | null>(null);

    const [showPassword, setShowPassword] = React.useState(false);

    const passwordInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (chekedUser) {
            setUsername(chekedUser.username);
        }
    }, [chekedUser]);

    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                passwordInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
    };

    const loginMutation = useMutation({
        mutationFn: (header) => {
            return axiosInstance.post("auth/authenticate", header);
        },
        onSuccess: () => {
            closeDialog();
            setCheckSucess(true);
        },
    });

    const LoginTentative = () => {
        const header = {
            username: username,
            password: password,
        };

        loginMutation.mutate(header);
    };

    const closeDialog = () => {
        loginMutation.reset();
        setIsOpen(false);
        setPassword(null);
    };
                
    const dialogRef = React.useRef<HTMLDivElement>(null);
    const submitButtonRef = React.useRef<HTMLButtonElement>(null);
    useEnterSubmit(isOpen, submitButtonRef, dialogRef);

    return (
        <DraggablePaper>
            <Dialog
                ref={dialogRef}
                onClose={() => {
                    closeDialog();
                }}
                open={isOpen}
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
                    width: "fit-content",
                }}
            >
                <Stack direction={"row"} className="draggable-dialog">
                    <DialogTitle>Logue para finalizar a reserva</DialogTitle>
                    <DialogActions>
                        <IconButton onClick={closeDialog} aria-label="close">
                            <Close />
                        </IconButton>
                    </DialogActions>
                </Stack>

                <DialogContent>
                    <Paper elevation={2} sx={{ padding: 1, marginBottom: 4 }}>
                        <Typography variant="body1">
                            {" "}
                            Sala reservada: {info.sala}
                        </Typography>
                        <Typography variant="body1">
                            {" "}
                            Reservado para: {info.reservadoPara}
                        </Typography>
                        <Typography variant="body1">
                            {" "}
                            Reservado por: {info.reservadoPor}
                        </Typography>
                        {info.retornadoPor && <Typography variant="body1">
                            {" "}
                            Chave retornada por: {info.retornadoPor}
                        </Typography>}
                    </Paper>
                    <Stack direction={"column"} gap={2}>
                        <FormControl variant="outlined">
                            <InputMask
                                mask={"999.999.999-99"}
                                value={username}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setUsername(event.target.value);
                                }}
                            >
                                {() => <TextField label="CPF" />}
                            </InputMask>
                        </FormControl>

                        <FormControl variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-password">
                                Password
                            </InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                inputRef={passwordInputRef}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setPassword(event.target.value);
                                }}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={
                                                handleMouseDownPassword
                                            }
                                            edge="end"
                                        >
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                            />
                        </FormControl>

                        {loginMutation.error && (
                            <Alert severity="error">
                                CPF ou senha incorretos
                            </Alert>
                        )}

                        <Button
                            ref={submitButtonRef}
                            variant="contained"
                            onClick={LoginTentative}
                            sx={{ marginTop: 1 }}
                            disabled={loginMutation.isPending}
                        >
                            login
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </DraggablePaper>
    );
}