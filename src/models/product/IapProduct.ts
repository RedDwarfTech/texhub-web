export interface IapProduct {
    id: number;
    productId: string;
    productType: number;
    onlineStatus: number;
    createdTime: number;
    updatedTime: number;
    productTitle: string;
    description: string;
    price: string;
    rawPrice: string;
    currencyCode?: string;
    appId: string;
    sort: number;
    deleted?:number;
    amount?: number;
    period?: number;
}
