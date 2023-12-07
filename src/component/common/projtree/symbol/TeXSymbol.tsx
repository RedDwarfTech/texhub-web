import { symbolMap } from '@/common/TeXInfo';
import styles from './TeXSymbol.module.css';

export type ProjSymbolProps = {

};

const TeXSymbol: React.FC<ProjSymbolProps> = (props: ProjSymbolProps) => {

    const renderBaseSymbol = () => {
        const symList: JSX.Element[] = [];
        symbolMap.forEach((value, key) => {
            symList.push(<div className={styles.symbol}>{key}</div>);
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
