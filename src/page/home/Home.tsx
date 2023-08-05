import TexHeader from "@/component/header/TexHeader";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import moderncv from "@/assets/cv/template/moderncv-legacy-template-zh.png";

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.container}>
                <div className={styles.overview}>
                    <div className={styles.overviewContent}>
                        <h1>在线LaTeX</h1>
                        <h3>告别繁琐的安装，开箱即用</h3>
                        <button className="btn btn-primary" onClick={() => { navigate('/user/cv/list'); }}>立即体验</button>
                    </div>
                </div>
                <div className={styles.template}>
                    <div className={styles.opRight}>
                        <h1>在线协作</h1>
                        <h3>同时编辑文档，并行不悖</h3>
                    </div>
                    <div className={styles.tplRight}>
                        <img src={moderncv} style={{width: '500px',height: '700px'}} alt="Image 1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Home;