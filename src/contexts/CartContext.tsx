"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Product interface matching DB schema
interface Product {
    id: string;
    slug: string;
    title: string;
    price: number;
    weight: string;
    description: string;
    image_src: string;
    category: string;
    stock: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
    isSubscription: boolean; // true = subscription price, false = one-time (+18%)
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity: number, isSubscription: boolean) => void;
    removeFromCart: (index: number) => void;
    updateQuantity: (index: number, quantity: number) => void;
    updateSubscriptionType: (index: number, isSubscription: boolean) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('alfa-monte-cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('alfa-monte-cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (product: Product, quantity: number, isSubscription: boolean) => {
        setItems(prevItems => {
            // Check if product already exists in cart
            const existingIndex = prevItems.findIndex(
                item => item.product.id === product.id && item.isSubscription === isSubscription
            );

            if (existingIndex >= 0) {
                // Update quantity of existing item
                const newItems = [...prevItems];
                newItems[existingIndex].quantity += quantity;
                return newItems;
            } else {
                // Add new item
                return [...prevItems, { product, quantity, isSubscription }];
            }
        });
    };

    const removeFromCart = (index: number) => {
        setItems(prevItems => prevItems.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(index);
            return;
        }

        setItems(prevItems =>
            prevItems.map((item, i) =>
                i === index
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const updateSubscriptionType = (index: number, isSubscription: boolean) => {
        setItems(prevItems =>
            prevItems.map((item, i) =>
                i === index
                    ? { ...item, isSubscription }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getItemCount = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getSubtotal = () => {
        return items.reduce((total, item) => {
            const price = calculatePrice(item.product.price, item.isSubscription);
            return total + (price * item.quantity);
        }, 0);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateSubscriptionType,
                clearCart,
                getItemCount,
                getSubtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

// Pricing utility function
export const SUBSCRIPTION_MARKUP = 0.18; // 18% markup for one-time purchases

export function calculatePrice(basePrice: number, isSubscription: boolean): number {
    if (isSubscription) {
        return basePrice;
    }
    return Math.round(basePrice * (1 + SUBSCRIPTION_MARKUP));
}
