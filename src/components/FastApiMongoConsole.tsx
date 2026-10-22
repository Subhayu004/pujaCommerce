import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Package,
  UserCheck,
  Code2,
  Terminal,
  ShieldAlert,
  Loader2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';

interface FastApiMongoConsoleProps {
  onCatalogRefresh?: () => void;
}

export const FastApiMongoConsole: React.FC<FastApiMongoConsoleProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pujas' | 'inventory' | 'pujari' | 'raw'>('pujas');
  const [healthData, setHealthData] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState('');

  // Collections state
  const [pujas, setPujas] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [pujaris, setPujaris] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Form Modals
  const [modalType, setModalType] = useState<'puja' | 'inventory' | 'pujari' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Puja Form
  const [pujaForm, setPujaForm] = useState({
    title: '',
    price: 2501,
    des: '',
  });

  // Inventory Form
  const [invForm, setInvForm] = useState({
    title: '',
    price: 450,
    des: '',
    is_available: true,
    stock: 50,
  });

  // Pujari Form
  const [pujariForm, setPujariForm] = useState({
    name: '',
    des: '',
    is_available: true,
  });

  const [copiedIp, setCopiedIp] = useState(false);
  const containerIp = '34.34.254.82';

  const checkHealth = async () => {
    setHealthLoading(true);
    setHealthError('');
    try {
      const res = await fetch('/api/fastapi/health');
      if (!res.ok) {
        throw new Error(`FastAPI responded with HTTP ${res.status}`);
      }
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setHealthError(err.message || 'Unable to reach FastAPI backend');
    } finally {
      setHealthLoading(false);
    }
  };

  const loadCollectionData = async () => {
    setLoadingData(true);
    setDataError('');
    try {
      const [pujaRes, invRes, pujariRes] = await Promise.all([
        fetch('/api/fastapi/pujas'),
        fetch('/api/fastapi/inventory'),
        fetch('/api/fastapi/pujari'),
      ]);

      if (pujaRes.ok) {
        const pData = await pujaRes.json();
        setPujas(Array.isArray(pData) ? pData : []);
      }
      if (invRes.ok) {
        const iData = await invRes.json();
        setInventory(Array.isArray(iData) ? iData : []);
      }
      if (pujariRes.ok) {
        const pjData = await pujariRes.json();
        setPujaris(Array.isArray(pjData) ? pjData : []);
      }
    } catch (err: any) {
      setDataError(err.message || 'Failed to fetch MongoDB collections via FastAPI');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    checkHealth();
    loadCollectionData();
  }, []);

  const handleOpenCreate = (type: 'puja' | 'inventory' | 'pujari') => {
    setModalType(type);
    setEditingItem(null);
    setModalError('');
    if (type === 'puja') {
      setPujaForm({ title: '', price: 2100, des: 'Traditional Vedic puja ritual performed according to shastras.' });
    } else if (type === 'inventory') {
      setInvForm({ title: '', price: 350, des: 'Pure consecrated samagri item.', is_available: true, stock: 25 });
    } else if (type === 'pujari') {
      setPujariForm({ name: '', des: 'Learned Vedic Acharya with expertise in traditional rituals.', is_available: true });
    }
  };

  const handleOpenEdit = (type: 'puja' | 'inventory' | 'pujari', item: any) => {
    setModalType(type);
    setEditingItem(item);
    setModalError('');
    if (type === 'puja') {
      setPujaForm({
        title: item.title || '',
        price: Number(item.price) || 2100,
        des: item.des || item.description || '',
      });
    } else if (type === 'inventory') {
      setInvForm({
        title: item.title || '',
        price: Number(item.price) || 350,
        des: item.des || item.description || '',
        is_available: item.is_available ?? item.available ?? true,
        stock: Number(item.stock) || 10,
      });
    } else if (type === 'pujari') {
      setPujariForm({
        name: item.name || '',
        des: item.des || item.description || '',
        is_available: item.is_available ?? item.available ?? true,
      });
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      let endpoint = `/api/fastapi/${modalType === 'puja' ? 'pujas' : modalType === 'inventory' ? 'inventory' : 'pujari'}`;
      let method = 'POST';
      let payload: any = {};

      if (modalType === 'puja') {
        payload = {
          title: pujaForm.title.trim(),
          price: Number(pujaForm.price) || 1,
          des: pujaForm.des.trim(),
        };
      } else if (modalType === 'inventory') {
        payload = {
          title: invForm.title.trim(),
          price: Number(invForm.price) || 1,
          des: invForm.des.trim(),
          is_available: Boolean(invForm.is_available),
          stock: Number(invForm.stock) || 0,
        };
      } else if (modalType === 'pujari') {
        payload = {
          name: pujariForm.name.trim(),
          des: pujariForm.des.trim(),
          is_available: Boolean(pujariForm.is_available),
        };
      }

      if (editingItem) {
        endpoint += `/${editingItem._id || editingItem.id}`;
        method = 'PUT';
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Server error occurred');
      }

      setActionSuccess(`${editingItem ? 'Updated' : 'Created'} item in MongoDB successfully!`);
      setTimeout(() => setActionSuccess(''), 4000);
      setModalType(null);
      setEditingItem(null);
      loadCollectionData();
      checkHealth();

      // Immediately trigger catalog sync & notify dev server and devotee UI
      try {
        await fetch('/api/sync-mongo', { method: 'POST' });
      } catch {}

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('pujasathi_catalog_channel');
          bc.postMessage('catalog_updated');
          setTimeout(() => { bc.close(); }, 150);
        } catch {}
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: modalType } }));
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to save to MongoDB via FastAPI');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (type: 'pujas' | 'inventory' | 'pujari', id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from MongoDB?`)) return;
    try {
      const res = await fetch(`/api/fastapi/${type}/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Failed to delete');
      }
      setActionSuccess(`Deleted "${name}" from MongoDB.`);
      setTimeout(() => setActionSuccess(''), 4000);
      loadCollectionData();
      checkHealth();

      // Immediately sync catalog
      try {
        await fetch('/api/sync-mongo', { method: 'POST' });
      } catch {}

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('pujasathi_catalog_channel');
          bc.postMessage('catalog_updated');
          setTimeout(() => { bc.close(); }, 150);
        } catch {}
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: type === 'pujas' ? 'puja_delete' : type === 'inventory' ? 'product_delete' : 'pujari_delete', id } }));
      }
    } catch (err: any) {
      setDataError(err.message || 'Error deleting item from MongoDB');
      setTimeout(() => setDataError(''), 4000);
    }
  };

  const handleCopyIp = () => {
    navigator.clipboard.writeText(containerIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Architecture & Live Connection */}
      <div className="bg-[#1C1917] text-white border border-[#44403C] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                FastAPI 0.157 + MongoDB Atlas Active
              </span>
              <span className="text-xs text-[#A8A29E] font-mono">Port 8001 → /api/fastapi</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>FastAPI & MongoDB Cloud Architecture</span>
            </h2>
            <p className="text-xs text-[#A8A29E] max-w-2xl leading-relaxed">
              Your FastAPI backend is unzipped, compiled, and actively supervised on port 8001. All CRUD requests to <code className="text-emerald-300 font-mono">/api/fastapi/pujas</code>, <code className="text-emerald-300 font-mono">/api/fastapi/inventory</code>, and <code className="text-emerald-300 font-mono">/api/fastapi/pujari</code> communicate directly with MongoDB database <strong className="text-white">"puja"</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                checkHealth();
                loadCollectionData();
              }}
              disabled={healthLoading || loadingData}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthLoading || loadingData ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>

            <a
              href="/api/fastapi/docs"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Swagger API Docs</span>
            </a>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[#A8A29E] text-[11px] font-medium block">FastAPI Microservice</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-bold text-white text-sm">
                {healthData?.service ? 'Running (Port 8001)' : healthLoading ? 'Checking...' : 'Online'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Uvicorn ASGI Supervisor</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[#A8A29E] text-[11px] font-medium block">Target MongoDB Atlas</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-white text-sm font-mono truncate">cluster0.avbeyuw</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono mt-0.5 block">Database: "puja"</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[#A8A29E] text-[11px] font-medium block">MongoDB Collections</span>
            <div className="flex items-center gap-3 mt-1 font-mono text-xs text-white">
              <span>pujas ({pujas.length})</span>
              <span>·</span>
              <span>inventory ({inventory.length})</span>
              <span>·</span>
              <span>pujari ({pujaris.length})</span>
            </div>
            <span className="text-[10px] text-[#A8A29E] mt-0.5 block">Verified MongoDB Schema</span>
          </div>
        </div>
      </div>

      {/* Atlas Network Access Warning if TLS rejects connection */}
      {healthData?.mongo_status === 'disconnected' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#292524] space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#92400E]">
                MongoDB Atlas Network Access Configuration Notice
              </h3>
              <p className="text-xs text-[#78350F] leading-relaxed">
                MongoDB Atlas strictly blocks cloud container connections by default with <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">SSL: TLSV1_ALERT_INTERNAL_ERROR</code> until you whitelist IP access.
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-[#451A03]">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-[#B45309]">
              How to whitelist in 30 seconds:
            </span>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#78350F]">
              <li>
                Log into your MongoDB Atlas Console at{' '}
                <a
                  href="https://cloud.mongodb.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold text-[#9A3412]"
                >
                  cloud.mongodb.com
                </a>
              </li>
              <li>
                Under <strong>Security</strong> on the left menu, click <strong>Network Access</strong>.
              </li>
              <li>
                Click the green <strong>"Add IP Address"</strong> button.
              </li>
              <li>
                Click <strong>"Allow Access from Anywhere"</strong> (<code className="font-mono font-bold">0.0.0.0/0</code>) or add this container's IP:
                <div className="inline-flex items-center gap-1.5 ml-2 bg-amber-100/80 px-2 py-0.5 rounded font-mono font-bold text-[#9A3412]">
                  <span>{containerIp}</span>
                  <button
                    type="button"
                    onClick={handleCopyIp}
                    className="p-1 hover:bg-amber-200 rounded cursor-pointer"
                    title="Copy IP"
                  >
                    {copiedIp ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </li>
              <li>
                Click <strong>Confirm</strong>. Your MongoDB Atlas cluster will instantly allow queries!
              </li>
            </ol>
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {dataError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{dataError}</span>
        </div>
      )}

      {/* CRUD Navigation Sub-Tabs */}
      <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E7DCCE] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('pujas')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeSubTab === 'pujas'
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>MongoDB Pujas ({pujas.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('inventory')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeSubTab === 'inventory'
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>MongoDB Inventory ({inventory.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pujari')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeSubTab === 'pujari'
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>MongoDB Pujaris ({pujaris.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('raw')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeSubTab === 'raw'
                  ? 'bg-[#292524] text-white shadow-xs'
                  : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Raw JSON Inspector</span>
            </button>
          </div>

          {activeSubTab !== 'raw' && (
            <button
              onClick={() => handleOpenCreate(activeSubTab === 'pujas' ? 'puja' : activeSubTab === 'inventory' ? 'inventory' : 'pujari')}
              className="px-4 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>
                Add {activeSubTab === 'pujas' ? 'Puja' : activeSubTab === 'inventory' ? 'Inventory Item' : 'Pujari'} to MongoDB
              </span>
            </button>
          )}
        </div>

        {/* 1. PUJAS COLLECTION VIEW */}
        {activeSubTab === 'pujas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EFEB] border-b border-[#E7DCCE] text-[#78716C] uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3.5">MongoDB _id</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCE]">
                {pujas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#78716C]">
                      {loadingData ? 'Querying MongoDB Atlas...' : 'No puja items found in MongoDB collection "pujas". Click "+ Add Puja to MongoDB" to insert one.'}
                    </td>
                  </tr>
                ) : (
                  pujas.map((p) => (
                    <tr key={p._id || p.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-[#78716C]">{p._id || p.id}</td>
                      <td className="p-3.5 font-bold text-[#292524]">{p.title}</td>
                      <td className="p-3.5 font-bold text-[#9A3412]">₹{p.price}</td>
                      <td className="p-3.5 text-[#57534E] max-w-sm truncate">{p.des || p.description}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit('puja', p)}
                            className="px-2.5 py-1.5 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-semibold text-[11px] text-[#292524] cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#9A3412]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('pujas', p._id || p.id, p.title)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. INVENTORY COLLECTION VIEW */}
        {activeSubTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EFEB] border-b border-[#E7DCCE] text-[#78716C] uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3.5">MongoDB _id</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Available</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCE]">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#78716C]">
                      {loadingData ? 'Querying MongoDB Atlas...' : 'No items found in MongoDB collection "inventory". Click "+ Add Inventory Item to MongoDB" to insert one.'}
                    </td>
                  </tr>
                ) : (
                  inventory.map((inv) => (
                    <tr key={inv._id || inv.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-[#78716C]">{inv._id || inv.id}</td>
                      <td className="p-3.5 font-bold text-[#292524]">{inv.title}</td>
                      <td className="p-3.5 font-bold text-[#9A3412]">₹{inv.price}</td>
                      <td className="p-3.5 font-medium">{inv.stock ?? 'N/A'} units</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.is_available ?? inv.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {inv.is_available ?? inv.available ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#57534E] max-w-sm truncate">{inv.des || inv.description}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit('inventory', inv)}
                            className="px-2.5 py-1.5 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-semibold text-[11px] text-[#292524] cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#9A3412]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('inventory', inv._id || inv.id, inv.title)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. PUJARI COLLECTION VIEW */}
        {activeSubTab === 'pujari' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EFEB] border-b border-[#E7DCCE] text-[#78716C] uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3.5">MongoDB _id</th>
                  <th className="p-3.5">Acharya Name</th>
                  <th className="p-3.5">Available</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCE]">
                {pujaris.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#78716C]">
                      {loadingData ? 'Querying MongoDB Atlas...' : 'No pujaris found in MongoDB collection "pujari". Click "+ Add Pujari to MongoDB" to insert one.'}
                    </td>
                  </tr>
                ) : (
                  pujaris.map((pj) => (
                    <tr key={pj._id || pj.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-[#78716C]">{pj._id || pj.id}</td>
                      <td className="p-3.5 font-bold text-[#292524]">{pj.name}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pj.is_available ?? pj.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {pj.is_available ?? pj.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#57534E] max-w-sm truncate">{pj.des || pj.description}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit('pujari', pj)}
                            className="px-2.5 py-1.5 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-semibold text-[11px] text-[#292524] cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#9A3412]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('pujari', pj._id || pj.id, pj.name)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. RAW JSON INSPECTOR */}
        {activeSubTab === 'raw' && (
          <div className="space-y-4">
            <div className="bg-[#18181B] text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96">
              <span className="text-[#A1A1AA] block mb-2">// Raw documents directly from MongoDB "puja" database via FastAPI</span>
              <pre>
                {JSON.stringify(
                  {
                    health: healthData,
                    mongodb_collections: {
                      pujas,
                      inventory,
                      pujaris,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* CRUD MODAL */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#D1BA9C] text-[#57534E] flex items-center justify-center cursor-pointer hover:bg-gray-50"
            >
              <XCircle className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold font-heading text-[#292524] mb-1">
              {editingItem ? 'Edit' : 'Create'}{' '}
              {modalType === 'puja' ? 'Puja Ritual' : modalType === 'inventory' ? 'Inventory Item' : 'Pujari'} in MongoDB
            </h3>
            <p className="text-xs text-[#78716C] mb-4">
              Sends a direct <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-[#9A3412]">{editingItem ? 'PUT' : 'POST'}</code> to FastAPI endpoint.
            </p>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl mb-4 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              {modalType === 'puja' && (
                <>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Puja Title (title) *</label>
                    <input
                      type="text"
                      required
                      value={pujaForm.title}
                      onChange={(e) => setPujaForm({ ...pujaForm, title: e.target.value })}
                      placeholder="e.g. Maha Mrityunjaya Havan"
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Price in Rupees (price) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={pujaForm.price}
                      onChange={(e) => setPujaForm({ ...pujaForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524] font-bold text-[#9A3412]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Description (des) *</label>
                    <textarea
                      rows={3}
                      required
                      value={pujaForm.des}
                      onChange={(e) => setPujaForm({ ...pujaForm, des: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524]"
                    />
                  </div>
                </>
              )}

              {modalType === 'inventory' && (
                <>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Item Title (title) *</label>
                    <input
                      type="text"
                      required
                      value={invForm.title}
                      onChange={(e) => setInvForm({ ...invForm, title: e.target.value })}
                      placeholder="e.g. Pure Gangajal 500ml"
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#44403C] mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={invForm.price}
                        onChange={(e) => setInvForm({ ...invForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs font-bold text-[#9A3412]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#44403C] mb-1">Stock Units *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={invForm.stock}
                        onChange={(e) => setInvForm({ ...invForm, stock: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Availability</label>
                    <select
                      value={invForm.is_available ? 'true' : 'false'}
                      onChange={(e) => setInvForm({ ...invForm, is_available: e.target.value === 'true' })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs font-medium"
                    >
                      <option value="true">In Stock & Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Description (des) *</label>
                    <textarea
                      rows={2}
                      required
                      value={invForm.des}
                      onChange={(e) => setInvForm({ ...invForm, des: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524]"
                    />
                  </div>
                </>
              )}

              {modalType === 'pujari' && (
                <>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Acharya Full Name (name) *</label>
                    <input
                      type="text"
                      required
                      value={pujariForm.name}
                      onChange={(e) => setPujariForm({ ...pujariForm, name: e.target.value })}
                      placeholder="e.g. Acharya Rameshwar Shastri"
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Availability</label>
                    <select
                      value={pujariForm.is_available ? 'true' : 'false'}
                      onChange={(e) => setPujariForm({ ...pujariForm, is_available: e.target.value === 'true' })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs font-medium"
                    >
                      <option value="true">Available for Rituals</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#44403C] mb-1">Vedic Description & Bio (des) *</label>
                    <textarea
                      rows={3}
                      required
                      value={pujariForm.des}
                      onChange={(e) => setPujariForm({ ...pujariForm, des: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524]"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-[#E7DCCE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{submitting ? 'Executing via FastAPI...' : editingItem ? 'Save Changes' : 'Insert into MongoDB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
