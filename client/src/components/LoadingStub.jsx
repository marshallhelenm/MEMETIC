import {CircularProgress, Paper} from '@mui/material';
import "../App.css";
import {colorC} from "../assets/styles"

function LoadingStub () {
    return (
    <Paper >
      <div style={{height: '290px', width: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress sx={{ color: colorC }} />
      </div>
    </Paper>
  );

}

export default LoadingStub;
