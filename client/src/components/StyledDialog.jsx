import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material';
import { colorE } from "../assets/styles";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiPaper-root': {
    backgroundColor: colorE,
  },
}));

export default StyledDialog;
