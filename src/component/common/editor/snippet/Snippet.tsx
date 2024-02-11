import React from "react";
import styles from "./Snippet.module.css";
import Table from 'rc-table';
import { getSnippetList } from "@/service/project/SnippetService";

export type SnippetProps = {

};

const Snippet: React.FC<SnippetProps> = (props: SnippetProps) => {

    React.useEffect(() => {
        getSnippetList({});
    }, []);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 100,
        },
        {
            title: 'Operations',
            dataIndex: '',
            key: 'operations',
            render: () => <a href="#">删除</a>,
        },
    ];

    const data = [
        { name: 'Jack' },
        { name: 'Rose' },
    ];

    return (<div className="modal fade" id="snippetModal" aria-labelledby="snippetLabel" aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="tableDesignerLabel">LaTeX代码片段</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <div className={styles.tableAction}>
                        <Table columns={columns} data={data} />
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