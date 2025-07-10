import store from "@/redux/store/store";
import { OrderService, Order, orderStatus } from "rd-component";
import { TimeUtils, Pagination } from "rdjs-wheel";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./MyOrder.module.css";

const MyOrder: React.FC = () => {
    const { orderPage } = useSelector((state: any) => state.rdRootReducer.order);
    const [curOrders, setCurOrders] = useState<Order[]>();
    const [curPagination, setCurPagination] = useState<Pagination>();
    const [currentPage, setCurrentPage] = useState<number>(1);

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
            return (
                <tr>
                    <td colSpan={5} className={styles.noData}>暂无订单数据</td>
                </tr>
            );
        }
        const orderList: JSX.Element[] = [];
        for (let i = 0; i <= curOrders.length - 1; i++) {
            let ord = curOrders[i];
            orderList.push(
                <tr key={ord.orderId} className={styles.orderRow}>
                    <th scope="row" className={styles.orderId}>{ord.orderId}</th>
                    <td className={styles.subject}>{ord.subject}</td>
                    <td className={styles.price}>¥{ord.totalPrice}</td>
                    <td className={styles.time}>{TimeUtils.getFormattedTime(Number(ord.createdTime))}</td>
                    <td className={styles.status}>
                        <span className={`${styles.statusBadge} ${styles[`status${ord.orderStatus}`]}`}>
                            {orderStatus[ord.orderStatus]}
                        </span>
                    </td>
                </tr>
            );
        }
        return orderList;
    }

    const handlePageClick = (pageNum: number) => {
        setCurrentPage(pageNum);
        let params = {
            pageNum: pageNum,
            pageSize: 10
        };
        OrderService.getUserOrderPage(store, params);
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            handlePageClick(currentPage - 1);
        }
    }

    const handleNextPage = () => {
        if (curPagination && currentPage < Math.ceil(curPagination.total/curPagination.pageSize)) {
            handlePageClick(currentPage + 1);
        }
    }

    const renderPageNumbers = () => {
        if (!curPagination || curPagination.total === 0) {
            return (
                <li className={`page-item ${styles.pageItem} ${styles.active}`}>
                    <a className={`page-link ${styles.pageLink}`} href="#" onClick={(e) => {e.preventDefault(); handlePageClick(1);}}>1</a>
                </li>
            );
        }
        
        let pages = Math.ceil(curPagination.total/curPagination.pageSize);
        const pageItems: JSX.Element[] = [];
        
        // 显示当前页附近的页码
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pages, startPage + maxVisiblePages - 1);
        
        // 调整起始页，确保显示足够的页码
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // 添加第一页和省略号
        if (startPage > 1) {
            pageItems.push(
                <li key="first" className={`page-item ${styles.pageItem}`}>
                    <a className={`page-link ${styles.pageLink}`} href="#" onClick={(e) => {e.preventDefault(); handlePageClick(1);}}>1</a>
                </li>
            );
            if (startPage > 2) {
                pageItems.push(
                    <li key="ellipsis1" className={`page-item ${styles.pageItem} ${styles.ellipsis}`}>
                        <span className="page-link">...</span>
                    </li>
                );
            }
        }
        
        // 添加中间页码
        for (let i = startPage; i <= endPage; i++) {
            pageItems.push(
                <li key={i} className={`page-item ${styles.pageItem} ${i === currentPage ? styles.active : ''}`}>
                    <a className={`page-link ${styles.pageLink}`} href="#" onClick={(e) => {e.preventDefault(); handlePageClick(i);}}>{i}</a>
                </li>
            );
        }
        
        // 添加最后一页和省略号
        if (endPage < pages) {
            if (endPage < pages - 1) {
                pageItems.push(
                    <li key="ellipsis2" className={`page-item ${styles.pageItem} ${styles.ellipsis}`}>
                        <span className="page-link">...</span>
                    </li>
                );
            }
            pageItems.push(
                <li key="last" className={`page-item ${styles.pageItem}`}>
                    <a className={`page-link ${styles.pageLink}`} href="#" onClick={(e) => {e.preventDefault(); handlePageClick(pages);}}>{pages}</a>
                </li>
            );
        }
        
        return pageItems;
    }

    return (
        <div className={styles.orderContainer}>
            <h2 className={styles.orderTitle}>我的订单</h2>
            <div className={styles.tableWrapper}>
                <table className={`table ${styles.orderTable}`}>
                    <thead className={styles.tableHeader}>
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
            
            {curPagination && curPagination.total > 0 && (
                <nav aria-label="订单分页" className={styles.pagination}>
                    <ul className={`pagination ${styles.paginationList}`}>
                        <li className={`page-item ${styles.pageItem} ${currentPage === 1 ? styles.disabled : ''}`}>
                            <a 
                                className={`page-link ${styles.pageLink}`} 
                                href="#" 
                                aria-label="上一页"
                                onClick={(e) => {e.preventDefault(); handlePrevPage();}}
                            >
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        {renderPageNumbers()}
                        <li className={`page-item ${styles.pageItem} ${!curPagination || currentPage >= Math.ceil(curPagination.total/curPagination.pageSize) ? styles.disabled : ''}`}>
                            <a 
                                className={`page-link ${styles.pageLink}`} 
                                href="#" 
                                aria-label="下一页"
                                onClick={(e) => {e.preventDefault(); handleNextPage();}}
                            >
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

export default MyOrder;