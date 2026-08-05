import React from "react";
import "./Pay.css";
import { useTranslation } from "react-i18next";

export type PayProvider = "alipay" | "wechat";

export type PayProps = {
  payFormText: string;
  price: string;
  payProvider: string;
  onPayComplete: () => void;
  showPlatformSelect?: boolean;
  onSelectProvider?: (provider: PayProvider) => void;
};

const Pay: React.FC<PayProps> = (props) => {
  const { t } = useTranslation();

  const formText = props.payFormText;
  const priceText = props.price;
  const payProvider = props.payProvider;

  const displayStyle = (style: string) => {
    const payMask = document.getElementById("pay-mask");
    if (payMask) {
      payMask.style.display = style;
    }
    const payPop = document.getElementById("pay-popup");
    if (payPop) {
      payPop.style.display = style;
    }
  }

  const platformSelectMode = props.showPlatformSelect && !(formText && formText.length > 0);

  if (platformSelectMode || (formText && formText.length > 0)) {
    displayStyle('block');
  } else {
    displayStyle('none');
  }

  return (
    <div>
      <div id="pay-mask" className="pay-mask"></div>
      <div id="pay-popup" className="pay-pop">
        <div className="pay-container" id="main">
          <div className="pay-money">{t("pay_amount")}&nbsp;&nbsp;<span id="pay_price">{priceText}¥</span></div>
          {platformSelectMode ? (
            <div className="pay-provider-select">
              <button className="pay-provider-btn" onClick={() => props.onSelectProvider && props.onSelectProvider('alipay')}>{t("alipay")}</button>
              <button className="pay-provider-btn" onClick={() => props.onSelectProvider && props.onSelectProvider('wechat')}>{t("wechat")}</button>
            </div>
          ) : (
            <div>
              <div>
                <div className="pay-img">
                  <iframe srcDoc={formText}
                    width="200"
                    height="205"
                  >
                  </iframe>
                </div>
              </div>
              <p className="pay-paragraph">
                <img className="pay-scan"
                  src="/addons/zzzy_idcard_pc/core/web/statics/images/site/icon-wechat.png"
                  alt="" />{t("scan_to_pay", { provider: payProvider })}
              </p>
              <div className="pay-complete-action">
                <button className="pay-complete-btn" onClick={props.onPayComplete}>{t("pay_complete")}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pay;
