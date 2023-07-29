export interface TexFile { 
    id: number; 
    file_name: string;
    file_type: number;
    children: TexFile[];
}