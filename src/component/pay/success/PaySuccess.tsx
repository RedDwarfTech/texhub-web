import paySuccessIcon from "@/assets/icons/pay/pay-success.png";
import styles from "./PaySuccess.module.css";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import PayService from "@/service/pay/PayService";

const PaySuccess: React.FC = () => {
    const { t } = useTranslation();

    useEffect(() => {
        // Users reach this page straight from the payment provider, so the
        // access token still carries the expiry it was signed with before the
        // purchase. Re-sign it here, otherwise the plan only shows up after the
        // next sign-in.
        PayService.refreshAuthToken();
    }, []);

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
