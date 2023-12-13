import styles from "./ProjHistory.module.css";

const ProjHistory: React.FC = () => {
    return (
        <div className="offcanvas offcanvas-end" tab-index="-1" id="projHistory" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h6 className="offcanvas-title" id="projHistoryLabel">项目历史</h6>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                history list
            </div>
        </div>
    );
}

export default ProjHistory;