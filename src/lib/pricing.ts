export const SUBSCRIPTION_MARKUP = 0.18; // 18% markup for one-time purchases

export function calculatePrice(basePrice: number, isSubscription: boolean): number {
    if (isSubscription) {
        return basePrice;
    }
    return Math.round(basePrice * (1 + SUBSCRIPTION_MARKUP));
}

export function calculateTotal(items: any[]): number {
    return items.reduce((total, item) => {
        const price = calculatePrice(item.product.price, item.isSubscription);
        return total + (price * item.quantity);
    }, 0);
}
