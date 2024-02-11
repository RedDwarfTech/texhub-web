import React, { ChangeEvent, useState } from "react";
import styles from "./Snippet.module.css";
import Table from 'rc-table';
import { getSnippetList } from "@/service/project/SnippetService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexSnippetModel } from "@/model/snippet/TexSnippetModel";
import { toast } from "react-toastify";

export type SnippetProps = {

};

const Snippet: React.FC<SnippetProps> = (props: SnippetProps) => {

    const { snippets } = useSelector((state: AppState) => state.snippet);
    const [snippetModels, setSnippetModels] = useState<TexSnippetModel[]>();
    const [searchWord, setSearchWord] = useState<string>('');

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
            title: '名称',
            dataIndex: 'snippet',
            key: 'snippet',
            width: 100,
        },
        {
            title: '操作',
            dataIndex: '',
            key: 'operations',
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
    }

    const handleSnippetSearch = () => {
        if (!searchWord || searchWord.length === 0) {
            toast.warn("请输入搜索关键字");
            return;
        }
    }

    return (<div className="modal fade" id="snippetModal" aria-labelledby="snippetLabel" aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="tableDesignerLabel">LaTeX代码片段</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <div>
                        <input placeholder="输入检索关键字" type="text"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => { handleInputChange(e) }}>
                        </input>
                        <button type="button" onClick={() => { handleSnippetSearch() }}>
                            <i className="fa-solid fa-magnifying-glass">搜索</i>
                        </button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { }}>添加</button>
                    </div>
                    <div className={styles.tableAction}>
                        <Table columns={columns} data={snippetModels} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { }}>确定</button>
                </div>
            </div>
        </div>
    </div>);
}

export default Snippet;