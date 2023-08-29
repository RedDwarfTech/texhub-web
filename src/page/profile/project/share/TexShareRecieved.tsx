import { joinProject } from "@/service/project/ProjectService";
import { UserService } from "rd-component";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { useSearchParams } from "react-router-dom"

const TeXShareRecieved: React.FC = () => {

    const navigate = useNavigate();
    const { joinResult } = useSelector((state: AppState) => state.proj);
    const [searchParams, setSearchParams] = useSearchParams();
    const pid = searchParams.get("projectId");

    React.useEffect(() => {
        if (!UserService.isLoggedIn()) {
            navigate("/user/login");
        }
        handleJoin();
    }, []);

    React.useEffect(() => {
        if (joinResult && Object.keys(joinResult).length > 0) {
            navigate("/editor?pid=" + pid)
        }
    }, [joinResult]);

    const handleJoin = () => {
        if (pid) {
            let joinReq = {
                project_id: pid as string
            };
            joinProject(joinReq);
        }
    }

    return (
        <div>Share</div>
    );
}

export default TeXShareRecieved;