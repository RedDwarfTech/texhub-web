import { TexFileModel } from "../file/TexFileModel";
import { TexProjectModel } from "./TexProjectModel";

export interface ProjInfo { 
    main: TexProjectModel,
    main_file: TexFileModel,
    tree: TexFileModel[]
}