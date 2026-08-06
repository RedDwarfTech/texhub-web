import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { AnyAction, Store } from "redux";
import { OrderService, UserService } from "rd-component";
import { ResponseHandler } from "rdjs-wheel";
import PayService from "@/service/pay/PayService";
import { IapProduct } from "@/models/product/IapProduct";
import { IOrder } from "@/models/pay/IOrder";
import styles from "./Checkout.module.css";

export type CheckoutPayProvider = "wechat" | "alipay" | "bankcard";

export interface CheckoutProps {
  open: boolean;
  product: IapProduct | null;
  store: Store<any, AnyAction>;
  refreshUrl?: string;
  onClose: () => void;
}

type CheckoutStep = "confirm" | "qrcode" | "result";

const QR_EXPIRE_SECONDS = 15 * 60;

const formatCountdown = (seconds: number): string => {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
};

const Checkout: React.FC<CheckoutProps> = ({ open, product, store, refreshUrl = "", onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>("confirm");
  const [payProvider, setPayProvider] = useState<CheckoutPayProvider>("wechat");
  const [createdOrder, setCreatedOrder] = useState<IOrder>();
  const [paying, setPaying] = useState(false);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(QR_EXPIRE_SECONDS);
  const [memberExpireAt, setMemberExpireAt] = useState("");

  useEffect(() => {
    if (open) {
      setStep("confirm");
      setPayProvider("wechat");
      setCreatedOrder(undefined);
      setCountdown(QR_EXPIRE_SECONDS);
      setMemberExpireAt("");
    }
  }, [open, product]);

  useEffect(() => {
    if (step !== "qrcode") {
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  if (!open || !product) {
    return null;
  }

  const parseBenefits = (description: string): string[] => {
    try {
      const parsed = JSON.parse(description);
      return Array.isArray(parsed) ? parsed.map((item: any) => String(item)) : [];
    } catch {
      return [];
    }
  };

  const benefits = parseBenefits(product.description || "");

  const providerOptions: { key: CheckoutPayProvider; label: string; disabled?: boolean; suffix?: string }[] = [
    { key: "wechat", label: t("checkout_wechat") },
    { key: "alipay", label: t("checkout_alipay") },
    { key: "bankcard", label: t("checkout_bank_card"), disabled: true, suffix: t("checkout_bank_card_soon") },
  ];

  const handleClose = () => {
    onClose();
  };

  const handleConfirmPay = () => {
    if (!product || payProvider === "bankcard") {
      return;
    }
    setPaying(true);
    PayService.doPay(
      { productId: Number(product.id) },
      store,
      payProvider === "wechat" ? "wechat" : undefined
    ).then((resp: any) => {
      setPaying(false);
      if (!resp || !ResponseHandler.responseSuccess(resp)) {
        toast.error(t("checkout_create_order_failed"));
        return;
      }
      const order = resp.result as IOrder;
      setCreatedOrder(order);
      setCountdown(QR_EXPIRE_SECONDS);
      setStep("qrcode");
    });
  };

  const resolveMemberExpire = () => {
    if (!refreshUrl) {
      return;
    }
    UserService.loadCurrUser(true, refreshUrl).then(() => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const expireMs = Number(userInfo.autoRenewProductExpireTimeMs);
        if (expireMs > 0) {
          const date = new Date(expireMs);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          setMemberExpireAt(`${yyyy}-${mm}-${dd}`);
        }
      } catch {
        // ignore invalid user info
      }
    });
  };

  const handleCheckOrderStatus = () => {
    if (!createdOrder || !createdOrder.orderId) {
      toast.error(t("order_not_found"));
      return;
    }
    setChecking(true);
    OrderService.getOrderStatus(createdOrder.orderId, store).then((resp: any) => {
      setChecking(false);
      if (!resp || !ResponseHandler.responseSuccess(resp)) {
        toast.warning(t("order_check_failed"));
        return;
      }
      if (Number(resp.result.orderStatus) === 1) {
        resolveMemberExpire();
        setStep("result");
      } else {
        toast.warning(t("order_unpaid_warning"));
      }
    });
  };

  const handleRefreshQR = () => {
    setCountdown(QR_EXPIRE_SECONDS);
    handleConfirmPay();
  };

  const handleStartLearning = () => {
    handleClose();
    navigate("/");
  };

  const handleViewOrder = () => {
    handleClose();
    navigate("/product/pay/success");
  };

  const renderConfirm = () => {
    return (
      <div className={styles.checkoutBody}>
        <div className={styles.orderPanel}>
          <div className={styles.orderTitle}>{t("checkout_order_confirm")}</div>
          <div className={styles.orderDivider}></div>
          <div className={styles.productRow}>
            <span className={styles.productIcon}>📦</span>
            <span className={styles.productTitle}>
              {product.productTitle} · {t("checkout_member_privileges")}
            </span>
          </div>
          <div className={styles.orderDivider}></div>
          <div className={styles.benefitTitle}>{t("checkout_member_benefits")}</div>
          <div className={styles.benefitList}>
            {benefits.map((item, index) => (
              <div key={index} className={styles.benefitItem}>
                <span className={styles.benefitCheck}>✅</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className={styles.orderDivider}></div>
          <div className={styles.amountRow}>
            <span>{t("checkout_amount")}</span>
            <span className={styles.amount}>
              ¥{product.price}
            </span>
          </div>
        </div>

        <div className={styles.sectionTitle}>{t("checkout_select_pay_method")}</div>
        <div className={styles.providerList}>
          {providerOptions.map((option) => (
            <div
              key={option.key}
              className={`${styles.providerItem} ${payProvider === option.key ? styles.providerActive : ""} ${option.disabled ? styles.providerDisabled : ""}`}
              onClick={() => {
                if (!option.disabled) {
                  setPayProvider(option.key);
                }
              }}
            >
              <span className={styles.providerName}>{option.label}</span>
              {option.suffix && <span className={styles.providerSuffix}>{option.suffix}</span>}
              {!option.disabled && payProvider === option.key && <span className={styles.providerCheck}>✓</span>}
            </div>
          ))}
        </div>

        <button
          className={styles.confirmBtn}
          onClick={handleConfirmPay}
          disabled={paying || payProvider === "bankcard"}
        >
          {paying ? t("checkout_processing") : `🎯 ${t("checkout_confirm_pay")} ¥${product.price}`}
        </button>

        <div className={styles.footer}>
          <span>{t("checkout_supported_payment")}</span>
          <span className={styles.secure}>
            🔒 {t("checkout_encrypted_transmission")}
          </span>
        </div>
      </div>
    );
  };

  const renderQrCode = () => {
    return (
      <div className={styles.qrBody}>
        <div className={styles.qrHeader}>
          <span>{payProvider === "wechat" ? t("checkout_wechat") : t("checkout_alipay")} {t("checkout_scan_pay")}</span>
          <span className={styles.qrCountdown}>⏱️ {formatCountdown(countdown)}</span>
        </div>
        <div className={styles.qrImg}>
          {createdOrder && createdOrder.formText ? (
            payProvider === "wechat" ? (
              <QRCodeSVG value={createdOrder.formText} size={200} includeMargin />
            ) : (
              <iframe srcDoc={createdOrder.formText} width="200" height="205" title="pay-qr"></iframe>
            )
          ) : (
            <div className={styles.qrPlaceholder}></div>
          )}
        </div>
        {countdown <= 0 ? (
          <div className={styles.qrExpired}>
            <div>{t("checkout_qr_expired")}</div>
            <button className={styles.qrRefreshBtn} onClick={handleRefreshQR}>
              {t("checkout_qr_refresh")}
            </button>
          </div>
        ) : (
          <p className={styles.qrTip}>{t("checkout_scan_tip", { provider: payProvider === "wechat" ? t("checkout_wechat") : t("checkout_alipay") })}</p>
        )}
        <div className={styles.qrAmount}>
          {t("checkout_pay_amount")}：¥{product.price}
        </div>
        <div className={styles.orderDivider}></div>
        <div className={styles.qrActions}>
          <a className={styles.qrIssue}>{t("checkout_pay_issue")}</a>
          <button
            className={styles.paidBtn}
            onClick={handleCheckOrderStatus}
            disabled={checking}
          >
            {checking ? t("checkout_checking") : t("checkout_i_have_paid")}
          </button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    return (
      <div className={styles.resultBody}>
        <div className={styles.resultIcon}>✅</div>
        <div className={styles.resultTitle}>{t("checkout_pay_success_title")} 🎉</div>
        <div className={styles.resultMember}>{t("checkout_become_member", { title: product.productTitle })}</div>
        {memberExpireAt && (
          <div className={styles.resultExpire}>
            {t("checkout_member_valid_until")} {memberExpireAt}
          </div>
        )}
        <div className={styles.resultActions}>
          <button className={styles.resultPrimaryBtn} onClick={handleStartLearning}>
            {t("checkout_start_learning")}
          </button>
          <button className={styles.resultGhostBtn} onClick={handleViewOrder}>
            {t("checkout_view_order")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.mask}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.headerSecure}>🔒 {t("checkout_secure_pay")}</span>
          <button className={styles.closeBtn} onClick={handleClose}>
            ✕
          </button>
        </div>
        {step === "confirm" && renderConfirm()}
        {step === "qrcode" && renderQrCode()}
        {step === "result" && renderResult()}
      </div>
    </div>
  );
};

export default Checkout;
