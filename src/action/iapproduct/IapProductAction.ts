export function getIapProductsAction(products: any) {
    return {
        type: "GET_IAP_PRODUCT",
        data: products
    };
}
