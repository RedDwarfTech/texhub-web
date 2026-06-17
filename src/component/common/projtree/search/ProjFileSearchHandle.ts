import { QueryFile } from "@/model/request/proj/search/QueryFile";
import { projSerach } from "@/service/project/tree/ProjTreeService";
import { toast } from "react-toastify";
import i18n from "i18next";

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
    toast.warn(i18n.t("tips_enter_search_keyword"));
    return;
  }
  if (searchWord.length > 50) {
    toast.warn(i18n.t("tips_keyword_max_50"));
    return;
  }
  let req: QueryFile = {
    project_id: projectId,
    keyword: searchWord,
  };
  projSerach(req);
};
