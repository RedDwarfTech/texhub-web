import { QueryFile } from "@/model/request/proj/search/QueryFile";
import { projSerach } from "@/service/project/tree/ProjTreeService";
import { toast } from "react-toastify";

export const handleEnterProjSearch = (
  searchWord: string,
  projectId: string,
  event: React.KeyboardEvent<HTMLInputElement>
) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleProjSearch(searchWord, projectId);
  }
};

export const handleProjSearch = (searchWord: string, projectId: string) => {
  if (!searchWord || searchWord.length === 0) {
    toast.warn("请输入搜索关键字");
    return;
  }
  if (searchWord.length > 50) {
    toast.warn("目前仅支持关键字50字以内");
    return;
  }
  let req: QueryFile = {
    project_id: projectId,
    keyword: searchWord,
  };
  projSerach(req);
};
