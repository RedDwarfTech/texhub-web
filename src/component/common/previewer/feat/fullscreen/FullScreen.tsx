import Previewer from "../../Previewer";

const FullScreen: React.FC = ({}) => {
    const params = new URLSearchParams(window.location.search);
    const projId = params.get("projId");
    if(!projId){
        return (<div>Loading...</div>);
    }

    return (<div><Previewer projectId={projId}></Previewer></div>);
}

export default FullScreen;