import React, { ChangeEvent, useState } from "react";
import styles from "./Snippet.module.css";
import Table from "rc-table";
import {
  addSnippet,
  delSnippet,
  getSnippetList,
} from "@/service/project/SnippetService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexSnippetModel } from "@/model/snippet/TexSnippetModel";
import { toast } from "react-toastify";
import { AddSnippetReq } from "@/model/request/snippet/add/AddSnippetReq";
import { ResponseHandler } from "rdjs-wheel";
import { QuerySnippetReq } from "@/model/request/snippet/query/QuerySnippetReq";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import dayjs from "dayjs";

export type SnippetProps = {};

const Snippet: React.FC<SnippetProps> = (props: SnippetProps) => {
  const { snippets } = useSelector((state: AppState) => state.snippet);
  const [snippetModels, setSnippetModels] = useState<TexSnippetModel[]>();
  const [searchWord, setSearchWord] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [snippet, setSnippet] = useState<string>("");
  const [previewSnippet, setPreviewSnippet] = useState<string>("");
  const [showAdd, setShowAdd] = useState<boolean>(false);

  React.useEffect(() => {
    getSnippetList({});
  }, []);

  React.useEffect(() => {
    setSnippetModels(snippets);
  }, [snippets]);

  const columns = [
    {
      title: "名称",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "创建时间",
      dataIndex: "created_time",
      key: "created_time",
      render: (value: number) => {
        const formattedDate = dayjs
          .unix(value / 1000)
          .format("YYYY-MM-DD HH:mm:ss");
        return formattedDate;
      },
    },
    {
      title: "操作",
      dataIndex: "",
      key: "operations",
      render: (record: TexSnippetModel) => {
        return (
          <div className={styles.oper}>
            <button
              className="btn btn-danger"
              onClick={() => {
                delSnippet(record.id).then((resp) => {
                  if (ResponseHandler.responseSuccess(resp)) {
                    getSnippetList({});
                  }
                });
              }}
            >
              删除
            </button>
            <div
              className="btn btn-primary"
              onClick={() => {
                setPreviewSnippet(record.snippet);
              }}
            >
              预览
            </div>
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
    let query: QuerySnippetReq = {
      title: searchWord,
    };
    getSnippetList(query);
  };

  const renderAddSnippet = () => {
    if (showAdd) {
      return (
        <div className={styles.snipAdd}>
          <input
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setTitle(e.target.value);
            }}
            placeholder="输入标题"
          ></input>
          <textarea
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setSnippet(e.target.value);
            }}
            placeholder="输入代码片段"
            rows={5}
          ></textarea>
          <div className={styles.snipAddOper}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                let addSnippetReq: AddSnippetReq = {
                  snippet: snippet,
                  title: title,
                };
                addSnippet(addSnippetReq).then((resp) => {
                  if (ResponseHandler.responseSuccess(resp)) {
                    setShowAdd(false);
                    getSnippetList({});
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
        </div>
      );
    } else {
      return <div></div>;
    }
  };

  const renderPreview = () => {
    if (previewSnippet) {
      return (
        <div className={styles.codeShow}>
          <SyntaxHighlighter language="latex" style={dark}>
            {previewSnippet}
          </SyntaxHighlighter>
          <button className="btn btn-primary">
            <span className="m-1 pb-1 basis-3/4 text-xs">{"复制"}</span>
            <CopyToClipboard
              text={previewSnippet}
              onCopy={() => {
                toast.info("代码已复制");
              }}
            >
              <i className="fa fa-copy"></i>
            </CopyToClipboard>
          </button>
        </div>
      );
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
            {renderPreview()}
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
