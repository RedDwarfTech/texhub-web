import React, { ChangeEvent, useState } from "react";
import styles from "./Snippet.module.css";
import Table from "rc-table";
import { addSnippet, getSnippetList } from "@/service/project/SnippetService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexSnippetModel } from "@/model/snippet/TexSnippetModel";
import { toast } from "react-toastify";
import { AddSnippetReq } from "@/model/request/snippet/add/AddSnippetReq";
import { ResponseHandler } from "rdjs-wheel";

export type SnippetProps = {};

const Snippet: React.FC<SnippetProps> = (props: SnippetProps) => {
  const { snippets } = useSelector((state: AppState) => state.snippet);
  const [snippetModels, setSnippetModels] = useState<TexSnippetModel[]>();
  const [searchWord, setSearchWord] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [snippet, setSnippet] = useState<string>("");
  const [showAdd, setShowAdd] = useState<boolean>(false);

  React.useEffect(() => {
    getSnippetList({});
  }, []);

  React.useEffect(() => {
    if (snippets && snippets.length > 0) {
      setSnippetModels(snippets);
    }
  }, [snippets]);

  const columns = [
    {
      title: "名称",
      dataIndex: "snippet",
      key: "snippet",
      width: 100,
    },
    {
      title: "操作",
      dataIndex: "",
      key: "operations",
      render: () => {
        return (
          <div className={styles.oper}>
            <a href="#">删除</a>
            <a href="#">预览</a>
            <a href="#">编辑</a>
          </div>
        );
      },
    },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const word = e.target.value;
    setSearchWord(word);
  };

  const handleSnippetSearch = () => {
    if (!searchWord || searchWord.length === 0) {
      toast.warn("请输入搜索关键字");
      return;
    }
  };

  const renderAddSnippet = () => {
    if(showAdd){
        return <div className={styles.snipAdd}>
            <input onChange={(e: ChangeEvent<HTMLInputElement>)=>{
                setTitle(e.target.value);
            }} placeholder="输入标题"></input>
            <textarea onChange={(e: ChangeEvent<HTMLTextAreaElement>)=>{
                setSnippet(e.target.value);
            }} placeholder="输入代码片段" rows={5}></textarea>
            <div className={styles.snipAddOper}>
            <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                    let addSnippetReq: AddSnippetReq = {
                        snippet: snippet,
                        title: title
                    };
                    addSnippet(addSnippetReq).then((resp)=>{
                        if(ResponseHandler.responseSuccess(resp)){
                            setShowAdd(false);
                        }
                    });
                }}
              >
                确定
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                    setShowAdd(false);
                }}
              >
                取消
              </button>
            </div>
        </div>;
    }else{
        return <div></div>;
    }
  };

  return (
    <div
      className="modal fade modal-lg"
      id="snippetModal"
      aria-labelledby="snippetLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="tableDesignerLabel">
              LaTeX代码片段
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className={styles.search}>
              <input
                placeholder="输入检索关键字"
                type="text"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleInputChange(e);
                }}
              ></input>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleSnippetSearch();
                }}
              >
                <i className="fa-solid fa-magnifying-glass">搜索</i>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                    setShowAdd(true);
                }}
              >
                添加
              </button>
            </div>
            {renderAddSnippet()}
            <div className={styles.tableAction}>
              <Table columns={columns} data={snippetModels} />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={() => {}}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snippet;
