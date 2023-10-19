import { OrderService, Order } from "rd-component";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const MyOrder: React.FC = () => {

    const { orderList } = useSelector((state: any) => state.rdRootReducer.order);
    const [curOrders, setCurOrders] = useState<Order[]>();

    React.useEffect(() => {
        OrderService.getUserOrderList();
    }, []);

    React.useEffect(() => {
        if (orderList && orderList.length > 0) {
            setCurOrders(orderList);
        }
    }, [orderList]);

    const renderOrders = () => {
        if (!curOrders || curOrders.length === 0) {
            return <div></div>;
        }
        const tagList: JSX.Element[] = [];
        for (let i = 1; i <= curOrders.length; i++) {
            let ord = curOrders[i];
            tagList.push(
                <tr>
                    <th scope="row">{ord.orderId}</th>
                    <td>{ord.subject}</td>
                    <td>{ord.totalPrice}</td>
                    <td>{ord.createTime}</td>
                    <td>{ord.orderStatus}</td>
                </tr>
            );
        }
        return tagList;
    }

    return (
        <div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">订单编号</th>
                        <th scope="col">支付项目</th>
                        <th scope="col">金额</th>
                        <th scope="col">支付时间</th>
                        <th scope="col">订单状态</th>
                    </tr>
                </thead>
                <tbody>
                    {renderOrders()}
                </tbody>
            </table>
        </div>
    );
}

export default MyOrder;