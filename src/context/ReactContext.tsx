import dayjs, { Dayjs } from "dayjs";
import React, { ReactElement, createContext, useState } from "react";
import { RoomT } from "../types/RoomT";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { UserT } from "../types/UserT";
import { ReservationT } from "../types/ReservationT";
import { KeyT } from "../types/KeyDeliveryT";
import { AlertColor } from "@mui/material";
import { AuthorizationT } from "../types/AuthorizationT";

export type GlobalContent = {
    date: Dayjs;
    setDate: (c: Dayjs) => void;
    roomList: RoomT[];
    activeUsersList: UserT[];
    allUsersList: UserT[];
    reservationList: ReservationT[];
    keyList: KeyT[];
    AuthorizationList: AuthorizationT[];
    loggedUser: unknown | null;
    setLoggedUser: (u: unknown) => void;
    snackBarText: string;
    setSnackBarText: (s: string) => void;
    snackBarSeverity: AlertColor;
    setSnackBarSeverity: (s: AlertColor) => void;
};

export const StateContext = createContext<GlobalContent>({
    date: dayjs(),
    setDate: () => {},
    roomList: [],
    activeUsersList: [],
    allUsersList: [],
    reservationList: [],
    keyList: [],
    AuthorizationList: [],
    loggedUser: null,
    setLoggedUser: () => {},
    snackBarText: "",
    setSnackBarText: () => {},
    snackBarSeverity: "success",
    setSnackBarSeverity: () => {},
});

type Props = { children: ReactElement };

function ReactContext({ children }: Props) {
    const [date, setDate] = useState<Dayjs>(dayjs());

    const { data: roomList } = useQuery({
        queryKey: ["roomListContext"],
        queryFn: async () => {
            const response = await axiosInstance.get("room/list");
            return response.data;
        },
    });

    const { data: activeUsersList = [] } = useQuery({
        queryKey: ["userListContext"],
        queryFn: async () => {
            const response = await axiosInstance.get("user/actives");
            return response.data;
        },
        select: (data: UserT[]) => 
            [...data].sort((a, b) => a.name.localeCompare(b.name)),
    });

    const { data: allUsersList = [] } = useQuery({
        queryKey: ["allUserListContext"],
        queryFn: async () => {
            const response = await axiosInstance.get("user");
            return response.data;
        },
        select: (data: UserT[]) => 
            [...data].sort((a, b) => a.name.localeCompare(b.name)),
    });

    const { data: reservationList } = useQuery({
        queryKey: ["reservationListContext"],
        queryFn: async () => {
            const response = await axiosInstance.get("reservation/list");
            return response.data;
        },
    });

    const { data: keyList } = useQuery({
        queryKey: ["keyListContext"],
        queryFn: async () => {
            const response = await axiosInstance.get("keydelivery/list");
            return response.data;
        },
    });

    const { data: AuthorizationList } = useQuery({
        queryKey: ["AuthorizationListContext"],
        queryFn: async () => {
            const response = await axiosInstance.get("authorization/list");
            return response.data;
        },
    });

    const userFromLocalStorage = localStorage.getItem("user");
    const [loggedUser, setLoggedUser] = React.useState<unknown | null>(
        userFromLocalStorage
            ? JSON.parse(userFromLocalStorage).user
            : null
    );

    const [snackBarText, setSnackBarText] = useState<string>("");

    const [snackBarSeverity, setSnackBarSeverity] =
        useState<AlertColor>("success");

    return (
        <StateContext.Provider
            value={{
                date,
                setDate,
                roomList,
                activeUsersList,
                allUsersList,
                reservationList,
                keyList,
                AuthorizationList,
                loggedUser,
                setLoggedUser,
                snackBarText,
                setSnackBarText,
                snackBarSeverity,
                setSnackBarSeverity,
            }}
        >
            {children}
        </StateContext.Provider>
    );
}

export default ReactContext;
