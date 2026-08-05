import { useSelector } from "react-redux";
import styles from "./Goods.module.css";
import { doGetIapProduct } from "@/service/goods/GoodsService";
import { useState } from "react";
import { IapProduct } from "@/models/product/IapProduct";
import { toast } from 'react-toastify';
import React from "react";
import { v4 as uuid } from 'uuid';
import PayService from "@/service/pay/PayService";
import { AnyAction, Store } from "redux";
import withConnect from "@/component/hoc/withConnect";
import Pay, { PayProvider } from "@/component/pay/Pay";
import { UserService, OrderService } from "rd-component";
import { IOrder } from "@/models/pay/IOrder";
import { useTranslation } from "react-i18next";
import { BaseMethods, RequestHandler, ResponseHandler } from "rdjs-wheel";

interface IGoodsProp {
  appId: string;
  store: Store<any, AnyAction>;
  refreshUrl?: string;
  reqUrl?: string;
  lang?: string;
}

const Goods: React.FC<IGoodsProp> = ({
  appId,
  store,
  refreshUrl = '',
  reqUrl,
  lang
}) => {
  const { t } = useTranslation();

  const { iapproducts } = useSelector((state: any) => state.iapproduct);
  const { createdOrder } = useSelector((state: any) => state.pay);
  const [payFrame, setPayFrame] = useState('');
  const [createdOrderInfo, setCreatedOrderInfo] = useState<IOrder>();
  const [products, setProducts] = useState<IapProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<IapProduct>();
  const [pendingProduct, setPendingProduct] = useState<IapProduct>();
  const [payProvider, setPayProvider] = useState<PayProvider>('alipay');
  const [multiPlatformPay, setMultiPlatformPay] = useState(false);

  React.useEffect(() => {
    let multiPlatformPayFlag = localStorage.getItem("multiPlatformPay");
    setMultiPlatformPay(!!multiPlatformPayFlag && Boolean(multiPlatformPayFlag) === true);
  }, []);

  React.useEffect(() => {
    getGoods();
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  React.useEffect(() => {
    if (iapproducts && iapproducts.length > 0) {
      setProducts(iapproducts);
    }
  }, [iapproducts]);

  React.useEffect(() => {
    if (createdOrder && Object.keys(createdOrder).length > 0) {
      setCreatedOrderInfo(createdOrder);
      setPayFrame(createdOrder.formText);
    }
    return () => {
      PayService.doClearAlipayFormText(store);
    }
  }, [createdOrder]);

  const handleOutsideClick = (e: any) => {
    const modal = document.getElementById('pay-popup');
    if (modal && !modal.contains(e.target)) {
      setPayFrame('');
      setPendingProduct(undefined);
    }
  };

  const getGoods = () => {
    doGetIapProduct(store, lang);
  }

  const handlePay = (row: any) => {
    setCurrentProduct(row);
    if (multiPlatformPay) {
      setPayFrame('');
      setPendingProduct(row);
    } else {
      setPayProvider('alipay');
      PayService.doPay({
        productId: Number(row.id)
      }, store);
    }
  };

  const handleSelectProvider = (provider: PayProvider) => {
    if (!pendingProduct) {
      return;
    }
    setPayProvider(provider);
    PayService.doPay({
      productId: Number(pendingProduct.id)
    }, store, provider);
  };

  const productSubMenu = (serverDataSource: IapProduct[]) => {
    if (BaseMethods.isNull(serverDataSource)) {
      return (<div></div>);
    }
    const productSubList: React.JSX.Element[] = [];
    serverDataSource.sort((a: IapProduct, b: IapProduct) => b.sort - a.sort)
      .forEach((item: IapProduct) => {
        productSubList.push(
          <div key={uuid()} className={styles.package}>
            <h2>{item.productTitle}</h2>
            <p className={styles.price}>{item.price}<span>¥</span></p>
            <ul>
              {vipItems(item.description)}
            </ul>
            <button onClick={() => handlePay(item)}>{t("subscribe_now")}</button>
          </div>);
      });
    return productSubList;
  }

  const vipItems = (items: string) => {
    const parsedItmes = JSON.parse(items);
    if (parsedItmes) {
      const itemList: React.JSX.Element[] = [];
      parsedItmes.forEach((item: string) => {
        itemList.push(<li key={uuid()}>{item}</li>);
      });
      return itemList;
    }
  }

  const payComplete = () => {
    if (!createdOrderInfo || !createdOrderInfo.orderId) {
      toast.error(t("order_not_found"));
      return;
    }
    const orderId = createdOrderInfo.orderId;
    OrderService.getOrderStatus(orderId, store).then((resp: any) => {
      if (ResponseHandler.responseSuccess(resp)) {
        if (Number(resp.result.orderStatus) === 1) {
          setPayFrame('');
          setCreatedOrderInfo(undefined);
          setPendingProduct(undefined);
          if (!refreshUrl || refreshUrl.length === 0) {
            return;
          }
          UserService.loadCurrUser(true, refreshUrl);
          RequestHandler.handleWebAccessTokenExpire();
        } else {
          toast.warning(t("order_unpaid_warning"));
        }
      } else {
        toast.warning(t("order_check_failed"));
      }
    });
  }

  return (
    <div>
      <div className={styles.container}>
        {productSubMenu(products)}
      </div>
      <div className={styles.goodsDivider}></div>
      <Pay
        payFormText={payFrame}
        price={currentProduct?.price!}
        payProvider={payProvider === 'wechat' ? t("wechat") : t("alipay")}
        onPayComplete={payComplete}
        showPlatformSelect={multiPlatformPay && !!pendingProduct}
        onSelectProvider={handleSelectProvider}
      ></Pay>
    </div>
  );
}

export default withConnect(Goods);
