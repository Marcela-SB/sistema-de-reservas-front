import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Container from "@mui/material/Container";

import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarksIcon from "@mui/icons-material/Bookmarks";

import KeyIcon from "@mui/icons-material/Key";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import FullScreenActionDialog from "./FullScreenActionDialog";
import FullScreenDialogList from "./FullScreenDialogList";
import { ReservationT } from "../types/ReservationT";
import KeyWithdraDialog from "./KeyWithdrawDialog";
import KeyReturnDialog from "./KeyReturnDialog";
import {
    ManageAccounts,
    MeetingRoom,
    NoteAdd,
    PersonAdd,
    Plagiarism,
    RoomPreferences,
} from "@mui/icons-material";
import CreateUserDialog from "./CreateUserDialog";
import CreateUserCpfSearchDialog from "./CreateUserCpfSearchDialog";
import { useState } from "react";
import { UserT } from "../types/UserT";
import CreateRoomDialog from "./CreateRoomDialog";
import { RoomT } from "../types/RoomT";
import ModifyRoomListD from "./ModifyRoomListD";
import ModifyUserListD from "./ModifyUserListD";
import { StateContext } from "../context/ReactContext";
import { Button } from "@mui/material";
import CreateAuthorizationDialog from "./CreateAuthorizationDialog";
import { AuthorizationT } from "../types/AuthorizationT";
import CheckAuthorizationDialog from "./CheckAuthorizationDialog";

type Props = {
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
};

