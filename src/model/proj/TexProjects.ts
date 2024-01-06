import { TexProjectFolder } from "./TexProjectFolder";
import { TexProjectModel } from "./TexProjectModel";

export interface TexProjects { 
    folders: TexProjectFolder[]; 
    projects: TexProjectModel[];
    
}