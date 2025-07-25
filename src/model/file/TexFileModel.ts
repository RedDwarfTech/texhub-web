export interface TexFileModel { 
    id: string; 
    name: string;
    template_id: string;
    created_time: string;
    updated_time: string;
    file_path: string;
    project_id: string;
    file_id: string;
    main_flag: number;
    file_type: number;
    yjs_initial: number;
    parent: string;
    expand: boolean;
    children: TexFileModel[]
}