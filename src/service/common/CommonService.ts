import store from "@/redux/store/store.js";
import { XHRClient } from "rd-component";

export function dispathAction(actionTypeString: string, data: any) {
  return XHRClient.dispathAction(data, actionTypeString, store);
}