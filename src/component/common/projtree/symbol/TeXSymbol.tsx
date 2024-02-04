import { symbolMap } from '@/common/TeXInfo';
import styles from './TeXSymbol.module.css';
import { insertTextToEditor } from '@/service/project/ProjectService';

export type ProjSymbolProps = {

};

const TeXSymbol: React.FC<ProjSymbolProps> = (props: ProjSymbolProps) => {

    const handleSymbolClick = (e: React.MouseEvent<HTMLDivElement>, command: string) => {
        e.preventDefault;
        e.stopPropagation;
        insertTextToEditor(command);
    }

    const renderBaseSymbol = () => {
        const symList: JSX.Element[] = [];
        symbolMap.forEach((value, key) => {
            symList.push(
                <div className={styles.symbol} onClick={(e) => handleSymbolClick(e, value)}>{key}</div>
            );
        });
        return symList;
    }

    const renderExtSymbol = () => { }

    return (
        <div className={styles.symbolContainer}>
            {renderBaseSymbol()}
        </div>
    )
}

export default TeXSymbol;
