import GuessyButton from "./GuessyButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

function GuessyConfirmationDialog({ onConfirm, open, setOpen }) {
  const handleCancel = () => setOpen(false);

  const handleOk = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Clear current game?</DialogTitle>
      <DialogContent dividers>
        The memes will be replaced with a new set for every player in the room!
      </DialogContent>
      <DialogActions>
        <GuessyButton autoFocus onClick={handleCancel} dark>
          Cancel
        </GuessyButton>
        <GuessyButton onClick={handleOk} dark>
          Ok
        </GuessyButton>
      </DialogActions>
    </Dialog>
  );
}

export default GuessyConfirmationDialog;
