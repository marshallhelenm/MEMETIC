import CircularProgress from '@mui/material/CircularProgress';
import "../App.css";
import {colorC} from "../assets/styles"

function LoadingStub () {
    return (
    <div className='stub' >
      <div className='loading'>
        <CircularProgress sx={{ color: colorC }} />
      </div>
    </div>
  );

}

export default LoadingStub;
