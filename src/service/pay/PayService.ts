import { PayActionType } from '@/action/pay/PayAction';
import { XHRClient } from 'rd-component';
import { IOrder } from '@/models/pay/IOrder';
import { AnyAction, Store } from 'redux';

export const PayService:any = {
    doPay:(params: any, store: Store<any, AnyAction>, provider?: string)=>{
        const payUrl = provider === 'wechat' ? '/infra/wechat/pay/createOrder' : '/infra/alipay/pay/createOrder';
        const config = {
            method: 'post',
            url: payUrl,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(params)
        };
        const actionTypeString: string = PayActionType[PayActionType.CREATE_ORDER];
        return XHRClient.requestWithActionType(config, actionTypeString, store);
    },
    setPayedInfo: (order: IOrder, store: Store<any, AnyAction>) => {
        const actionTypeString: string = PayActionType[PayActionType.SET_PAYED_ORDER_INFO];
        const action = {
            type: actionTypeString,
            data: order
        };
        store.dispatch(action);
    },
    doClearAlipayFormText: (store: Store<any, AnyAction>) => {
        const actionTypeString: string = PayActionType[PayActionType.CLEAR_ALIPAY_FORM_TEXT];
        const action = {
            type: actionTypeString,
            data: ''
        };
        store.dispatch(action);
    }
}

export default PayService;
