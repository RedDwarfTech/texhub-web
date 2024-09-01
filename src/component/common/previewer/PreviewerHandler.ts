import { readConfig } from "@/config/app/config-reader";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { QuerySrcPos } from "@/model/request/proj/query/QuerySrcPos";
import { getSrcPosition } from "@/service/project/ProjectService";
import { toast } from "react-toastify";

/**
 * get the source location by pdf file position
 * @returns src position info
 */
export const handleSrcLocate = (projectId: string, curProjInfo: ProjInfo) => {
  if (!projectId) {
    toast.info("项目信息为空");
    return;
  }
  let curPage = localStorage.getItem(readConfig("pdfCurPage") + projectId);
  let req: QuerySrcPos = {
    project_id: projectId,
    main_file: curProjInfo?.main_file.name || "main.tex",
    page: Number(curPage) || 1,
    h: 3.565,
    v: 4.563,
  };
  getSrcPosition(req);
};
