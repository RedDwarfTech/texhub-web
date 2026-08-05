export type payAction = createOrderAction | clearAlipayFormTextAction | setPayedOrderAction;

export enum PayActionType {
    CREATE_ORDER,
    CLEAR_ALIPAY_FORM_TEXT,
    SET_PAYED_ORDER_INFO
}

export interface createOrderAction {
  type: PayActionType.CREATE_ORDER;
  data: any;
}

export interface clearAlipayFormTextAction {
  type: PayActionType.CLEAR_ALIPAY_FORM_TEXT;
  data: any;
}

export interface setPayedOrderAction {
  type: PayActionType.SET_PAYED_ORDER_INFO;
  data: any;
}
