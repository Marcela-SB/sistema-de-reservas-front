import {
    Dialog,
    AppBar,
    Toolbar,
    Typography,
    Button,
    List,
    ListItem,
    ListItemSecondaryAction,
    Divider,
    Tooltip,
    Stack,
    IconButton,
} from "@mui/material";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import React, { useEffect, useState } from "react";
import { StateContext } from "../context/ReactContext";
import { RoomT } from "../types/RoomT";
import { KeyT } from "../types/KeyDeliveryT";
import dayjs from "dayjs";
import getUserById from "../utils/getUserById";
import { Close } from "@mui/icons-material";
import PaperComponent from "./PaperComponent";
import DraggablePaper from "./DraggablePaper";

type Props = {
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
    selectedRoom: RoomT;
};

export default function HistoricDialog({
    isOpen,
    setIsOpen,
    selectedRoom,
}: Props) {
    const { allUsersList, keyList } = React.useContext(StateContext);

    const [scrollableRoomArray, setScrollableRoomArray] = useState<KeyT[]>([]);

    const handleClose = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        if (keyList) {
            const holder = keyList.filter((key) => {
                return key.roomId == selectedRoom.id;
            });
            holder.sort((a, b) => {
                const dateA = dayjs(a.withdrawTime);
                const dateB = dayjs(b.withdrawTime);

                if (dateA.isAfter(dateB)) {
                    return -1;
                }
                if (dateA.isBefore(dateB)) {
                    return 1;
                }

                return 0;
            });
            setScrollableRoomArray(holder);
        }
    }, [keyList]);

    return (
        <DraggablePaper>
            <Dialog
                open={isOpen}
                onClose={handleClose}
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
                            Historico de chaves
                        </Typography>
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
                <List sx={{overflow: "auto", maxHeight: "30rem"}} >
                    {scrollableRoomArray?.map((key) => {
                        return (
                            <>
                                <ListItem key={`modkeylist-${key.id}`}>
                                    <Stack direction={"column"} sx={{marginRight:20}}>
                                        <Typography>
                                            Retirada de chave:
                                            {dayjs(key.withdrawTime).format(
                                                "HH:mm [no dia] DD/MM/YYYY"
                                            )}
                                        </Typography>
                                        <Typography>
                                            Previsão do retorno:
                                            {dayjs(key.returnPrevision).format(
                                                "HH:mm"
                                            )}
                                        </Typography>

                                        <Typography>
                                            Responsavel pela reserva:
                                            {
                                                getUserById(
                                                    key.withdrawResponsibleId,
                                                    allUsersList
                                                )?.name
                                            }
                                        </Typography>
                                        <Typography>
                                            Reserva feita para:
                                            {
                                                getUserById(
                                                    key.responsibleForTheKeyId,
                                                    allUsersList
                                                )?.name
                                            }
                                        </Typography>
                                        {(key.isKeyReturned && key.keyReturnedById && key.returnTime) && (
                                            <>
                                                <Typography>
                                                    Retorno feito por:
                                                    {
                                                        getUserById(
                                                            key.keyReturnedById,
                                                            allUsersList
                                                        )?.name
                                                    }
                                                </Typography>
                                                <Typography>
                                                    Retorno de chave:
                                                    {dayjs(key.returnTime).format(
                                                        "HH:mm [no dia] DD/MM/YYYY"
                                                    )}
                                                </Typography>
                                            </>
                                        )}
                                    </Stack>
                                    {key.isKeyReturned ?
                                        null: (
                                        <ListItemSecondaryAction
                                        >
                                            <Tooltip
                                                title={"Chave não retornada"}
                                            >
                                                <PriorityHighRoundedIcon
                                                    color="error"
                                                    fontSize="large"
                                                ></PriorityHighRoundedIcon>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    )}

                                </ListItem>
                                <Divider variant="middle" />
                            </>
                        );
                    })}
                </List>
            </Dialog>
        </DraggablePaper>
    );
}
