export interface TexFileModel { 
    id: number; 
    name: String;
    template_id: number;
    created_time: string;
    updated_time: string;
    project_id: string;
    file_id: string;
    main_flag: number;
    file_type: number;
    yjs_initial: number;
    parent: string;
    expand: boolean;
    children: TexFileModel[]
}