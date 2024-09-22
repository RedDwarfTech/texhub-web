import React from "react";
import Previewer from "../../Previewer";
import { VariableSizeList } from "react-window";

const FullScreen: React.FC = ({}) => {
  const virtualListRef = React.useRef<VariableSizeList>(null);
  const params = new URLSearchParams(window.location.search);
  const projId = params.get("projId");

  React.useEffect(() => {
    return () => {};
  }, []);

  if (!projId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Previewer
        projectId={projId}
        viewModel={"fullscreen"}
        virtualListRef={virtualListRef}
      ></Previewer>
    </div>
  );
};

export default FullScreen;
