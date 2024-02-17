import TexHeader from "@/component/header/TexHeader";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import moderncv from "@/assets/cv/template/moderncv-legacy-template-zh.png";
import onlineEditor from "@/assets/cv/template/tex-online-editor-compress.jpg";
import userProjects from "@/assets/cv/template/user-projects.jpg";
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
                        <h3>开箱即用、在线编译、云端协同，使用LaTeX更容易</h3>
                        <button className="btn btn-primary" onClick={() => { handleUseReq() }}>立即体验</button>
                    </div>
                </div>
                <div className={styles.template}>
                    <div className={styles.opRight}>
                        <h1>随时随地</h1>
                        <h4>云端编译、更便捷。</h4>
                        <h4>在线预览最新PDF、更高效。</h4>
                    </div>
                    <div className={styles.tplRight}>
                        <img src={onlineEditor} alt="Image 1" />
                    </div>
                </div>
                <div className={styles.templateDark}>
                    <div className={styles.tplRight}>
                        <img src={userProjects} alt="Image 2" />
                    </div>
                    <div className={styles.opRight}>
                        <h1>不止论文</h1>
                        <h4>一切有价值、需要长期保存的记忆</h4>
                    </div>
                </div>
                <div className={styles.template}>
                    <div className={styles.tplRight}>
                        <img src={moderncv} style={{width: '500px',height: '700px'}} alt="Image 2" />
                    </div>
                    <div className={styles.opRight}>
                        <h1>在线协作</h1>
                        <h3>同时编辑文档，并行不悖</h3>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
export default Home;