import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { PurchaseOrder, Supplier, CentralInventoryItem } from '../types';
import { translations } from '../utils/translations';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Boxes,
  FileCheck,
  AlertTriangle,
  X,
  FileText,
  Send,
  ArrowRightLeft,
} from 'lucide-react';

export const ProcurementView: React.FC = () => {
  const {
    suppliers,
    purchaseOrders,
    centralInventory,
    createPurchaseOrder,
    receiveGoodsPO,
    transferStockToDepartment,
    language,
    addToast,
  } = useHospital();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'suppliers'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePoModal, setShowCreatePoModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Transfer stock modal
  const [transferItem, setTransferItem] = useState<CentralInventoryItem | null>(null);
  const [transferQty, setTransferQty] = useState(10);
  const [targetDept, setTargetDept] = useState('Central Pharmacy');

  // New PO Form
  const [supplierId, setSupplierId] = useState('');
  const [itemName, setItemName] = useState('Sterile Surgical Gloves 7.5');
  const [itemCategory, setItemCategory] = useState('PPE & Consumables');
  const [quantity, setQuantity] = useState(100);
  const [unitPrice, setUnitPrice] = useState(4500);
  const [department, setDepartment] = useState('Operating Theatre (OT)');

  const totalPoValue = purchaseOrders.reduce((acc, po) => acc + po.total, 0);
  const receivedPoCount = purchaseOrders.filter((po) => po.status === 'Goods Received').length;
  const lowStockCount = centralInventory.filter((it) => it.currentStock <= it.minAlertThreshold).length;

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) return;

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      department,
      items: [
        {
          itemId: `item-${Date.now()}`,
          itemName,
          category: itemCategory,
          quantityOrdered: quantity,
          quantityReceived: 0,
          unitPrice,
          totalPrice: quantity * unitPrice,
        },
      ],
    });

    setShowCreatePoModal(false);
  };

  const handleReceiveGoods = (poId: string) => {
    receiveGoodsPO(poId);
    if (selectedPo?.id === poId) {
      setSelectedPo(null);
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItem) return;
    transferStockToDepartment(transferItem.id, transferQty, targetDept);
    setTransferItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            {t.procurement.procurement}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 font-mono font-medium border border-amber-800">
              {purchaseOrders.length} Orders
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rwanda medical supply chain: Supplier TIN registry, electronic Purchase Orders, Goods Received Notes (GRN) & inventory bins.
          </p>
        </div>

        <button
          onClick={() => setShowCreatePoModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-900/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t.procurement.newPurchaseOrder}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'orders'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4 text-amber-400" />
          {t.procurement.purchaseOrders}
          <span className="px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px]">
            {purchaseOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'inventory'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4 text-cyan-400" />
          {t.procurement.centralInventory}
          <span className="px-1.5 py-0.5 rounded-full bg-slate-750 text-[10px]">
            {centralInventory.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'suppliers'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          {t.procurement.suppliers}
          <span className="px-1.5 py-0.5 rounded-full bg-slate-750 text-[10px]">
            {suppliers.length}
          </span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Procurement Committed</div>
          <div className="text-xl font-bold text-white mt-1 font-mono">{totalPoValue.toLocaleString()} RWF</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Approved PO commitments</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">GRN Filed & Received</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{receivedPoCount} POs</div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">Auto-posted to Ledger</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Active Warehouse SKUs</div>
          <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">{centralInventory.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Central medical warehouse</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Low Stock Alerts</div>
          <div className="text-xl font-bold text-rose-400 mt-1 font-mono">{lowStockCount} Items</div>
          <div className="text-[11px] text-rose-400/80 mt-0.5">Below threshold</div>
        </div>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">PO Number</th>
                  <th className="p-3.5">Supplier / TIN</th>
                  <th className="p-3.5">Destination Dept</th>
                  <th className="p-3.5">Requested</th>
                  <th className="p-3.5 text-right">Total (RWF)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">GRN Document</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseOrders.map((po) => {
                  const isReceived = po.status === 'Goods Received';

                  return (
                    <tr key={po.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-cyan-300">{po.poNumber}</td>
                      <td className="p-3.5 font-medium text-white">{po.supplierName}</td>
                      <td className="p-3.5 text-slate-300">{po.department}</td>
                      <td className="p-3.5 text-slate-400">{po.requestDate}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {po.total.toLocaleString()} RWF
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isReceived
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : po.status === 'Approved'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {po.grnNumber || 'Pending delivery'}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPo(po)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="View Items"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {!isReceived && (
                            <button
                              onClick={() => handleReceiveGoods(po.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm"
                            >
                              <FileCheck className="w-3 h-3" />
                              {t.procurement.receiveGoods}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CENTRAL INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Supply Item Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Warehouse Bin</th>
                  <th className="p-3.5">Batch # / Expiry</th>
                  <th className="p-3.5 text-right">Current Stock</th>
                  <th className="p-3.5 text-right">Unit Cost (RWF)</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {centralInventory.map((item) => {
                  const isLow = item.currentStock <= item.minAlertThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-cyan-300">{item.code}</td>
                      <td className="p-3.5 font-semibold text-white">
                        {item.name}
                        {isLow && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400">{item.category}</td>
                      <td className="p-3.5 font-mono text-amber-300">{item.warehouseBin}</td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {item.batchNumber} (Exp: {item.expiryDate})
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {item.currentStock.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">
                        {item.unitCost.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setTransferItem(item);
                            setTransferQty(10);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-medium flex items-center gap-1 ml-auto"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Transfer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIERS DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{sup.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">TIN: {sup.tinNumber}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-yellow-400 font-semibold border border-slate-700">
                  ★ {sup.rating}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-850 text-xs text-slate-300 space-y-1">
                <div>Category: <strong className="text-white">{sup.category}</strong></div>
                <div>Contact: {sup.contactPerson} ({sup.phone})</div>
                <div>Address: {sup.address}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PO View Modal */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Purchase Order: {selectedPo.poNumber}</h3>
                <div className="text-xs text-slate-400">{selectedPo.supplierName}</div>
              </div>
              <button onClick={() => setSelectedPo(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedPo.items.map((it) => (
                      <tr key={it.itemId}>
                        <td className="p-2.5 font-medium text-white">{it.itemName}</td>
                        <td className="p-2.5 text-right font-mono">{it.quantityOrdered}</td>
                        <td className="p-2.5 text-right font-mono">{it.unitPrice.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          {it.totalPrice.toLocaleString()} RWF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right text-xs pt-2">
                Total Commitment: <span className="text-base font-bold font-mono text-emerald-400">{selectedPo.total.toLocaleString()} RWF</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedPo(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {transferItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
                Transfer Stock to Department
              </h3>
              <button onClick={() => setTransferItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                <div className="text-slate-400">Item: <strong className="text-white">{transferItem.name}</strong></div>
                <div className="text-slate-400">Available: <strong className="text-emerald-400 font-mono">{transferItem.currentStock} units</strong></div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Target Department</label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Central Pharmacy">Central Pharmacy</option>
                  <option value="Operating Theatre (OT)">Operating Theatre (OT)</option>
                  <option value="Emergency Department">Emergency & Trauma</option>
                  <option value="Maternity & Neonatal Ward">Maternity & Neonatal Ward</option>
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Quantity to Requisition</label>
                <input
                  type="number"
                  min="1"
                  max={transferItem.currentStock}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferItem(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Dispatch Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Purchase Order Modal */}
      {showCreatePoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                Create New Purchase Order
              </h3>
              <button onClick={() => setShowCreatePoModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Select Supplier *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (TIN: {s.tinNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Item Description</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Unit Price (RWF)</label>
                  <input
                    type="number"
                    step="500"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-850 text-right text-xs">
                Estimated Total: <strong className="font-mono text-amber-300 text-sm">{(quantity * unitPrice).toLocaleString()} RWF</strong>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!supplierId}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
