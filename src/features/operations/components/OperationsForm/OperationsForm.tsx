import React from 'react';
import { useOperationForm } from '../../hooks/useOperationForm';
import { ContextSelector } from './ContextSelector';
import { CategorySelector } from './CategorySelector';
import { DynamicFields } from './DynamicFields';

export const OperationsForm = () => {
    const form = useOperationForm();

    return (
        <form onSubmit={form.submitOperation} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">

            {/* 1. SELECTION: CONTEXT */}
            <ContextSelector
                startDate={form.startDate} setStartDate={form.setStartDate}
                endDate={form.endDate} setEndDate={form.setEndDate}
                panoId={form.panoId} setPanoId={form.setPanoId}
                corteId={form.corteId} setCorteId={form.setCorteId}
                category={form.category}
            />

            {/* 2. SELECTION: CATEGORY */}
            <CategorySelector
                category={form.category}
                setCategory={form.setCategory}
            />

            {/* 3. DYNAMIC FORM AREA */}
            <DynamicFields
                category={form.category}
                subcategory={form.subcategory} setSubcategory={form.setSubcategory}
                quantity={form.quantity} setQuantity={form.setQuantity}
                unitCost={form.unitCost} setUnitCost={form.setUnitCost}
                totalCost={form.totalCost} setTotalCost={form.setTotalCost}
                description={form.description} setDescription={form.setDescription}
                performer={form.performer} setPerformer={form.setPerformer}
                clientName={form.clientName} setClientName={form.setClientName}
                customerId={form.customerId} setCustomerId={form.setCustomerId}
                selectedProductId={form.selectedProductId} setSelectedProductId={form.setSelectedProductId}
                products={form.products}
                existingCustomers={form.existingCustomers}
                panoStats={form.panoStats}
                panoId={form.panoId}
                inventoryItems={form.inventoryItems}
                selectedInventoryItemId={form.selectedInventoryItemId}
                setSelectedInventoryItemId={form.setSelectedInventoryItemId}
                allInputs={form.allInputs}
                selectedInputId={form.selectedInputId}
                setSelectedInputId={form.setSelectedInputId}
                inputQuantity={form.inputQuantity}
                setInputQuantity={form.setInputQuantity}
                amountPaid={form.amountPaid}
                setAmountPaid={form.setAmountPaid}
                paymentDueDate={form.paymentDueDate}
                setPaymentDueDate={form.setPaymentDueDate}
            />

            {/* 4. SUMMARY & SUBMIT */}
            <div className="mt-6 pt-6 border-t flex justify-between items-center text-sm text-gray-500">
                <div>
                    Resumen: <b>{form.category}</b> {form.subcategory && `- ${form.subcategory}`} <br />
                    {form.startDate === form.endDate ? `Fecha: ${form.startDate}` : `Del ${form.startDate} al ${form.endDate}`}
                </div>
                <div className="text-right">
                    {form.category === 'Costo Operacional' && <span className="text-red-600 font-bold block text-lg">-${form.totalCost.toLocaleString()}</span>}
                    {form.category === 'Retiro de Utilidad' && <span className="text-indigo-600 font-bold block text-lg">-${form.totalCost.toLocaleString()} (Retiro)</span>}
                    {form.category === 'Venta' && <span className="text-blue-600 font-bold block text-lg">+${form.totalCost.toLocaleString()}</span>}
                    {form.category === 'Rendimiento' && form.totalCost > 0 && <span className="text-orange-600 font-bold block text-lg">-${form.totalCost.toLocaleString()} (Costo)</span>}
                </div>
            </div>

            <button type="submit" disabled={form.loading} className="w-full py-4 bg-[#2D4A3E] text-white font-bold text-lg rounded-xl shadow-lg hover:bg-[#3E6052] transition-colors disabled:opacity-50">
                {form.loading ? 'Guardando...' : 'Confirmar Operación'}
            </button>
        </form>
    );
};
