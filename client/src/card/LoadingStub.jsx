import ProgressWheel from "../components/ProgressWheel";

function LoadingStub({ cardWidth }) {
  return (
    <div className="stub" style={{ width: `${cardWidth}px` }}>
      <div className="loading">
        <ProgressWheel />
      </div>
    </div>
  );
}

export default LoadingStub;
