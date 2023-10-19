import { OrderService } from "rd-component";
import React from "react";
import { useSelector } from "react-redux";

const Order: React.FC = () => {

    const { orderList } = useSelector((state: any) => state.rdRootReducer.order);

    React.useEffect(()=>{
        OrderService.getUserOrderList();
    },[]);

    React.useEffect(()=>{
        if(orderList && orderList.length > 0) {
            console.log("order list:" + orderList);
        }
    },[orderList]);

    const renderOrders = () => {
        return (<div></div>);
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

export default Order;