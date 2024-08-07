import { TexFileModel } from "@/model/file/TexFileModel";
import { MoveFileReq } from "@/model/request/file/edit/MoveFileReq";
import { getFolderTree, mvFile } from "@/service/file/FileService";
import { useState } from "react";
import Tree from 'antd/lib/tree';
import type { GetProps, TreeDataNode } from 'antd';
import 'antd/lib/tree/style';
import React from "react";
import { toast } from "react-toastify";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { getProjectInfo } from "@/service/project/ProjectService";
import { BaseMethods, ResponseHandler } from "rdjs-wheel";
import { useTranslation } from "react-i18next";

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;
const { DirectoryTree } = Tree;

export type TreeFileEditProps = {
    projectId: string;
    texFile: TexFileModel;
};

const TreeFileMove: React.FC<TreeFileEditProps> = (props: TreeFileEditProps) => {

    const [texFileModel, setTexFileModel] = useState<TreeDataNode[]>();
    const [distFileId, setDistFileId] = useState<string>();
    const { folderTree } = useSelector((state: AppState) => state.file);
    const { t } = useTranslation();

    React.useEffect(() => {
        const modalElement = document.getElementById('moveFileModal');
        if (modalElement) {
            modalElement.addEventListener('shown.bs.modal', handleModalShown);
        }

        return () => {
            if (modalElement) {
                modalElement.removeEventListener('shown.bs.modal', handleModalShown);
            }
        };
    }, []);

    const handleModalShown = () => {
        getFolderTree(props.projectId);
    };

    const convertToTreeDataNode = (data: TexFileModel[]): TreeDataNode[] => {
        return data.map(item => {
            const node: TreeDataNode = {
                key: String(item.file_id),
                title: item.name,
                children: item.children.length > 0 ? convertToTreeDataNode(item.children) : undefined
            };
            return node;
        });
    };

    React.useEffect(() => {
        if (folderTree && !BaseMethods.isNull(folderTree)) {
            let nodes = [];
            nodes.push(folderTree);
            const treeData: TreeDataNode[] = convertToTreeDataNode(nodes);
            setTexFileModel(treeData);
        } 
    }, [folderTree]);

    const handleOk = () => {
        if (!distFileId) {
            toast.warn("请选择目标文件夹");
            return;
        }
        let req: MoveFileReq = {
            project_id: props.projectId,
            file_id: props.texFile.file_id,
            dist_file_id: distFileId
        };
        mvFile(req).then((resp) => {
            if(ResponseHandler.responseSuccess(resp)) {
                let query: QueryProjInfo = {
                    project_id: props.projectId
                };
                getProjectInfo(query);
            }
        });
    }

    const onSelect: DirectoryTreeProps['onSelect'] = (keys: React.Key[], info) => {
        const selectedKey: React.Key = keys[0];
        setDistFileId(String(selectedKey));
    };

    const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
        console.log('Trigger Expand', keys, info);
    };

    return (
        <div className="modal fade" id="moveFileModal" aria-labelledby="moveModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="moveModalLabel">{t("btn_move_to_folder")}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <DirectoryTree
                            multiple
                            defaultExpandAll
                            onSelect={onSelect}
                            onExpand={onExpand}
                            treeData={texFileModel}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { handleOk() }}>确定</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TreeFileMove;
