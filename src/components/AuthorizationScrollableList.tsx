import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { StateContext } from "../context/ReactContext";
import {
    Button,
    FormControl,
    IconButton,
    ListSubheader,
    Stack,
    TextField,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { AuthorizationT } from "../types/AuthorizationT";
import getUserById from "../utils/getUserById";

type Props = {
    setSelectedAuthorization: (k: AuthorizationT) => void;
    setCreateDialogIsOpen: (b : boolean) => void;
    handleClose: () => void
};

export default function AuthorizationScrollableList({
    setSelectedAuthorization,
    setCreateDialogIsOpen,
    handleClose
}: Props) {
    const { AuthorizationList, allUsersList } = React.useContext(StateContext);

    const [ordainedAuthorizationList, setOrdainedAuthorizationList] = useState<
        AuthorizationT[]
    >([]);

    const [searchedText, setSearchedText] = useState("");

    useEffect(() => {
        if (allUsersList && AuthorizationList) {
            const filtededAuthorizationList = AuthorizationList?.filter(
                (authorization: AuthorizationT) => {
                    //if no input the return the original
                    if (searchedText === "") {
                        return authorization;
                    }

                    //return the item which contains the room input
                    else {
                        const user = getUserById(
                            authorization.authorizationProfessorId,
                            allUsersList
                        );
                        if (user?.name.toLowerCase().includes(searchedText.toLowerCase())) {
                            return authorization;
                        }
                    }
                }
            );
            setOrdainedAuthorizationList(filtededAuthorizationList);
        }
    }, [AuthorizationList, allUsersList, searchedText]);

    const handleEdit = () => {
        handleClose()
        setCreateDialogIsOpen(true)
    }

    return (
        <Stack
            direction={"column"}
            gap={2}
            sx={{
                marginY: 2,
            }}
        >
            <Stack direction={"row"} gap={1} flex={2 / 4}>
                <List
                    sx={{
                        width: "22rem",
                        maxWidth: 360,
                        bgcolor: "background.paper",
                        position: "relative",
                        overflow: "auto",
                        height: "22rem",
                        "& ul": { padding: 0 },
                        "&::-webkit-scrollbar": { display: "none" },
                        minWidth: 200,
                        borderRadius: ".5rem .5rem  2% 2%",
                        border: "solid 1px rgba(0, 0, 0, 0.26)",
                        padding: 0,
                        flex: 1,
                    }}
                    
                >
                    <ListSubheader
                        sx={{
                            backgroundColor: "#004586",
                            color: "white",
                            borderRadius: ".5rem .5rem 0 0 ",
                            textAlign: 'center'
                        }}
                    >
                        AUTORIZAÇÕES ATIVAS
                    </ListSubheader>
                    {ordainedAuthorizationList.map((item: AuthorizationT) => {
                        if (
                            dayjs(item.authorizationEnd).isBefore(
                                dayjs(),
                                "day"
                            )
                        )
                            return;

                        const authProff = getUserById(
                            item.authorizationProfessorId,
                            allUsersList
                        );

                        return (
                            <ListItem
                                key={item.id}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        onClick={() => {
                                            setSelectedAuthorization(item);
                                        }}
                                    >
                                        <Send />
                                    </IconButton>
                                }
                                disablePadding
                                sx={{ borderBottom: "1px solid gray", pl: 2 }}
                            >
                                <ListItemText
                                    primary={`${item.name}`}
                                    secondary={`${authProff?.name}`+(authProff?.active ? "" : " (inativo)")}
                                />
                            </ListItem>
                        );
                    })}
                </List>
               
            </Stack>

            <FormControl>
                <TextField
                    label="Nome do professor responsavel"
                    placeholder="Digite o nome do professor responsavel"
                    sx={{
                        borderRadius: 6,
                    }}
                    value={searchedText}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchedText(event.target.value);
                    }}
                ></TextField>
            </FormControl>
        </Stack>
    );
}
