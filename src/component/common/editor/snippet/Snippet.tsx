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
import { useTranslation } from "react-i18next";

export type SnippetProps = {};

const Snippet: React.FC<SnippetProps> = (props: SnippetProps) => {
  const { snippets } = useSelector((state: AppState) => state.snippet);
  const [snippetModels, setSnippetModels] = useState<TexSnippetModel[]>();
  const [searchWord, setSearchWord] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [snippet, setSnippet] = useState<string>("");
  const [previewSnippet, setPreviewSnippet] = useState<string>("");
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    getSnippetList({});
  }, []);

  React.useEffect(() => {
    setSnippetModels(snippets);
  }, [snippets]);

  const columns = [
    {
      title: t("label_name"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("label_create_time"),
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
      title: t("btn_action"),
      dataIndex: "",
      key: "operations",
      render: (record: TexSnippetModel) => {
        return (
          <div key={record.id} className={styles.oper}>
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
              {t("btn_del")}
            </button>
            <div
              className="btn btn-primary"
              onClick={() => {
                setPreviewSnippet(record.snippet);
              }}
            >
              {t("btn_preview")}
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
      toast.warn(t("tips_enter_search_keyword"));
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
            placeholder={t("tips_input_snippet_title")}
          ></input>
          <textarea
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setSnippet(e.target.value);
            }}
            placeholder={t("tips_input_snippet")}
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
              {t("btn_confirm")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowAdd(false);
              }}
            >
              {t("btn_cancel")}
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
            <span className="m-1 pb-1 basis-3/4 text-xs">{t("btn_copy")}</span>
            <CopyToClipboard
              text={previewSnippet}
              onCopy={() => {
                toast.info(t("tips_code_copied"));
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
              {t("title_latex_snippet")}
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
                placeholder={t("tips_enter_keyword")}
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
                <i className="fa-solid fa-magnifying-glass">{t("btn_search")}</i>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowAdd(true);
                }}
              >
                {t("btn_add")}
              </button>
            </div>
            {renderAddSnippet()}
            <div className={styles.tableAction}>
              <Table columns={columns} data={snippetModels} rowKey={"id"}/>
            </div>
            {renderPreview()}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={() => {}}
            >
              {t("btn_confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snippet;