export default function LoginDrawer({ isOpen, setIsOpen }: Props) {
    const { loggedUser } = React.useContext(StateContext);

    const toggleDrawer =
        (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
            if (
                event.type === "keydown" &&
                ((event as React.KeyboardEvent).key === "Tab" ||
                    (event as React.KeyboardEvent).key === "Shift")
            ) {
                return;
            }

            setIsOpen(open);
        };

    const [userPower, setUserPower] = useState<number>(0);

    const [reservationDIsOpen, setReservationDIsOpen] = useState(false);
    const [reservationDListIsOpen, setReservationDListIsOpen] = useState(false);

    const [selectedReservation, setSelectedReservation] =
        useState<ReservationT | null>(null);

    const [keyWDialogIsOpen, setKeyWDialogIsOpen] = useState(false);
    const [keyRDialogIsOpen, setKeyRDialogIsOpen] = useState(false);

    const [userSearchDIsOpen, setUserSearchDIsOpen] = useState(false);
    const [userCreateDIsOpen, setUserCreateDIsOpen] = useState(false);
    const [userModifyDIsOpen, setUserModifyDIsOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<UserT | null>(null);

    const [roomCreateDIsOpen, setRoomCreateDIsOpen] = useState(false);
    const [roomModifyDIsOpen, setRoomModifyDIsOpen] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState<RoomT | null>(null);

    const [authorizationCreateDIsOpen, setAuthorizationCreateDIsOpen] =
        useState(false);
    const [authorizationModifyDIsOpen, setAuthorizationModifyDIsOpen] =
        useState(false);

    const [selectedAuthorization, setSelectedAuthorization] =
        useState<AuthorizationT | null>(null);

    React.useEffect(() => {
        if (loggedUser) {
            if (loggedUser.role == "ADMIN") {
                setUserPower(3);
            } else if (loggedUser.role == "SUPERVISOR") {
                setUserPower(2);
            } else if (loggedUser.role == "TRAINEE") {
                setUserPower(1);
            }
        }
    }, [loggedUser]);

    function logOff(
        e: MouseEvent<HTMLButtonElement, MouseEvent>
    ): React.MouseEventHandler<HTMLButtonElement> | undefined {
        localStorage.removeItem("user");
        location.reload();
        e.preventDefault();
    }

    return (
        <div>
            <Drawer
                anchor={"right"}
                open={isOpen}
                onClose={toggleDrawer(false)}
            >
                <Box
                    sx={{
                        width: 250,
                    }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    {userPower >= 2 ? (
                        <>
                            <List>
                                <ListItem key={"Criar reserva"} disablePadding>
                                    <ListItemButton
                                        onClick={() => {
                                            setReservationDIsOpen(true);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <BookmarkAddIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Criar reserva"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem
                                    key={"Consultar reservas"}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            setReservationDListIsOpen(true);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <BookmarksIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Consultar reservas"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                            <Divider />
                        </>
                    ) : null}
                    {userPower >= 1 ? (
                        <>
                            <List>
                                <ListItem
                                    key={"Retirada de chave"}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            setKeyWDialogIsOpen(true);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <KeyIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Retirada de chave"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem
                                    key={"Devolução de chave"}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            setKeyRDialogIsOpen(true);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <KeyboardReturnIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Devolução de chave"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                            <Divider />
                            <List>
                                {userPower >= 2 ? (
                                    <>
                                        <ListItem key={"Criar espaço"} disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    setRoomCreateDIsOpen(true);
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <MeetingRoom />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={"Criar espaço"}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    </>
                                ) : null}
                                <ListItem
                                    key={"Consultar espaços"}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            setRoomModifyDIsOpen(true);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <RoomPreferences />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Consultar espaços"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                            <Divider />
                        </>
                    ) : null}
                    {userPower >= 1 ? (
                        <>
                            <List>
                                <ListItem key={"Criar usuario"} disablePadding>
                                    <ListItemButton
                                        onClick={() => {
                                            // setUserCreateDIsOpen(true);
                                            setUserSearchDIsOpen(true);
                                            setSelectedUser(null);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <PersonAdd />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Criar usuario"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem
                                    key={"Consultar usuarios"}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            setUserModifyDIsOpen(true);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <ManageAccounts />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Consultar usuarios"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                            <Divider />
                        </>
                    ) : null}
                    {userPower >= 1 ? (
                        <>
                            <List>
                                <ListItem
                                    key={"Criar autorização"}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            setAuthorizationCreateDIsOpen(true);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <NoteAdd />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Criar autorização"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem
                                    key={"Consultar autorizações"}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            setAuthorizationModifyDIsOpen(true);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Plagiarism />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={"Consultar autorizações"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                            <Divider />
                        </>
                    ) : null}
                    <Container>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                margin: "0 auto",
                            }}
                            onClick={(e) => {
                                logOff(e);
                            }}
                        >
                            Deslogar
                        </Button>
                    </Container>
                </Box>
            </Drawer>
            <FullScreenActionDialog
                isOpen={reservationDIsOpen}
                setIsOpen={setReservationDIsOpen}
                text="deart"
                selectedReservation={selectedReservation}
                setSelectedReservation={setSelectedReservation}
            />
            <FullScreenDialogList
                isOpen={reservationDListIsOpen}
                setIsOpen={setReservationDListIsOpen}
                text="reservas"
                setSelectedReservation={setSelectedReservation}
                setReservationDIsOpen={setReservationDIsOpen}
            />
            <KeyWithdraDialog
                isOpen={keyWDialogIsOpen}
                setIsOpen={setKeyWDialogIsOpen}
            />
            <KeyReturnDialog
                isOpen={keyRDialogIsOpen}
                setIsOpen={setKeyRDialogIsOpen}
            />
            
            <CreateUserCpfSearchDialog
                isOpen={userSearchDIsOpen}
                setIsOpen={setUserSearchDIsOpen}
                setSelectedUser={setSelectedUser}
                setCreateUserIsOpen={setUserCreateDIsOpen} 
            />
            <CreateUserDialog
                isOpen={userCreateDIsOpen}
                setIsOpen={setUserCreateDIsOpen}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
            />
            <CreateRoomDialog
                isOpen={roomCreateDIsOpen}
                setIsOpen={setRoomCreateDIsOpen}
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
            />
            <ModifyRoomListD
                isOpen={roomModifyDIsOpen}
                setIsOpen={setRoomModifyDIsOpen}
                setSelectedRoom={setSelectedRoom}
                setCreateRoom={setRoomCreateDIsOpen}
                onlyView={userPower===1}
            />
            <ModifyUserListD
                isOpen={userModifyDIsOpen}
                setIsOpen={setUserModifyDIsOpen}
                setSelectedUser={setSelectedUser}
                setCreateUserIsOpen={setUserCreateDIsOpen}
            />
            <CreateAuthorizationDialog
                isOpen={authorizationCreateDIsOpen}
                setIsOpen={setAuthorizationCreateDIsOpen}
                selectedAuthorization={selectedAuthorization}
                setSelectedAuthorization={setSelectedAuthorization}
            />
            <CheckAuthorizationDialog
                isOpen={authorizationModifyDIsOpen}
                setIsOpen={(setAuthorizationModifyDIsOpen)}
                selectedAuthorization={selectedAuthorization}
                setSelectedAuthorization={setSelectedAuthorization}
                setCreateAuthIsOpen={setAuthorizationCreateDIsOpen}
            />
        </div>
    );
}
