export interface MoveFileReq { 
    project_id: string;
    file_id: string;
    file_name: string;
    parent_id: string;
    file_type: number;
    src_path: string;
    dist_path: string;
}