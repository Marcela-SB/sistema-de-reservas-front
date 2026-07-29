import { Alert, Snackbar } from "@mui/material";
import React from "react";
import { StateContext } from "../context/ReactContext";

type Props = {};

function GlobalSnackBar({}: Props) {
    const {
        snackBarText,
        setSnackBarText,
        snackBarSeverity,
        setSnackBarSeverity,
    } = React.useContext(StateContext);

    const [isSnackBarOpen, setIsSnackBarOpen] = React.useState(false);

    React.useEffect(() => {
        if (snackBarText != "") {
            setIsSnackBarOpen(true);
        }
    }, [snackBarText]);

    const handleClose = () => {
        setIsSnackBarOpen(false);
        setSnackBarText("");
        setSnackBarSeverity("success")
    }

    return (
        <Snackbar
            open={isSnackBarOpen}
            autoHideDuration={5000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <Alert severity={snackBarSeverity}>{snackBarText}</Alert>
        </Snackbar>
    );
}

export default GlobalSnackBar;
