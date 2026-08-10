export interface CompileProjLog { 
    project_id: string,
    file_name: string,
    version_no: number,
    qid: number,
    /** 
     * eventsource did not support put JWT token into header
     * so put the JWT token in query parameter to do the authorize 
     *  
     * */
    access_token: string,
}