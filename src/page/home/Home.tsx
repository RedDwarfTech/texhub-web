import TexHeader from "@/component/header/TexHeader";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import moderncv from "@/assets/cv/template/moderncv-legacy-template-zh.png";
import { UserService } from "rd-component";
import { toast, ToastContainer } from 'react-toastify';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleUseReq = () => {
        if(!UserService.isLoggedIn()){
            toast.warning("登录后即可体验");
            return;
        }
        navigate('/doc/tab');
    }

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.container}>
                <div className={styles.overview}>
                    <div className={styles.overviewContent}>
                        <h1>在线LaTeX</h1>
                        <h3>告别繁琐的安装，开箱即用</h3>
                        <button className="btn btn-primary" onClick={() => { handleUseReq() }}>立即体验</button>
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
            <ToastContainer />
        </div>
    );
}
export default Home;