import { useSelector } from "react-redux";
import styles from "./Goods.module.css";
import { doGetIapProduct } from "@/service/goods/GoodsService";
import { useState } from "react";
import { IapProduct } from "@/models/product/IapProduct";
import React from "react";
import { v4 as uuid } from 'uuid';
import { AnyAction, Store } from "redux";
import withConnect from "@/component/hoc/withConnect";
import Checkout from "@/component/checkout/Checkout";
import { useTranslation } from "react-i18next";
import { BaseMethods } from "rdjs-wheel";

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
  const [products, setProducts] = useState<IapProduct[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<IapProduct>();

  React.useEffect(() => {
    getGoods();
  }, []);

  React.useEffect(() => {
    if (iapproducts && iapproducts.length > 0) {
      setProducts(iapproducts);
    }
  }, [iapproducts]);

  const getGoods = () => {
    doGetIapProduct(store, lang);
  }

  const handlePay = (row: any) => {
    setCheckoutProduct(row);
    setCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
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

  return (
    <div>
      <div className={styles.container}>
        {productSubMenu(products)}
      </div>
      <div className={styles.goodsDivider}></div>
      <Checkout
        open={checkoutOpen}
        product={checkoutProduct || null}
        store={store}
        refreshUrl={refreshUrl}
        onClose={handleCloseCheckout}
      ></Checkout>
    </div>
  );
}

export default withConnect(Goods);
