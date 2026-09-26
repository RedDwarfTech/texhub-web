import TexHeader from "@/component/header/TexHeader";
import styles from "./OrderDetail.module.css";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getOrderStatusLabel } from "rd-component";
import { ResponseHandler, TimeUtils } from "rdjs-wheel";
import { toast } from "react-toastify";
import OrderDetailService from "@/service/order/OrderDetailService";
import { IOrderDetail } from "@/models/order/IOrderDetail";

/** Mirrors rust_wheel::model::enums::rd_pay_type::RdPayType */
const payChannelKeys: Record<number, string> = {
  1: "pay_channel_wechat",
  2: "pay_channel_alipay",
  3: "pay_channel_paypal",
};

const OrderDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [order, setOrder] = useState<IOrderDetail>();
  const [loading, setLoading] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  const loadOrderDetail = useCallback(() => {
    if (!orderId) {
      return;
    }
    setLoading(true);
    OrderDetailService.getOrderDetail(orderId).then((resp: any) => {
      setLoading(false);
      if (!resp || !ResponseHandler.responseSuccess(resp) || !resp.result) {
        // A failed envelope with an empty order id means the order does not
        // exist or is not owned by this user, anything else is a real failure.
        const missing = !!(resp && resp.result && !resp.result.orderId);
        setFailed(true);
        setNotFound(missing);
        if (!missing) {
          toast.error(t("order_check_failed"));
        }
        return;
      }
      setFailed(false);
      setNotFound(false);
      setOrder({
        orderId: String(resp.result.orderId || orderId),
        orderStatus: Number(resp.result.orderStatus),
        totalPrice: String(resp.result.totalPrice),
        subject: String(resp.result.subject || ""),
        payChannel: Number(resp.result.payChannel),
        createdTime: Number(resp.result.createdTime),
      });
    });
  }, [orderId, t]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const renderStatus = (orderStatus: number) => {
    return (
      <span
        className={`${styles.statusBadge} ${styles[`status${orderStatus}`]}`}
      >
        {getOrderStatusLabel(orderStatus, t)}
      </span>
    );
  };

  const renderInfoRow = (label: string, value: React.ReactNode) => {
    return (
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
      </div>
    );
  };

  const renderBody = () => {
    if (!orderId) {
      return <div className={styles.tip}>{t("order_not_found")}</div>;
    }
    if (loading && !order) {
      return (
        <div className={styles.loading}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">{t("tips_loading")}</span>
          </div>
        </div>
      );
    }
    if (notFound && !order) {
      return <div className={styles.tip}>{t("order_not_found")}</div>;
    }
    if (failed && !order) {
      return <div className={styles.tip}>{t("order_check_failed")}</div>;
    }
    if (!order) {
      return <div className={styles.tip}>{t("tips_no_order_data")}</div>;
    }
    return (
      <div className={styles.infoCard}>
        {renderInfoRow(t("label_order_no"), <span className={styles.mono}>{order.orderId}</span>)}
        {renderInfoRow(t("label_order_status"), renderStatus(order.orderStatus))}
        {renderInfoRow(t("label_pay_item"), order.subject || t("tips_no_order_data"))}
        {renderInfoRow(
          t("label_amount"),
          <span className={styles.amount}>¥{order.totalPrice}</span>
        )}
        {renderInfoRow(
          t("label_pay_channel"),
          payChannelKeys[order.payChannel]
            ? t(payChannelKeys[order.payChannel])
            : t("tips_no_order_data")
        )}
        {renderInfoRow(
          t("label_order_create_time"),
          order.createdTime > 0
            ? TimeUtils.getFormattedTime(order.createdTime)
            : t("tips_no_order_data")
        )}
        <div className={styles.tip}>{t("order_detail_status_tip")}</div>
      </div>
    );
  };

  return (
    <div>
      <TexHeader></TexHeader>
      <div className={styles.orderDetailContainer}>
        <div className={styles.orderDetailCard}>
          <h2 className={styles.orderDetailTitle}>{t("title_order_detail")}</h2>
          {renderBody()}
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={!orderId || loading}
              onClick={loadOrderDetail}
            >
              {t("btn_refresh_status")}
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => {
                navigate("/user/panel?tab=order");
              }}
            >
              {t("btn_view_all_order")}
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                navigate("/");
              }}
            >
              {t("btn_home")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
