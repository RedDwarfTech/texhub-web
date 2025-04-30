import React from "react";
import Previewer from "@/component/common/previewer/main/Previewer";

const FullScreen: React.FC = ({}) => {
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
      ></Previewer>
    </div>
  );
};

export default FullScreen;
