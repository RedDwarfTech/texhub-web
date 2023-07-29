import { TexFile } from "@/model/prj/TexFile";
import { TexTree } from "@/model/prj/TexTree";

export function getPrjTree() {
    const tf: TexFile = {
        id: 0,
        file_name: "test",
        file_type: 0,
        children: [
            
        ]
    };
    const tt: TexTree = {
        files: [tf]
    };
    return tt;
}