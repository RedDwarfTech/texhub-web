import { joinProject } from "@/service/project/ProjectService";
import { UserService } from "rd-component";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from 'query-string';
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";

const TeXShareRecieved: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const search = location.search;
    const params = queryString.parse(search);
    const pid = params.pid!;
    const { joinResult } = useSelector((state: AppState) => state.proj);

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
                project_id: pid as String
            };
            joinProject(joinReq);

        } else {
            toast.error("project信息为空");
            return;
        }
    }



    return (
        <div>Share</div>
    );
}

export default TeXShareRecieved;