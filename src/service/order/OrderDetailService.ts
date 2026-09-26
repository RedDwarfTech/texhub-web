import { XHRClient } from 'rd-component';

export const OrderDetailService:any = {
    /**
     * Read one order of the current user.
     *
     * `/infra/order/detail` answers with the full order row, unlike
     * `/infra/order/status` which only carries the status. An unknown order id
     * comes back as a failed envelope whose result is the default (empty) order,
     * so callers can tell "not found" from a transport failure by looking at
     * `result.orderId`.
     */
    getOrderDetail: (orderId: string) => {
        const config = {
            method: 'get',
            url: '/infra/order/detail?orderId=' + orderId
        };
        return XHRClient.requestWithoutAction(config);
    }
}

export default OrderDetailService;
