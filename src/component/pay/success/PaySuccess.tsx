import paySuccessIcon from "@/assets/icons/pay/pay-success.png";
import styles from "./PaySuccess.module.css";
import { useTranslation } from "react-i18next";

const PaySuccess: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.paySuccessBody}>
            <div className={styles.paySuccessIndicator}>
                <img src={paySuccessIcon}></img>
            </div>
            <div className={styles.paySuccessTip}>{t("pay_success")}</div>
        </div>
    );
}

export default PaySuccess;
