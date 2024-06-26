import store from "@/redux/store/store";
import { OrderService, Order, orderStatus } from "rd-component";
import { TimeUtils, Pagination } from "rdjs-wheel";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const MyOrder: React.FC = () => {

    const { orderPage } = useSelector((state: any) => state.rdRootReducer.order);
    const [curOrders, setCurOrders] = useState<Order[]>();
    const [curPagination, setCurPagination] = useState<Pagination>();

    React.useEffect(() => {
        let params = {
            pageNum: 1,
            pageSize: 10
        };
        OrderService.getUserOrderPage(store, params);
    }, []);

    React.useEffect(() => {
        if (orderPage) {
            let orderList = orderPage.data;
            setCurOrders(orderList);
            setCurPagination(orderPage.pagination);
        }
    }, [orderPage]);

    const renderOrders = () => {
        if (!curOrders || curOrders.length === 0) {
            return <div></div>;
        }
        const orderList: JSX.Element[] = [];
        for (let i = 0; i <= curOrders.length - 1; i++) {
            let ord = curOrders[i];
            orderList.push(
                <tr>
                    <th scope="row">{ord.orderId}</th>
                    <td>{ord.subject}</td>
                    <td>{ord.totalPrice}</td>
                    <td>{TimeUtils.getFormattedTime(Number(ord.createdTime))}</td>
                    <td>{orderStatus[ord.orderStatus]}</td>
                </tr>
            );
        }
        return orderList;
    }

    const handlePageClick = (pageNum: number) => {
        let params = {
            pageNum: pageNum,
            pageSize: 10
        };
        OrderService.getUserOrderPage(store, params);
    }

    const renderPageNumbers = () => {
        if (!curPagination || curPagination.total === 0) {
            return (<li className="page-item">
                <a className="page-link" href="#" onClick={() => handlePageClick(1)}>1</a>
            </li>);
        }
        let pages = Math.ceil(curPagination.total/curPagination.pageSize);
        const orderList: JSX.Element[] = [];
        for (let i = 1; i <= pages - 1; i++) {
            orderList.push(
                <li className="page-item">
                    <a className="page-link" href="#" onClick={() => handlePageClick(i)}>{i}</a>
                </li>
            );
        }
        return orderList;
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
            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    <li className="page-item">
                        <a className="page-link" href="#" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    {renderPageNumbers()}
                    <li className="page-item">
                        <a className="page-link" href="#" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default MyOrder;