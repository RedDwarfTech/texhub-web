import { projSerach } from '@/service/project/ProjectService';
import styles from './ProjFileSearch.module.css';
import { QueryFile } from '@/model/request/proj/search/QueryFile';
import { ChangeEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { SearchResult } from '@/model/proj/search/SearchResult';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import React from 'react';

export type ProjSearchProps = {
    closeSearch: () => void;
    projectId: string;
};

const ProjFileSearch: React.FC<ProjSearchProps> = (props: ProjSearchProps) => {

    const [searchWord, setSearchWord] = useState<string>('');
    const [hitItem, setHitItem] = useState<SearchResult[]>();
    const { hits } = useSelector((state: AppState) => state.proj);

    React.useEffect(() => {
        if (hits && hits.length > 0) {
            setHitItem(hits);
        }
    }, [hits]);

    const handleProjSearch = () => {
        if (!searchWord || searchWord.length === 0) {
            toast.warn("请输入搜索关键字");
            return;
        }
        let req: QueryFile = {
            project_id: props.projectId,
            keyword: searchWord
        };
        projSerach(req);
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const word = e.target.value;
        setSearchWord(word);
    }

    const renderSearches = () => {
        if (!hitItem || hitItem.length == 0) return;
        const tagList: JSX.Element[] = [];
        for (let i = 0; i < hitItem.length; i++) {
            debugger
            tagList.push(
                <div>
                    <div className={styles.hitFile}>
                        {hitItem[i].name}
                    </div>
                    <div>
                        <i>{hitItem[i].content}</i>
                    </div>
                </div>
            );
        }
        return tagList;
    }

    return (
        <div>
            <div className={styles.searchHeader}>
                <span>在项目中检索</span>
                <button onClick={() => { props.closeSearch() }}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div className={styles.search}>
                <input placeholder="输入检索关键字" type="text"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => { handleInputChange(e) }}>
                </input>
                <button type="button" onClick={() => { handleProjSearch() }}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>
            {renderSearches()}
        </div>
    );
}

export default ProjFileSearch;
