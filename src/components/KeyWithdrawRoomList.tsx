import {
    Box,
    Checkbox,
    Divider,
    ListItem,
    ListItemSecondaryAction,
} from "@mui/material";
import { RoomT } from "../types/RoomT.ts";
import { useEffect, useState } from "react";

type Props = {
    room: RoomT;
    changeRoomList: (room: RoomT) => void;
    checkSucess: boolean;
    visible: boolean;
};

export default function KeyWithdrawRoomList({
    room,
    changeRoomList,
    checkSucess,
    visible,
}: Props) {
    useEffect(() => {
        if (checkSucess) {
            setChecked(false);
        }
    }, [checkSucess]);

    const [checked, setChecked] = useState(false);

    return (
        <Box>
            {visible && (
                <>
                    <ListItem key={`modroomlist-${room.id}`}>
                        {room.name} - {room.roomNumber}
                        <ListItemSecondaryAction>
                            <Checkbox
                                onChange={() => {
                                    setChecked(!checked);
                                    changeRoomList(room);
                                }}
                                checked={checked}
                            ></Checkbox>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider
                        key={`modroomlistdivider-${room.id}`}
                        variant="middle"
                    />
                </>
            )}
        </Box>
    );
}
