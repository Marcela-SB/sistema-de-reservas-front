import * as React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

import { StateContext } from "../context/ReactContext";
import {
    Autocomplete,
    Checkbox,
    Chip,
    Container,
    IconButton,
    Stack,
    TextField,
} from "@mui/material";
import { useState } from "react";
import { RoomT } from "../types/RoomT";
import dayjs, { Dayjs } from "dayjs";
import { UserT } from "../types/UserT";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers";
import axiosInstance from "../utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import getRoomById from "../utils/getRoomById";
import getUserById from "../utils/getUserById";
import { queryClient } from "../utils/queryClient";
import {
    CheckBoxOutlineBlankOutlined,
    CheckBoxOutlined,
    Close,
    Edit,
} from "@mui/icons-material";
import DraggablePaper from "./DraggablePaper";
import PaperComponent from "./PaperComponent";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import { AuthorizationT } from "../types/AuthorizationT";
import AuthorizationScrollableList from "./AuthorizationScrollableList";
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
    selectedAuthorization: AuthorizationT | null;
    setSelectedAuthorization: (a: AuthorizationT | null) => void;
    setCreateAuthIsOpen: (b: boolean) => void;
};

export default function CheckAuthorizationDialog({
    isOpen,
    setIsOpen,
    selectedAuthorization,
    setSelectedAuthorization,
    setCreateAuthIsOpen,
}: Props) {
    const { setSnackBarText, setSnackBarSeverity, roomList, allUsersList, activeUsersList } =
        React.useContext(StateContext);

    const handleClose = () => {
        setIsOpen(false);
        cleanInputs();
    };

    const cleanInputs = () => {
        setAuthorizatioRoomsId([]);
        setAuthorizaredToId([]);

        setAuthorizationProfessor(null);
        setAuthorizationResponsible(null);

        setAuthorizationStart(dayjs());
        setAuthorizationEnd(dayjs());
        setComment(null);

        setIsOpen(false);
        setIsConfirmationDOpen(false);
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({
            queryKey: ["authorizationListContext"],
        });
    };

    const [authorizationRoomsId, setAuthorizatioRoomsId] = useState<RoomT[]>(
        []
    );

    const [authorizationProfessor, setAuthorizationProfessor] =
        useState<UserT | null>(null);

    const [authorizaredToId, setAuthorizaredToId] = useState<UserT[]>([]);

    const [authorizationResponsible, setAuthorizationResponsible] =
        useState<UserT | null>(null);

    const [authorizationStart, setAuthorizationStart] = useState<Dayjs | null>(
        dayjs()
    );

    const [authorizationEnd, setAuthorizationEnd] = useState<Dayjs | null>(
        dayjs()
    );

    const [comment, setComment] = useState<string | null>(null);

    const [isConfirmationDOpen, setIsConfirmationDOpen] = useState(false);

    const [checkDialogIsOpen, setCheckDialogIsOpen] = useState(false);

    const [checkSucess, setCheckSucess] = useState(false);

    const editMutation = useMutation({
        mutationFn: (header) => {
            return axiosInstance.put("keydelivery/edit/" + header.id, header);
        },
        onSuccess: () => {
            setSnackBarText("Devolução de chave criada com sucesso");
            setSnackBarSeverity("success");
            queryClient.invalidateQueries({ queryKey: ["keyListContext"] });
            cleanInputs();
        },
        onError: (error) => {
            setSnackBarText("Houve um problema na requisição de edição!");
            setSnackBarSeverity("error");
        },
    });

    React.useEffect(() => {
        if (selectedAuthorization) {
            const roomListToPush: RoomT[] = [];
            for (const roomId of selectedAuthorization.roomsId) {
                const room: RoomT = getRoomById(roomId, roomList);
                roomListToPush.push(room);
            }
            setAuthorizatioRoomsId(roomListToPush);

            const userListToPush: UserT[] = [];
            for (const userId of selectedAuthorization.authorizatedToId) {
                const user: UserT | null | undefined = getUserById(userId, activeUsersList);       
                if (user) { 
                    userListToPush.push(user);
                }
            }
            setAuthorizaredToId(userListToPush);

            const userProff: UserT = getUserById(
                selectedAuthorization.authorizationProfessorId,
                allUsersList
            );
            setAuthorizationProfessor(userProff);

            const userResponsible: UserT = getUserById(
                selectedAuthorization.authorizationResponsibleId,
                allUsersList
            );
            setAuthorizationResponsible(userResponsible);

            setAuthorizationStart(
                dayjs(selectedAuthorization.authorizationStart)
            );
            setAuthorizationEnd(dayjs(selectedAuthorization.authorizationEnd));

            setComment(selectedAuthorization.comment);
        }
    }, [selectedAuthorization]);

    const submitReturn = () => {
        setCheckDialogIsOpen(true);
    };

    const handleEdit = () => {
        handleClose();
        setCreateAuthIsOpen(true);
    };

    const [isRequestPending, setIsRequestPending] = useState(false);
    React.useEffect(() => {
        setIsRequestPending(editMutation.isPending);
    }, [editMutation]);
            
    const dialogRef = React.useRef<HTMLDivElement>(null);
    const submitButtonRef = React.useRef<HTMLButtonElement>(null);
    useEnterSubmit(isOpen, submitButtonRef, dialogRef);

    return (
        <>
            <DraggablePaper>
                <Dialog
                    ref={dialogRef}
                    open={isOpen}
                    onClose={handleClose}
                    TransitionComponent={Transition}
                    maxWidth="md"
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
                        paddingBottom: 4,
                    }}
                >
                    <AppBar
                        className="draggable-dialog"
                        sx={{ position: "relative" }}
                    >
                        <Toolbar>
                            <Typography
                                sx={{ mx: 20, flex: 1 }}
                                variant="h6"
                                component="div"
                                textAlign={"center"}
                                noWrap
                            >
                                CONSULTA DE AUTORIZAÇÃO
                            </Typography>
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
                                onClick={handleRefresh}
                                aria-label="close"
                            >
                                <RefreshIcon />
                            </IconButton>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleClose}
                                aria-label="close"
                            >
                                <Close />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Container
                        sx={{
                            justifyContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Stack direction={"row"}>
                            <AuthorizationScrollableList
                                setSelectedAuthorization={
                                    setSelectedAuthorization
                                }
                                handleClose={handleClose}
                                setCreateDialogIsOpen={setCreateAuthIsOpen}
                            />
                            <Stack
                                direction={"column"}
                                justifyContent={"space-between"}
                                marginX={2}
                                gap={2}
                                marginTop={2}
                                width={"22rem"}
                            >
                                <Autocomplete
                                    fullWidth
                                    multiple
                                    id="controllable-states-demo"
                                    options={roomList}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Salas autorizadas"
                                            sx={{ flexWrap: "nowrap" }}
                                        />
                                    )}
                                    disableClearable
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
                                                    deleteIcon={<></>}
                                                    onDelete={() => {}}
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
                                    value={authorizationRoomsId}
                                    onChange={(event, values) => {
                                        setAuthorizatioRoomsId(values);
                                    }}
                                    renderOption={(
                                        props,
                                        room,
                                        { selected }
                                    ) => {
                                        if (!selected) return;

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
                                                onClick={() => {}}
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
                                                    readOnly
                                                />
                                                {room.name} {roomN}
                                            </li>
                                        );
                                    }}
                                />

                                <Autocomplete
                                    fullWidth
                                    multiple
                                    id="controllable-states-demo"
                                    options={activeUsersList}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Autorização para..."
                                            sx={{ flexWrap: "nowrap" }}
                                        />
                                    )}
                                    disableClearable
                                    limitTags={1}
                                    renderTags={(value, getTagProps) =>
                                        value.map((user, index) => {
                                            const { key, ...tagProps } =
                                                getTagProps({ index });
                                            if (index > 0) return;
                                            return (
                                                <Chip
                                                    key={key}
                                                    variant="outlined"
                                                    label={user.name}
                                                    size="small"
                                                    {...tagProps}
                                                    deleteIcon={<></>}
                                                    onDelete={() => {}}
                                                />
                                            );
                                        })
                                    }
                                    getOptionLabel={(user: UserT) => {
                                        return user.name;
                                    }}
                                    value={authorizaredToId}
                                    onChange={(event, values) => {
                                        setAuthorizaredToId(values);
                                    }}
                                    renderOption={(
                                        props,
                                        user,
                                        { selected }
                                    ) => {
                                        const { key, ...optionProps } = props;

                                        if (!selected) return;

                                        return (
                                            <li
                                                key={key}
                                                {...optionProps}
                                                style={{}}
                                                onClick={() => {}}
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
                                                    readOnly
                                                />
                                                {user.name}
                                            </li>
                                        );
                                    }}
                                />
                                <Autocomplete
                                    readOnly
                                    fullWidth
                                    value={authorizationProfessor}
                                    onChange={(
                                        _event: any,
                                        newValue: UserT | null
                                    ) => {
                                        setAuthorizationProfessor(newValue);
                                    }}
                                    id="controllable-states-demo"
                                    options={allUsersList}
                                    getOptionLabel={(user: UserT) => {
                                        return user.name + (user.active ? "" : " (inativo)");
                                    }}
                                    sx={{ flexGrow: 1 }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Professor responsavel"
                                            disabled
                                        />
                                    )}
                                />

                                <Autocomplete
                                    fullWidth
                                    disableClearable
                                    disabled
                                    value={authorizationResponsible}
                                    onChange={(
                                        _event: any,
                                        newValue: UserT | null
                                    ) => {
                                        setAuthorizationResponsible(newValue);
                                    }}
                                    id="controllable-states-demo"
                                    options={allUsersList}
                                    getOptionLabel={(user: UserT) => {
                                        return user.name;
                                    }}
                                    sx={{ flexGrow: 1 }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Responsavel pela autorização..."
                                            disabled
                                        />
                                    )}
                                />
                                <DemoContainer
                                    components={["DatePicker"]}
                                    sx={{ width: "100%" }}
                                >
                                    <DatePicker
                                        label="Inicio da autorização"
                                        value={authorizationStart}
                                        onChange={(newValue) =>
                                            setAuthorizationStart(newValue)
                                        }
                                        sx={{ width: "100%" }}
                                        readOnly
                                    />
                                </DemoContainer>
                                <DemoContainer
                                    components={["DatePicker"]}
                                    sx={{ width: "100%" }}
                                >
                                    <DatePicker
                                        label="Final da reserva"
                                        value={authorizationEnd}
                                        onChange={(newValue) =>
                                            setAuthorizationEnd(newValue)
                                        }
                                        sx={{ width: "100%" }}
                                        readOnly
                                    />
                                </DemoContainer>
                            </Stack>
                        </Stack>
                        <TextField
                            label="Observações"
                            value={comment ? comment : ""}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setComment(event.target.value);
                            }}
                            multiline
                            fullWidth
                            disabled
                            rows={2}
                            sx={{ paddingBottom: 4, marginY: 2 }}
                        />
                    </Container>
                </Dialog>
            </DraggablePaper>
        </>
    );
}
