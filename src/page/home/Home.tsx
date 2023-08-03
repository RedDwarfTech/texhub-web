import TexHeader from "@/component/header/TexHeader";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";

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
            </div>
        </div>
    );
}
export default Home;