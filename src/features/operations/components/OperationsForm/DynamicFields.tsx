import React from 'react';
import { OperationCategory } from '../../types';

// Large component containing the conditional logic for fields
// We pass relevant props from the hook
import { InventoryItem } from '@/features/inventory/types';
import { CustomerSelector } from '@/features/crm/components/CustomerSelector';
import { InputItem } from '@/lib/database/inputs.db';

interface DynamicFieldsProps {
    category: string;
    subcategory: string;
    setSubcategory: (val: string) => void;
    quantity: number;
    setQuantity: (val: number) => void;
    unitCost: number;
    setUnitCost: (val: number) => void;
    totalCost: number;
    setTotalCost: (val: number) => void;
    description: string;
    setDescription: (val: string) => void;
    performer: string;
    setPerformer: (val: string) => void;
    clientName: string;
    setClientName: (val: string) => void;
    customerId: string;
    setCustomerId: (val: string) => void;
    selectedProductId: string;
    setSelectedProductId: (val: string) => void;
    products: any[];
    existingCustomers: any[];
    panoStats: any;
    panoId: string[];
    // Inventory Props
    inventoryItems?: InventoryItem[];
    selectedInventoryItemId?: string;
    setSelectedInventoryItemId?: (val: string) => void;
    // Input Props
    allInputs?: InputItem[];
    selectedInputId?: string;
    setSelectedInputId?: (val: string) => void;
    inputQuantity?: number;
    setInputQuantity?: (val: number) => void;
    // Payment Props
    amountPaid: number;
    setAmountPaid: (val: number) => void;
    paymentDueDate: string;
    setPaymentDueDate: (val: string) => void;
}

