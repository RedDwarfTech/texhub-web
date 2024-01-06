import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { getProjectList, moveProject } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from 'react-toastify';
import { MoveProjReq } from "@/model/request/proj/edit/MoveProjReq";
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexProjectModel } from "@/model/proj/TexProjectModel";
import React from "react";

export type MoveProps = {
    projectId: string;
    projName: string | undefined;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    handleEditInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    currProject: any,
    folders: TexProjectFolder[]
};

const TeXMoveToFolder: React.FC<MoveProps> = (props: MoveProps) => {

    const editProjCancelRef = useRef<HTMLButtonElement>(null);
    const currProject = props.currProject;

    const handleProjMove = () => {
        if (!currProject || !currProject.project_id) {
            toast.info("请选择项目");
            return;
        }
        let proj: MoveProjReq = {
            project_id: currProject?.project_id,
            folder_id: 1
        };
        moveProject(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getProjectList(props.getProjFilter({}));
                if (editProjCancelRef && editProjCancelRef.current) {
                    editProjCancelRef.current.click();
                }
            } else {
                toast.error("移动项目失败，{}", resp.msg);
            }
        });
    }

    const renderSelected = () => {
        if(!props.folders || props.folders.length === 0){
            return;
        }
        const tagList: JSX.Element[] = [];
        props.folders.forEach((folderItem: TexProjectFolder) => {
            tagList.push(<option key={folderItem.id} value={folderItem.id}>{folderItem.folder_name}</option>);
        });
        return tagList;
    }

    return (
        <div>
            <div className="modal" id="moveProj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">移动到文件夹</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <select className="form-select" aria-label="Default select example">
                                {renderSelected()}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjMove() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXMoveToFolder;