import React, { ChangeEvent, useState } from "react";
import styles from "./SnippetAdd.module.css";
import { getSnippetList } from "@/service/project/SnippetService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexSnippetModel } from "@/model/snippet/TexSnippetModel";

export type SnippetProps = {

};

const SnippetAdd: React.FC<SnippetProps> = (props: SnippetProps) => {

    const { snippets } = useSelector((state: AppState) => state.snippet);
    const [snippetModels, setSnippetModels] = useState<TexSnippetModel[]>();
    const [searchWord, setSearchWord] = useState<string>('');
    const [curSnippet, setCurSnippet] = useState<string>('');

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
                    <h5 className="modal-title" id="tableDesignerLabel">新增LaTeX代码片段</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <input id="editProjName"
                                onChange={handleInputChange}
                                className="form-control"
                                value={curSnippet}
                                placeholder="项目名称"></input>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { }}>确定</button>
                </div>
            </div>
        </div>
    </div>);
}

export default SnippetAdd;