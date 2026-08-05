import { getIapProductsAction } from "@/action/iapproduct/IapProductAction";
import { XHRClient } from "rd-component";
import { AnyAction, Store } from "redux";

export function doGetIapProduct(store: Store<any, AnyAction>, lang?: string) {
  const config = {
    method: "get",
    url: "/infra/goods/list?lang=" + (lang || "zh-CN"),
    headers: { "Content-Type": "application/json" },
  };
  return XHRClient.requestWithAction(config, getIapProductsAction, store);
}
