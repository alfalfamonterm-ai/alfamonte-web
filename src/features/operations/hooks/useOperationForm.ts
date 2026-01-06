import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { CreateOperationDTO, OperationCategory, OperationItem } from '../types';
import { createOperations } from '@/lib/database/operations.db';
import { getInventoryItems, createInventoryMovement } from '@/lib/database/inventory.db';
import { getInputs, useInput, InputItem } from '@/lib/database/inputs.db';
import { InventoryItem } from '@/features/inventory/types';
import { useRouter } from 'next/navigation';

export const useOperationForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // --- DATA STATE ---
    const [config, setConfig] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [existingCustomers, setExistingCustomers] = useState<string[]>([]);
    const [panoStats, setPanoStats] = useState({ produced: 0, sold: 0 });
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string>('');
    const [allInputs, setAllInputs] = useState<InputItem[]>([]);
    const [selectedInputId, setSelectedInputId] = useState<string>('');
    const [inputQuantity, setInputQuantity] = useState<number>(0);

    // --- FORM STATE ---
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [panoId, setPanoId] = useState<string[]>(['1']);
    const [corteId, setCorteId] = useState('1');
    const [category, setCategory] = useState<OperationCategory>('Rendimiento');
    const [subcategory, setSubcategory] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [unitCost, setUnitCost] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [performer, setPerformer] = useState('');
    const [clientName, setClientName] = useState('');
    const [customerId, setCustomerId] = useState<string>(''); // NEW: Selected customer UUID
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [paymentDueDate, setPaymentDueDate] = useState<string>('');

    // --- INITIAL DATA FETCH ---
    useEffect(() => {
        const fetchConfig = async () => {
            const { data: settings } = await supabase.from('settings').select('value').eq('key', 'global_config').single();
            if (settings) setConfig(settings.value);
        };

        const fetchProducts = async () => {
            const { data: prods } = await supabase.from('products').select('*').order('title');
            if (prods) setProducts(prods);
        };

        const fetchCustomers = async () => {
            const { data: customers } = await supabase.from('customers').select('id, name').order('name');
            if (customers) {
                // Keep the names for simple dropdowns if needed, but we mostly use CustomerSelector now
                setExistingCustomers(customers.map(c => c.name));
            }
        };

        const fetchInventory = async () => {
            try {
                const items = await getInventoryItems();
                setInventoryItems(items.filter(i => i.status === 'active'));
            } catch (error) {
                console.error("Error loading inventory", error);
            }
        };

        const fetchInputs = async () => {
            try {
                const data = await getInputs();
                setAllInputs(data);
            } catch (error) {
                console.error("Error loading inputs", error);
            }
        };

        fetchConfig();
        fetchProducts();
        fetchCustomers();
        fetchInventory();
        fetchInputs();
    }, []);

    // --- EFFECT: SYNC DATES ---
    useEffect(() => {
        setEndDate(startDate);
    }, [startDate]);

    // --- EFFECT: RESET FORM ON CATEGORY CHANGE ---
    useEffect(() => {
        setSubcategory('');
        setQuantity(0);
        setUnitCost(0);
        setTotalCost(0);
        setPerformer('');
        setDescription('');
        setSelectedProductId('');
        setClientName('');
        setCustomerId(''); // Reset customer ID
        setSelectedInventoryItemId(''); // Reset inventory item selection
        setSelectedInputId(''); // Reset input selection
        setInputQuantity(0);
        setAmountPaid(0);
        setPaymentDueDate('');
    }, [category]);

    // --- EFFECT: FETCH STOCK STATS (Optimized) ---
    useEffect(() => {
        const fetchStats = async () => {
            const selectedPano = panoId[0] || '1';
            // Limit to 1000 rows
            const { data } = await supabase
                .from('operations')
                .select('category, subcategory, quantity, pano_id')
                .order('date', { ascending: false })
                .limit(1000);

            if (data) {
                // Produced
                const produced = data
                    .filter(o => o.category === 'Rendimiento' && o.subcategory === 'Fardos Cosechados' && String(o.pano_id).includes(selectedPano))
                    .reduce((acc, curr) => acc + Number(curr.quantity), 0);

                // Sold
                const sold = data
                    .filter(o => o.category === 'Venta' && String(o.pano_id).includes(selectedPano))
                    .reduce((acc, curr) => acc + Number(curr.quantity), 0);

                setPanoStats({ produced, sold });
            }
        };
        fetchStats();
    }, [panoId]);

    // --- EFFECT: AUTO-FILL UNIT COST ---
    useEffect(() => {
        // Web Product: Only auto-fill if unitCost is 0 or if product changed
        if (category === 'Venta' && subcategory === 'Producto Web' && selectedProductId && products.length > 0) {
            const prod = products.find(p => p.id === selectedProductId);
            if (prod) {
                setUnitCost(prod.price || 0);
                setDescription(`Venta: ${prod.title}`);
            }
        }
        // Fardos: Only auto-fill if unitCost is 0
        else if (category === 'Venta' && subcategory === 'Fardos') {
            const price = config?.standard_bale_price || 0;
            if (unitCost === 0 && price > 0) {
                setUnitCost(price);
            }
        }
    }, [category, subcategory, selectedProductId, products, config]);

    // --- EFFECT: CALC TOTAL COST (Sales / Expenses) ---
    useEffect(() => {
        if (category === 'Venta' || (category === 'Costo Operacional' && subcategory === 'Combustible') || category === 'Retiro de Utilidad') {
            setTotalCost(quantity * unitCost);
            // Auto-fill amountPaid if it was 0 or strictly equal to totalCost
            if (category === 'Venta' && (amountPaid === 0)) {
                // We don't force it to totalCost here because user might be typing amountPaid
            }
        }
    }, [category, subcategory, quantity, unitCost]);

    // Sync amountPaid with totalCost for non-Venta categories (they are always "paid" from business perspective)
    useEffect(() => {
        if (category !== 'Venta') {
            setAmountPaid(totalCost);
        }
    }, [category, totalCost]);

    // --- EFFECT: CALC COSTS 2 (Irrigation / Tractor) ---
    useEffect(() => {
        // Irrigation
        if (category === 'Rendimiento' && subcategory === 'Días de Riego') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            if (quantity !== diffDays) setQuantity(diffDays);

            let calcCost = 0;
            if (performer === 'Don Enrique') calcCost = diffDays * (config?.irrigation_cost_per_day || 25000);
            else if (performer !== 'Max B.' && unitCost > 0) calcCost = diffDays * unitCost;

            if (totalCost !== calcCost) setTotalCost(calcCost);
        }
        // Tractor
        else if (category === 'Costo Operacional' && subcategory === 'Tractorista' && config?.tractor_cost_per_bale) {
            const cost = config.tractor_cost_per_bale;
            if (unitCost !== cost) setUnitCost(cost);
            setTotalCost(quantity * cost);
        }
    }, [category, subcategory, startDate, endDate, performer, unitCost, config]);

    // --- HANDLER: SUBMIT ---
    const submitOperation = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payloads: CreateOperationDTO[] = [];
            // 2. Base Payload Construction
            let finalDescription = description;
            const basePayload: CreateOperationDTO = {
                date: startDate,
                category,
                subcategory,
                description: finalDescription,
                quantity: Number(quantity),
                unit_cost: Number(unitCost),
                total_cost: Number(totalCost),
                pano_id: subcategory === 'Producto Web' ? '0' : panoId.join(','),
                corte_id: corteId, // Use fixed corteId
                performer: category === 'Venta' ? clientName : performer,
                amount_paid: Number(amountPaid),
                payment_due_date: paymentDueDate || null,
                payment_status: category === 'Venta'
                    ? (Number(amountPaid) >= Number(totalCost) ? 'paid' : (Number(amountPaid) > 0 ? 'partial' : 'pending'))
                    : 'paid',
                items: subcategory === 'Producto Web' && selectedProductId ? {
                    product_id: selectedProductId,
                    product_title: products.find(p => p.id === selectedProductId)?.title,
                    is_web_sale: true
                } : undefined // Default to undefined if not a web product
            };

            // 1. CRM: Create Client if needed (if no customerId but name provided)
            if (category === 'Venta' && clientName.trim() && !customerId) {
                const name = clientName.trim();
                finalDescription = description || `Venta a ${name}`;

                // Extract info from tags in description if present
                const phone = description.match(/\[PHONE:(.*?)\]/)?.[1];
                const email = description.match(/\[EMAIL:(.*?)\]/)?.[1];
                const address = description.match(/\[ADDRESS:(.*?)\]/)?.[1];
                const comuna = description.match(/\[COMUNA:(.*?)\]/)?.[1];
                const region = description.match(/\[REGION:(.*?)\]/)?.[1];

                const { data: newCust, error: custError } = await supabase
                    .from('customers')
                    .insert({
                        name,
                        status: 'active',
                        phone: phone || null,
                        email: email || null,
                        address: address || null,
                        comuna: comuna || null,
                        region: region || null,
                        data_complete: !!(phone && (email || address)) // Basic completeness check
                    })
                    .select()
                    .single();

                if (custError) {
                    console.error("Error creating customer:", custError);
                } else if (newCust) {
                    basePayload.customer_id = newCust.id;
                }
            } else if (customerId) {
                basePayload.customer_id = customerId;

                // If DATOS_CLIENTE is present, update the existing customer record with any provided info
                if (description.includes('[DATOS_CLIENTE]')) {
                    const phone = description.match(/\[PHONE:(.*?)\]/)?.[1];
                    const email = description.match(/\[EMAIL:(.*?)\]/)?.[1];
                    const address = description.match(/\[ADDRESS:(.*?)\]/)?.[1];
                    const comuna = description.match(/\[COMUNA:(.*?)\]/)?.[1];
                    const region = description.match(/\[REGION:(.*?)\]/)?.[1];

                    const updates: any = {};
                    if (phone) updates.phone = phone;
                    if (email) updates.email = email;
                    if (address) updates.address = address;
                    if (comuna) updates.comuna = comuna;
                    if (region) updates.region = region;

                    if (Object.keys(updates).length > 0) {
                        // Check if it's complete now
                        // We'd ideally fetch first, but let's assume if they provided these new ones it helps.
                        // For simplicity, we just update what they provided.
                        await supabase.from('customers').update(updates).eq('id', customerId);
                    }
                }

                const cleanDesc = description.replace(' [DATOS_CLIENTE]', '').replace('[DATOS_CLIENTE]', '').trim();
                finalDescription = cleanDesc ? `${cleanDesc} - ${clientName}` : `Venta a ${clientName}`;
                if (description.includes('[DATOS_CLIENTE]')) finalDescription += ' [DATOS_CLIENTE]';
            }

            basePayload.description = finalDescription;

            // 3. Web Product Stock Update
            if (subcategory === 'Producto Web' && selectedProductId) {
                const currentStock = products.find(p => p.id === selectedProductId)?.stock || 0;
                await supabase.from('products').update({ stock: currentStock - Number(quantity) }).eq('id', selectedProductId);
            }

            // 4. Payload Logic Branching

            // CASE A: Multi-Paño Expense (Split Cost)
            if (category === 'Costo Operacional' && panoId.length > 1) {
                const costPerPano = totalCost / panoId.length;
                panoId.forEach(singlePanoId => {
                    payloads.push({
                        ...basePayload,
                        pano_id: singlePanoId,
                        description: `${finalDescription || subcategory} [${panoId.length} paños]`,
                        total_cost: costPerPano,
                    });
                });
            }
            // CASE B: Single Record (Standard)
            else {
                // Special Sub-logic for Rendimiento -> Uso de Materiales
                if (category === 'Rendimiento' && subcategory === 'Uso de Materiales') {
                    if (!selectedInventoryItemId) {
                        alert('Debes seleccionar un material del inventario.');
                        setLoading(false);
                        return;
                    }

                    // 1. Create Usage Movement (Deduct Stock)
                    const selectedItem = inventoryItems.find(i => i.id === selectedInventoryItemId);
                    if (!selectedItem) {
                        alert('Material de inventario no encontrado.');
                        setLoading(false);
                        return;
                    }

                    await createInventoryMovement({
                        item_id: selectedInventoryItemId,
                        movement_type: 'usage',
                        quantity: quantity,
                        pano_id: panoId.join(','), // Assuming panoId can be joined for movement
                        operation_id: undefined, // Will be linked? Ideally yes but complex in one go. logic simplified.
                        performed_by: performer,
                        reason: description || `Uso de ${selectedItem.name} en Faena`
                    });

                    // 2. Register Operation (Record only, 0 financial cost as it's usage of existing asset)
                    // Optionally, we could track the internal cost here (quantity * unit_cost from inventory)
                    // For ledger balance, we record 0 financial cost as it was paid when purchased.
                    payloads.push({
                        ...basePayload,
                        description: `Uso de material: ${selectedItem.name} - ${description}`,
                        unit_cost: 0, // Financial cost is 0 because it was paid when purchased
                        total_cost: 0,  // Storing internal cost implies expense, so keep at 0 for ledger balance.
                        items: {
                            inventory_item_id: selectedInventoryItemId,
                            inventory_item_name: selectedItem.name,
                            internal_cost_per_unit: selectedItem.unit_cost,
                            internal_total_cost: quantity * selectedItem.unit_cost,
                            is_inventory_usage: true
                        }
                    });
                } else if (category === 'Rendimiento' && subcategory === 'Fardos Cosechados') {

                    // Record 1: Production (Zero Cost)
                    payloads.push({ ...basePayload, total_cost: 0 });
                    // Record 2: Auto Tractor Cost (Expense)
                    payloads.push({
                        ...basePayload,
                        category: 'Costo Operacional',
                        subcategory: 'Mano de Obra (Tractor)',
                        quantity: 0,
                        total_cost: quantity * (config?.tractor_cost_per_bale || 0),
                        description: 'Costo Auto Tractorista'
                    });
                }
                // Special Sub-logic for Rendimiento -> Riego
                else if (category === 'Rendimiento' && subcategory === 'Días de Riego') {
                    // Record 1: Activity Log (Zero Cost)
                    payloads.push({ ...basePayload, total_cost: 0 });
                    // Record 2: Expense Log (if cost exists)
                    if (totalCost > 0) {
                        payloads.push({
                            ...basePayload,
                            category: 'Costo Operacional',
                            subcategory: 'Mano de Obra (Riego)',
                            total_cost: totalCost,
                            description: `Pago Riego: ${performer}`
                        });
                    }
                }
                // Standard Logic for everything else
                else {
                    payloads.push(basePayload);

                    // FUEL LOGIC: If 'Combustible', add to Inventory Stock
                    if (category === 'Costo Operacional' && subcategory === 'Combustible') {
                        const fuelType = description.includes('Petróleo') ? 'Petróleo' : description.includes('Nafta') ? 'Nafta' : null;

                        if (fuelType) {
                            // Find matching inventory item (Case insensitive fuzzy match)
                            const fuelItem = inventoryItems.find(i =>
                                i.name.toLowerCase().includes(fuelType.toLowerCase()) ||
                                (fuelType === 'Petróleo' && i.name.toLowerCase().includes('diesel'))
                            );

                            if (fuelItem) {
                                // Add Stock (Purchase/Restock)
                                await createInventoryMovement({
                                    item_id: fuelItem.id,
                                    movement_type: 'purchase', // Adding stock
                                    quantity: quantity,
                                    pano_id: '0', // General stock, or linked to pano if specific? Usually fuel is general.
                                    performed_by: performer || 'Admin',
                                    reason: `Compra Combustible: ${description}`
                                });
                            } else {
                                console.warn(`⚠️ Warning: No inventory item found for fuel type '${fuelType}'. Stock not updated.`);
                            }
                        }
                    }
                }
            }

            // 5. Execute Insert
            const insertedOperations = await createOperations(payloads);

            // 6. Handle Consumable Input Usage (if selected)
            if (selectedInputId && inputQuantity > 0 && insertedOperations?.[0]) {
                await useInput({
                    input_id: selectedInputId,
                    operation_id: insertedOperations[0].id,
                    quantity_used: inputQuantity,
                    date: startDate,
                    performed_by: performer || clientName,
                    notes: `Consumo vinculado a la operación: ${finalDescription}`
                });
            }

            alert('Registro Guardado Exitosamente.');
            router.push('/admin/operations');
            router.refresh();

        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        loading,
        config,
        products,
        existingCustomers,
        panoStats,
        startDate, setStartDate,
        endDate, setEndDate,
        panoId, setPanoId,
        corteId, setCorteId,
        category, setCategory,
        subcategory, setSubcategory,
        description, setDescription,
        quantity, setQuantity,
        unitCost, setUnitCost,
        totalCost, setTotalCost,
        performer, setPerformer,
        clientName, setClientName,
        customerId, setCustomerId,
        selectedProductId, setSelectedProductId,
        inventoryItems, selectedInventoryItemId, setSelectedInventoryItemId,
        allInputs, selectedInputId, setSelectedInputId,
        inputQuantity, setInputQuantity,
        amountPaid, setAmountPaid,
        paymentDueDate, setPaymentDueDate,

        // Actions
        submitOperation
    };
};
