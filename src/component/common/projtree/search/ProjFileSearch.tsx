import { projSerach } from "@/service/project/ProjectService";
import styles from "./ProjFileSearch.module.css";
import { QueryFile } from "@/model/request/proj/search/QueryFile";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { SearchResult } from "@/model/proj/search/SearchResult";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import React from "react";
import {
  handleEnterProjSearch,
  handleProjSearch,
} from "./ProjFileSearchHandle";

export type ProjSearchProps = {
  closeSearch: () => void;
  projectId: string;
  searchComplete: (path: string[], projId: string) => void;
};

const ProjFileSearch: React.FC<ProjSearchProps> = (props: ProjSearchProps) => {
  const [searchWord, setSearchWord] = useState<string>("");
  const [hitItem, setHitItem] = useState<SearchResult[]>();
  const { hits } = useSelector((state: AppState) => state.proj);

  React.useEffect(() => {
    if (hits && hits.length > 0) {
      setHitItem(hits);
    }
  }, [hits]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const word = e.target.value;
    setSearchWord(word);
  };

  const handleMatchedClick = (item: SearchResult) => {
    if (item && item.file_path && item.file_path.length > 0) {
      let paths: string[] = item.file_path
        .split("/")
        .filter((str) => str !== "");
      paths.push(item.name);
      props.searchComplete(paths, props.projectId);
    }
  };

  const renderSearches = () => {
    if (!hitItem || hitItem.length == 0) return;
    const tagList: JSX.Element[] = [];
    for (let i = 0; i < hitItem.length; i++) {
      tagList.push(
        <div>
          <div className={styles.hitFile}>{hitItem[i].name}</div>
          <div>
            <i
              className={styles.matchedContent}
              onClick={() => {
                handleMatchedClick(hitItem[i]);
              }}
            >
              {hitItem[i].content}
            </i>
          </div>
        </div>
      );
    }
    return tagList;
  };

  return (
    <div>
      <div className={styles.searchHeader}>
        <span>在项目中检索</span>
        <button
          onClick={() => {
            props.closeSearch();
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div className={styles.search}>
        <input
          placeholder="输入检索关键字"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            handleEnterProjSearch(searchWord, props.projectId, e);
          }}
          type="text"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleInputChange(e);
          }}
        ></input>
        <button
          type="button"
          onClick={() => {
            handleProjSearch(searchWord, props.projectId);
          }}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>
      {renderSearches()}
    </div>
  );
};

export default ProjFileSearch;
