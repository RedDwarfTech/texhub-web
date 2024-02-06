import { ReactComponent as PlusColumn } from '@/assets/icon/table-column-plus-before.svg';
import styles from "./TableDesigner.module.css";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export type TableDesignerProps = {

};

const TableDesigner: React.FC<TableDesignerProps> = (props: TableDesignerProps) => {

    const code = `\begin{table}[]
	\centering
	\begin{tabular}{llll}
		 &  &  &  \\
		 &  &  &  \\
		 &  &  & 
	\end{tabular}
	\caption{}
	\label{tab:my-table}
\end{table}`;

    return (
        <div className="modal fade" id="tableDesignerModal" aria-labelledby="tableDesignerLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="tableDesignerLabel">表格设计器</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div>
                            <div className={styles.modalAddRow}>
                                <PlusColumn width={'20px'} height={'20px'}></PlusColumn>
                            </div>
                            <div className="modal-col"></div>
                        </div>
                        <hr />
                        <div>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">生成LaTeX代码</button>
                        </div>
                        <div className={styles.codeShow}>
                            <SyntaxHighlighter language="latex" style={dark}>
                                {code}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { }}>确定</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TableDesigner;