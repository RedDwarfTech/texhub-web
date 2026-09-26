import { PayActionType } from '@/action/pay/PayAction';
import { XHRClient } from 'rd-component';
import { RequestHandler } from 'rdjs-wheel';
import { IOrder } from '@/models/pay/IOrder';
import { AnyAction, Store } from 'redux';

export const PayService:any = {
    doPay:(params: any, store: Store<any, AnyAction>)=>{
        const payUrl = '/infra/alipay/pay/createOrder';
        const config = {
            method: 'post',
            url: payUrl,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(params)
        };
        const actionTypeString: string = PayActionType[PayActionType.CREATE_ORDER];
        return XHRClient.requestWithActionType(config, actionTypeString, store);
    },
    /**
     * Re-sign the access token so a freshly bought plan takes effect at once.
     *
     * The subscription expiry is carried in the token as the `et` claim and
     * texhub-server checks the VIP quota straight from it, so a token minted
     * before the payment still reports a non-VIP user. Signing in again used to
     * be the only way out, because signing in is what re-signs the token.
     */
    refreshAuthToken: () => {
        return RequestHandler.handleWebAccessTokenExpire().catch(() => {
            // A rejected refresh token already redirects to the login page
            // inside handleWebAccessTokenExpire, so swallow the rejection here
            // to keep it from surfacing as an unhandled promise rejection.
        });
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
