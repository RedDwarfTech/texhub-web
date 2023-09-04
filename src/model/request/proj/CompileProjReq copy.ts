export interface CompileProjReq { 
    project_id: string,
    req_time: number,
    file_name: string,
    /** temp auth code */
    tac?: string
}