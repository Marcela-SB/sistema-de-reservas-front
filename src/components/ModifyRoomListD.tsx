import { AppBar, Dialog, Divider, FormControl, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Stack, TextField, Toolbar, Typography, } from "@mui/material";
import React, { useEffect, useState } from "react";
import { StateContext } from "../context/ReactContext";
import { Close, Send } from "@mui/icons-material";
import { RoomT } from "../types/RoomT";
import roomDynamicSort from "../utils/roomDynamicSort";
import PaperComponent from "./PaperComponent";
import DraggablePaper from "./DraggablePaper";

type Props = {
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
    setSelectedRoom: (r: RoomT) => void;
    setCreateRoom: (b: boolean) => void;
    onlyView?: boolean;
};
function ModifyRoomListD({
    isOpen,
    setIsOpen,
    setSelectedRoom,
    setCreateRoom,
    onlyView
}: Props) {
    const { roomList, activeUsersList } = React.useContext(StateContext);

    const [scrollableRoomArray, setScrollableRoomArray] = useState<RoomT[]>([]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const [searchedText, setSearchedText] = useState("");

    useEffect(() => {
        if (roomList) {
            const filteredRoomList = roomList
                ?.filter((room: RoomT) => {
                    //if no input the return the original
                    if (searchedText === "") {
                        return room;
                    }

                    //return the item which contains the room input
                    else {
                        return room.name?.toLowerCase().includes(searchedText.toLowerCase());
                    }
                })
                .sort(roomDynamicSort());
            setScrollableRoomArray(filteredRoomList);
        }
    }, [searchedText, roomList]);

    const selectRoom = (room: RoomT) => {
        setSelectedRoom(room);
        setCreateRoom(true);
    };

    return (
        <DraggablePaper>
            <Dialog
                open={isOpen}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
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
                    width:'36.5rem',
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
                            Selecione um espaço
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
                <Stack direction={"column"}>
                    <List sx={{ overflow: "auto", maxHeight: "20rem" }}>
                        {scrollableRoomArray?.map((room) => {
                            return (
                                <>
                                    <ListItem key={`modroomlist-${room.id}`}>
                                        <ListItemText
                                            primary={`${room.name} - ${room.roomNumber}`}
                                            secondary={
                                                room.responsibleId && (
                                                    <Typography variant="caption" component="span" display="block">
                                                        Responsável: {activeUsersList?.find(u => u.id === room.responsibleId)?.name || ""}
                                                    </Typography>
                                                )
                                            }
                                        />
                                        { !onlyView && (
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    onClick={() => selectRoom(room)}
                                                >
                                                    <Send></Send>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        )}
                                    </ListItem>
                                    <Divider
                                        key={`modroomlistdivider-${room.id}`}
                                        variant="middle"
                                    />
                                </>
                            );
                        })}
                    </List>
                    <FormControl>
                        <TextField
                            label="Nome do espaço"
                            placeholder="Digite o nome do espaço"
                            sx={{
                                margin: 2,
                                borderRadius: 6,
                            }}
                            value={searchedText}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setSearchedText(event.target.value);
                            }}
                        ></TextField>
                    </FormControl>
                </Stack>
            </Dialog>
        </DraggablePaper>
    );
}

export default ModifyRoomListD;
