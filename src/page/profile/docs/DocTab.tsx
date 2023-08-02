import TexHeader from "@/component/header/TexHeader";
import styles from "./DocTab.module.css";
import React, { useState } from "react";
import { getDocList } from "@/service/doc/DocService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexDocModel } from "@/model/doc/TexDocModel";

const DocTab: React.FC = () => {

    const [userDocList, setUserDocList] = useState<TexDocModel[]>([]);
    const { docList } = useSelector((state: AppState) => state.doc);

    React.useEffect(() => {
        getDocList("all");
    }, []);

    React.useEffect(() => {
        setUserDocList(docList);
        console.log("doclist:", docList);
    }, [docList]);

    const renderDoc = () => {

    };

    return (
        <div>
            <TexHeader></TexHeader>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">全部</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">分享</a>
                </li>
            </ul>
        </div>
    );
}

export default DocTab;