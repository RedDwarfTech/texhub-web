const initState = {
    createdOrder: {},
    order: {}
};

const PayReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "CREATE_ORDER":
            return {
                ...state,
                createdOrder: action.data
            };
        case "CLEAR_ALIPAY_FORM_TEXT":
            return {
                ...state,
                createdOrder: ""
            };
        case "SET_PAYED_ORDER_INFO":
            return {
                ...state,
                order: action.data
            };
        default:
            break;
    }
    return state;
};

export default PayReducer;
