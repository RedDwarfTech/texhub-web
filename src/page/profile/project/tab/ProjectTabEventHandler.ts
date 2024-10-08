import { TexProjectModel } from "@/model/proj/TexProjectModel";
import { ProjTabType } from "@/model/proj/config/ProjTabType";
import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import {
  deleteProject,
  getProjectList,
} from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { toast } from "react-toastify";

export function handleProjDel(
  delProjCancelRef: any,
  currProject: TexProjectModel
) {
  if (!currProject) {
    toast.info("请选择删除项目");
  }
  let proj = {
    project_id: currProject?.project_id,
  };
  deleteProject(proj).then((resp) => {
    if (ResponseHandler.responseSuccess(resp)) {
      const cachedTab = localStorage.getItem("activeTab");
      const cachedTabVal = cachedTab ? parseInt(cachedTab) : ProjTabType.All;
      getProjectList(getProjFilter({}, cachedTabVal));
      if (delProjCancelRef && delProjCancelRef.current) {
        delProjCancelRef.current.click();
      }
    } else {
      toast.error("删除项目失败，{}", resp.msg);
    }
  });
}

export function getProjFilter(
  query: QueryProjReq,
  activeTab?: ProjTabType
): QueryProjReq {
  if (activeTab === ProjTabType.All) {
    return query;
  } else if (activeTab === ProjTabType.Shared) {
    query.role_id = 2;
    return query;
  } else if (activeTab === ProjTabType.Trash) {
    query.trash = 1;
  }
  query.proj_status = activeTab ? activeTab : ProjTabType.All;
  return query;
}