export const DynamicFields: React.FC<DynamicFieldsProps> = ({
    category, subcategory, setSubcategory,
    quantity, setQuantity,
    unitCost, setUnitCost,
    totalCost, setTotalCost,
    description, setDescription,
    performer, setPerformer,
    clientName, setClientName,
    customerId, setCustomerId,
    selectedProductId, setSelectedProductId,
    products,
    existingCustomers,
    panoStats,
    panoId,
    inventoryItems = [],
    selectedInventoryItemId,
    setSelectedInventoryItemId,
    allInputs = [],
    selectedInputId,
    setSelectedInputId,
    inputQuantity = 0,
    setInputQuantity,
    amountPaid,
    setAmountPaid,
    paymentDueDate,
    setPaymentDueDate
}) => {

    return (
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl animate-in fade-in">

            {/* --- RENDIMIENTO --- */}
            {category === 'Rendimiento' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Actividad</label>
                        <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="w-full p-3 border rounded text-lg">
                            <option value="">Seleccionar...</option>
                            <option value="Fardos Cosechados">🚜 Cosecha de Fardos</option>
                            <option value="Días de Riego">💧 Jornada de Riego</option>
                            <option value="Uso de Materiales">📦 Uso de Materiales</option>
                            <option value="Merma / Pérdida">📉 Merma / Pérdida / Fardos</option>
                        </select>
                    </div>

                    {subcategory === 'Fardos Cosechados' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad (Fardos)</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-4 text-4xl font-bold text-green-800 border rounded text-right" placeholder="0" />
                        </div>
                    )}

                    {subcategory === 'Uso de Materiales' && (
                        <div className="space-y-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                            <div>
                                <label className="block text-sm font-bold text-yellow-900 mb-2">Seleccionar Material / Herramienta</label>
                                <select
                                    value={selectedInventoryItemId}
                                    onChange={e => setSelectedInventoryItemId && setSelectedInventoryItemId(e.target.value)}
                                    className="w-full p-3 border rounded text-lg bg-white"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {inventoryItems?.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (Disp: {item.quantity_available} {item.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-yellow-900 mb-2">Cantidad Usada</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-3 border rounded font-bold" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Notas / Destino</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded" placeholder="Ej: Reparación cerco sector norte..." />
                            </div>
                        </div>
                    )}

                    {subcategory === 'Merma / Pérdida' && (
                        <div className="space-y-4">
                            <div className="flex gap-2 mb-4">
                                <button type="button" onClick={() => setDescription('Pérdida de Fardos')} className={`flex-1 py-2 rounded font-bold border ${description.includes('Fardos') ? 'bg-orange-600 text-white' : 'bg-white'}`}>Fardos</button>
                                <button type="button" onClick={() => setDescription('Pérdida de Material')} className={`flex-1 py-2 rounded font-bold border ${description.includes('Material') ? 'bg-orange-600 text-white' : 'bg-white'}`}>Material</button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-4 text-4xl font-bold text-orange-800 border-2 border-orange-200 bg-orange-50 rounded text-right" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Motivo</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded" placeholder="Ej: Lluvia, roedores, robo..." />
                            </div>
                        </div>
                    )}

                    {subcategory === 'Días de Riego' && (
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Responsable</label>
                                <select value={performer} onChange={e => setPerformer(e.target.value)} className="w-full p-3 border rounded">
                                    <option value="">Quién regó?</option>
                                    <option value="Max B.">Max B. (Dueño - $0)</option>
                                    <option value="Don Enrique">Don Enrique (Tarifa Diaria)</option>
                                    <option value="Otro">Otro (Manual)</option>
                                </select>
                                {performer === 'Otro' && (
                                    <input type="text" placeholder="Nombre" onChange={e => setPerformer(e.target.value)} className="mt-2 w-full p-2 border border-blue-300 rounded" />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Días (Auto)</label>
                                <div className="p-3 bg-gray-100 rounded text-xl font-bold text-center">{quantity} Días</div>
                            </div>
                        </div>
                    )}

                    {/* Consumo de Insumos (Opcional para cualquier actividad de Rendimiento) */}
                    {(subcategory === 'Fardos Cosechados' || subcategory === 'Días de Riego') && (
                        <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-100 italic">
                            <h4 className="text-sm font-bold text-[#2D4A3E] mb-3 flex items-center gap-2">
                                ⛽ Registrar Consumo de Insumos (Opcional)
                            </h4>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Insumo Utilizado</label>
                                    <select
                                        value={selectedInputId}
                                        onChange={e => setSelectedInputId && setSelectedInputId(e.target.value)}
                                        className="w-full p-2 border rounded text-sm bg-white"
                                    >
                                        <option value="">-- Ninguno --</option>
                                        {allInputs.map(input => (
                                            <option key={input.id} value={input.id}>
                                                {input.name} (Stock: {input.stock_quantity} {input.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Cantidad Usada</label>
                                    <input
                                        type="number"
                                        value={inputQuantity}
                                        onChange={e => setInputQuantity && setInputQuantity(Number(e.target.value))}
                                        className="w-full p-2 border rounded text-sm bg-white"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- VENTA --- */}
            {category === 'Venta' && (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex gap-2 mb-6">
                        <button type="button" onClick={() => { setSubcategory('Fardos'); setSelectedProductId(''); }} className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${subcategory === 'Fardos' ? 'bg-green-700 text-white shadow-md' : 'bg-white text-green-700 border border-green-200'}`}>🌾 Fardos</button>
                        <button type="button" onClick={() => { setSubcategory('Producto Web'); setDescription('Venta Productos Web'); }} className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${subcategory === 'Producto Web' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 border border-blue-200'}`}>🛍️ Producto Web</button>
                    </div>

                    {subcategory === 'Producto Web' && (
                        <div className="mb-6 bg-white p-4 rounded-lg border border-blue-100 shadow-inner">
                            <label className="block text-sm font-bold text-blue-800 mb-2">Selecciona Producto</label>
                            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">-- Seleccionar --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} (Stock: {p.stock}) - ${p.price?.toLocaleString()}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* CUSTOMER SELECTOR - Replaced simple input with searchable selector */}
                    <CustomerSelector
                        value={clientName}
                        onSearchChange={setClientName}
                        onChange={(customer, isNew) => {
                            if (isNew) {
                                // User clicked "Create New Customer"
                                setClientName('');
                                setCustomerId('');
                                if (!description.includes('[DATOS_CLIENTE]')) {
                                    setDescription(description + ' [DATOS_CLIENTE]');
                                }
                            } else if (customer) {
                                // Existing customer selected
                                setClientName(customer.name);
                                setCustomerId(customer.id);

                                // If customer is incomplete, auto-check the checkbox to request data
                                if (!customer.data_complete) {
                                    if (!description.includes('[DATOS_CLIENTE]')) {
                                        setDescription(description + ' [DATOS_CLIENTE]');
                                    }
                                } else {
                                    // Remove the tag if it was there and customer is complete
                                    setDescription(description.replace(' [DATOS_CLIENTE]', '').replace('[DATOS_CLIENTE]', ''));
                                }
                            }
                        }}
                    />

                    {/* NEW CUSTOMER CHECKBOX */}
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={description.includes('[DATOS_CLIENTE]')}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setDescription(description + ' [DATOS_CLIENTE]');
                                    } else {
                                        setDescription(description.replace(' [DATOS_CLIENTE]', '').replace('[DATOS_CLIENTE]', ''));
                                    }
                                }}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-bold text-blue-800">📋 Registrar/Actualizar Datos de Contacto</span>
                        </label>

                        {/* CONTACT FIELDS - Show when checkbox is checked */}
                        {description.includes('[DATOS_CLIENTE]') && (
                            <div className="mt-4 space-y-3 bg-white p-4 rounded border border-blue-100">
                                <p className="text-xs text-blue-600 font-bold mb-2 flex justify-between">
                                    <span>📋 Información de Contacto</span>
                                    <span className="text-[10px] text-gray-400 font-normal italic">Campos opcionales pero recomendados</span>
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">
                                            📞 Teléfono {!description.includes('[PHONE:') && <span className="text-red-500 font-normal">(Recomendado)</span>}
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+56 9 1234 5678"
                                            className="w-full p-2 border rounded text-sm"
                                            onChange={(e) => {
                                                // Store in description temporarily
                                                const phone = e.target.value;
                                                const base = description.replace(/\[PHONE:.*?\]/g, '');
                                                setDescription(phone ? `${base} [PHONE:${phone}]` : base);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">
                                            ✉️ Email {!description.includes('[EMAIL:') && <span className="text-red-500 font-normal">(Recomendado)</span>}
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="cliente@ejemplo.com"
                                            className="w-full p-2 border rounded text-sm"
                                            onChange={(e) => {
                                                const email = e.target.value;
                                                const base = description.replace(/\[EMAIL:.*?\]/g, '');
                                                setDescription(email ? `${base} [EMAIL:${email}]` : base);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">
                                        📍 Dirección de Entrega {!description.includes('[ADDRESS:') && <span className="text-red-500 font-normal">(Recomendado)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Calle, número, comuna, ciudad"
                                        className="w-full p-2 border rounded text-sm"
                                        onChange={(e) => {
                                            const address = e.target.value;
                                            const base = description.replace(/\[ADDRESS:.*?\]/g, '');
                                            setDescription(address ? `${base} [ADDRESS:${address}]` : base);
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">🏙️ Comuna</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Providencia"
                                            className="w-full p-2 border rounded text-sm"
                                            onChange={(e) => {
                                                const comuna = e.target.value;
                                                const base = description.replace(/\[COMUNA:.*?\]/g, '');
                                                setDescription(comuna ? `${base} [COMUNA:${comuna}]` : base);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">🌎 Región</label>
                                        <select
                                            className="w-full p-2 border rounded text-sm"
                                            onChange={(e) => {
                                                const region = e.target.value;
                                                const base = description.replace(/\[REGION:.*?\]/g, '');
                                                setDescription(region ? `${base} [REGION:${region}]` : base);
                                            }}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="Metropolitana">Metropolitana</option>
                                            <option value="Valparaíso">Valparaíso</option>
                                            <option value="O'Higgins">O'Higgins</option>
                                            <option value="Maule">Maule</option>
                                            <option value="Biobío">Biobío</option>
                                            <option value="Araucanía">Araucanía</option>
                                            <option value="Los Ríos">Los Ríos</option>
                                            <option value="Los Lagos">Los Lagos</option>
                                        </select>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 italic mt-2">💡 Esta información se guardará automáticamente al registrar la venta.</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-3 border rounded font-mono font-bold" placeholder="Cant." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Precio Unitario</label>
                            <input type="number" value={unitCost} onChange={e => setUnitCost(Number(e.target.value))} className="w-full p-3 border rounded font-mono" placeholder="$" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Total</label>
                            <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded font-mono font-bold text-blue-800 text-right">${totalCost.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Stock Check */}
                    <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-600 flex justify-between items-center">
                        <span>Stock Paño {panoId[0]}: <b>{panoStats.produced}</b> prod. / <b>{panoStats.sold}</b> vendidos</span>
                        <span className={`font-bold ${panoStats.produced - panoStats.sold - quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>Disponible: {panoStats.produced - panoStats.sold - quantity}</span>
                    </div>

                    {/* PAYMENT TRACKING FIELDS */}
                    <div className="mt-6 pt-6 border-t border-green-200">
                        <h4 className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
                            💰 Estado de Pago
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Monto Pagado Hoy</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={e => setAmountPaid(Number(e.target.value))}
                                        className="w-full p-2 pl-7 border rounded font-bold text-green-700 focus:ring-2 focus:ring-green-500"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <button type="button" onClick={() => setAmountPaid(totalCost)} className="text-[10px] text-blue-600 hover:underline">Pagar Total</button>
                                    <button type="button" onClick={() => setAmountPaid(0)} className="text-[10px] text-gray-400 hover:underline">Limpiar</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Fecha Compromiso (Si hay deuda)</label>
                                <input
                                    type="date"
                                    value={paymentDueDate}
                                    disabled={amountPaid >= totalCost}
                                    onChange={e => setPaymentDueDate(e.target.value)}
                                    className={`w-full p-2 border rounded text-sm ${amountPaid >= totalCost ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-orange-700 border-orange-200 font-bold'}`}
                                />
                                {amountPaid < totalCost && !paymentDueDate && (
                                    <p className="text-[10px] text-red-500 mt-1 italic">Recomendado si queda deuda</p>
                                )}
                            </div>
                        </div>

                        {amountPaid < totalCost && (
                            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100 flex justify-between items-center animate-pulse">
                                <span className="text-xs text-orange-800 font-bold">Saldo Pendiente:</span>
                                <span className="text-sm font-black text-orange-900">${(totalCost - amountPaid).toLocaleString()}</span>
                            </div>
                        )}

                        {amountPaid >= totalCost && totalCost > 0 && (
                            <div className="mt-4 p-2 bg-green-100 rounded-lg text-center">
                                <span className="text-xs text-green-800 font-bold">✅ Venta Pagada en su Totalidad</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- COSTO OPERACIONAL --- */}
            {category === 'Costo Operacional' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Concepto</label>
                        <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="w-full p-3 border rounded">
                            <option value="">Seleccionar...</option>
                            <option value="Insumos">Insumos (Semillas, Fertilizante)</option>
                            <option value="Mano de Obra">Mano de Obra Extra</option>
                            <option value="Combustible">Combustible</option>
                            <option value="Mantención">Mantención Maquinaria</option>
                            <option value="Arriendo">Arriendo de Terreno</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>

                    {subcategory === 'Combustible' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                                <select onChange={e => setDescription(`Combustible: ${e.target.value}`)} className="w-full p-2 border rounded"><option value="Petróleo">Petróleo (Diesel)</option><option value="Nafta">Nafta (Gasolina)</option></select>
                            </div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Litros</label><input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-2 border rounded" /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Precio/Lt</label><input type="number" value={unitCost} onChange={e => setUnitCost(Number(e.target.value))} className="w-full p-2 border rounded" /></div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded" placeholder="Detalle del gasto..." />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Monto Total</label>
                        <input type="number" value={totalCost} onChange={e => setTotalCost(Number(e.target.value))} className="w-full p-3 border rounded text-xl font-bold text-red-700" placeholder="$" />
                    </div>

                    {panoId.length > 1 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-sm font-bold text-blue-900 mb-1">💡 Distribución Multi-Paño</p>
                            <p className="text-xs text-blue-700">Gasto de <b>${totalCost.toLocaleString()}</b> dividido en {panoId.length} paños.</p>
                            <p className="text-xs text-blue-600 mt-1">Costo por paño: <b>${Math.round(totalCost / panoId.length).toLocaleString()}</b></p>
                        </div>
                    )}
                </div>
            )}
            {/* --- RETIRO DE UTILIDAD --- */}
            {category === 'Retiro de Utilidad' && (
                <div className="space-y-6 bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🏦</span>
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900">Retiro de Utilidad</h3>
                            <p className="text-xs text-indigo-700">Estos movimientos NO se consideran costos operacionales.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Destino / Concepto</label>
                        <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="w-full p-3 border rounded">
                            <option value="">Seleccionar...</option>
                            <option value="Personal">Personal (Max)</option>
                            <option value="Ohana">Ohana (Inversión Personal)</option>
                            <option value="Impuestos / Retenciones">Impuestos / Retenciones</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded" placeholder="Ej: Pago arriendo personal, ahorro, etc..." />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Monto del Retiro</label>
                        <input type="number" value={totalCost} onChange={e => {
                            setTotalCost(Number(e.target.value));
                            setUnitCost(Number(e.target.value));
                            setQuantity(1);
                        }} className="w-full p-3 border rounded text-2xl font-bold text-indigo-700" placeholder="$" />
                    </div>
                </div>
            )}
        </div>
    );
};

