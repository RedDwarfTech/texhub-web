import React, { ChangeEvent, useState } from "react";
import styles from "./SnippetAdd.module.css";
import { getSnippetList } from "@/service/project/SnippetService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexSnippetModel } from "@/model/snippet/TexSnippetModel";
import { useTranslation } from "react-i18next";

export type SnippetProps = {

};

const SnippetAdd: React.FC<SnippetProps> = (props: SnippetProps) => {

    const { snippets } = useSelector((state: AppState) => state.snippet);
    const [snippetModels, setSnippetModels] = useState<TexSnippetModel[]>();
    const [searchWord, setSearchWord] = useState<string>('');
    const [curSnippet, setCurSnippet] = useState<string>('');
    const { t } = useTranslation();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const word = e.target.value;
        setSearchWord(word);
    }

    const addSnippet = () => {
        
    }

    return (<div className="modal fade" id="snippetAddModal" aria-labelledby="snippetAddLabel" aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="tableDesignerLabel">{t("title_add_latex_snippet")}</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <input id="editProjName"
                                onChange={handleInputChange}
                                className="form-control"
                                value={curSnippet}
                                placeholder={t("tips_proj_name")}></input>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">{t("btn_cancel")}</button>
                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { }}>{t("btn_confirm")}</button>
                </div>
            </div>
        </div>
    </div>);
}

export default SnippetAdd;
