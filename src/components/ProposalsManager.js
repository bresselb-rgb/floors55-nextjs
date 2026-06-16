"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, appId } from "../lib/firebase";

export default function ProposalsManager({ proId }) {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [editingQuote, setEditingQuote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!proId || !db) return;
    const fetchQuotes = async () => {
      try {
          const q = query(collection(db, "artifacts", appId, "public", "data", "pro_quotes"), where("proId", "==", proId));
          const querySnapshot = await getDocs(q);
          const quotesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          quotesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setQuotes(quotesData);
      } catch (e) {
          console.error("Error fetching quotes:", e);
      } finally {
          setIsLoading(false);
      }
    };
    fetchQuotes();
  }, [proId]);

  const handleDelete = async (quoteId, clientName) => {
      if (window.confirm(`Are you sure you want to permanently delete the proposal for ${clientName}?`)) {
          try {
              await deleteDoc(doc(db, "artifacts", appId, "public", "data", "pro_quotes", quoteId));
              setQuotes(quotes.filter(q => q.id !== quoteId));
              triggerToast("Proposal deleted.");
          } catch (error) {
              console.error("Error deleting quote:", error);
              alert("Failed to delete proposal.");
          }
      }
  };

  const triggerToast = (msg) => {
      setToastMsg(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = (id) => {
      const url = `${window.location.origin}/proposal/${id}`;
      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(url).then(() => triggerToast("Link Copied!")).catch(console.error);
      } else {
          const tempInput = document.createElement("input");
          tempInput.value = url;
          document.body.appendChild(tempInput);
          tempInput.select();
          try { document.execCommand("copy"); triggerToast("Link Copied!"); } catch (err) { console.error('Fallback copy failed', err); }
          document.body.removeChild(tempInput);
      }
  };

  const handleEditClick = (quote) => {
      // Deep clone to safely initialize all nested objects if they were left blank originally
      const q = JSON.parse(JSON.stringify(quote));
      if (!q.measurements) q.measurements = { netSqft: 0, waste: 1.1 };
      if (!q.material) q.material = { wholesaleTotal: 0 };
      if (!q.addons) q.addons = {};
      if (!q.addons.pad) q.addons.pad = { name: '', cost: 0 };
      if (!q.addons.trims) q.addons.trims = { cost: 0, details: { standard: 0, stairnose: 0, quarterRound: 0 } };
      if (!q.services) q.services = {};
      if (!q.services.custom1) q.services.custom1 = { name: '', cost: 0 };
      if (!q.services.custom2) q.services.custom2 = { name: '', cost: 0 };
      setEditingQuote(q);
  };

  const handleEditChange = (field, value, category = null, subfield = null) => {
      let updated = { ...editingQuote };
      
      if (category === 'services') {
          if (subfield) {
              if (!updated.services[field]) updated.services[field] = { name: '', cost: 0 };
              if (subfield === 'cost') updated.services[field].cost = value === '' ? 0 : parseFloat(value);
              else updated.services[field].name = value;
          } else {
              updated.services[field] = value === '' ? 0 : parseFloat(value);
          }
      } else if (category === 'measurements') {
          updated.measurements[field] = value === '' ? 0 : parseFloat(value);
      } else if (category === 'material') {
          updated.material[field] = value === '' ? 0 : parseFloat(value);
      } else if (category === 'addons') {
          if (field === 'pad') {
               if (!updated.addons.pad) updated.addons.pad = { name: '', cost: 0 };
               if (subfield === 'cost') updated.addons.pad.cost = value === '' ? 0 : parseFloat(value);
               else updated.addons.pad.name = value;
          }
          if (field === 'trims') {
               if (!updated.addons.trims) updated.addons.trims = { cost: 0, details: { standard: 0, stairnose: 0, quarterRound: 0 } };
               if (subfield === 'cost') {
                   updated.addons.trims.cost = value === '' ? 0 : parseFloat(value);
               } else {
                   updated.addons.trims.details[subfield] = value === '' ? 0 : parseInt(value);
               }
          }
      } else if (field === 'margin') {
          updated.totals.margin = value === '' ? 0 : parseFloat(value);
      } else {
          updated[field] = value;
      }
      
      // Recalculate Totals Instantly
      const matTotal = parseFloat(updated.material?.wholesaleTotal) || 0;
      const padTotal = parseFloat(updated.addons?.pad?.cost) || 0;
      const trimTotal = parseFloat(updated.addons?.trims?.cost) || 0;
      
      const srv = updated.services || {};
      const laborTotal = (parseFloat(srv.prep) || 0) + 
                         (parseFloat(srv.installTotal) || 0) + 
                         (parseFloat(srv.delivery) || 0) + 
                         (srv.custom1 ? (parseFloat(srv.custom1.cost) || 0) : 0) + 
                         (srv.custom2 ? (parseFloat(srv.custom2.cost) || 0) : 0);
                         
      const newWholesale = matTotal + padTotal + trimTotal + laborTotal;
      const newRetail = newWholesale * (1 + ((updated.totals?.margin || 0) / 100));
      
      updated.totals.wholesale = newWholesale;
      updated.totals.turnkeyRetail = newRetail;
      
      setEditingQuote(updated);
  };

  const saveEdit = async () => {
      setIsSaving(true);
      try {
          await updateDoc(doc(db, "artifacts", appId, "public", "data", "pro_quotes", editingQuote.id), {
              clientName: editingQuote.clientName,
              projectName: editingQuote.projectName,
              measurements: editingQuote.measurements,
              material: editingQuote.material,
              addons: editingQuote.addons,
              services: editingQuote.services,
              totals: editingQuote.totals
          });
          
          setQuotes(quotes.map(q => q.id === editingQuote.id ? editingQuote : q));
          setEditingQuote(null);
          triggerToast("Proposal updated!");
      } catch (err) {
          console.error(err);
          alert("Failed to save changes.");
      }
      setIsSaving(false);
  };

  if (isLoading) return <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div></div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden mb-8">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>
      
      <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black uppercase tracking-tight">My Proposals</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">Manage, edit, and share your generated turnkey quotes.</p>

      {/* Quote List */}
      <div className="space-y-4">
        {quotes.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-6 bg-gray-50 rounded-xl border border-gray-100">No proposals created yet. Go to a product page to build one.</p>
        ) : (
          quotes.map((quote) => (
            <div key={quote.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-0.5">{quote.clientName}</h3>
                <p className="text-xs text-gray-500 mb-2">{quote.projectName} &bull; {new Date(quote.createdAt).toLocaleDateString()}</p>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded uppercase tracking-widest">
                        {quote.productName}
                    </span>
                    <span className="text-[10px] font-black bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded uppercase tracking-widest">
                        ${quote.totals?.turnkeyRetail?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Total
                    </span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/proposal/${quote.id}`} target="_blank" className="flex-1 md:flex-none bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-center" style={{ textDecoration: 'none' }}>
                    Preview
                </Link>
                <button onClick={() => copyToClipboard(quote.id)} className="flex-1 md:flex-none bg-black hover:bg-gold hover:text-black text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-center outline-none cursor-pointer">
                    Copy Link
                </button>
                <button onClick={() => handleEditClick(quote)} className="bg-white border border-gray-200 hover:border-gray-300 text-gray-500 px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none" title="Edit Proposal">
                    ✏️
                </button>
                <button onClick={() => handleDelete(quote.id, quote.clientName)} className="bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none" title="Delete Proposal">
                    🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* THE SLIDE-OUT EDIT DRAWER */}
      {editingQuote && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/60 transition-opacity backdrop-blur-sm" onClick={() => setEditingQuote(null)}></div>
              
              <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl relative z-10 animate-in slide-in-from-right flex flex-col">
                  
                  <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-20">
                      <div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Edit Proposal</h3>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{editingQuote.productName}</p>
                      </div>
                      <button onClick={() => setEditingQuote(null)} className="text-gray-400 hover:text-black text-2xl font-bold bg-transparent border-none cursor-pointer outline-none p-2">✕</button>
                  </div>

                  <div className="p-6 space-y-6 flex-1">
                      
                      {/* Project Info */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Project Info</h4>
                          <div className="space-y-3">
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-1">Client Name</label>
                                  <input type="text" value={editingQuote.clientName} onChange={e => handleEditChange('clientName', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-1">Project Name</label>
                                  <input type="text" value={editingQuote.projectName} onChange={e => handleEditChange('projectName', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                              </div>
                          </div>
                      </div>

                      {/* Measurements & Materials */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Measurements & Material</h4>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-1">Net SqFt</label>
                                  <input type="number" value={editingQuote.measurements?.netSqft || ''} onChange={e => handleEditChange('netSqft', e.target.value, 'measurements')} className="w-full p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-1">Waste Factor</label>
                                  <input type="number" step="0.01" value={editingQuote.measurements?.waste || ''} onChange={e => handleEditChange('waste', e.target.value, 'measurements')} className="w-full p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Material Base Cost ($)</label>
                              <input type="number" value={editingQuote.material?.wholesaleTotal || ''} onChange={e => handleEditChange('wholesaleTotal', e.target.value, 'material')} className="w-full p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                          </div>
                      </div>

                      {/* Accessories */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Accessories</h4>
                          <div className="space-y-3">
                              <div className="flex gap-2">
                                  <div className="flex-1">
                                      <label className="text-xs font-bold text-gray-700 mb-1 block">Pad / Cushion Name</label>
                                      <input type="text" placeholder="N/A" value={editingQuote.addons?.pad?.name || ''} onChange={e => handleEditChange('pad', e.target.value, 'addons', 'name')} className="w-full p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                                  </div>
                                  <div className="w-24">
                                      <label className="text-xs font-bold text-gray-700 mb-1 block">Cost ($)</label>
                                      <input type="number" placeholder="0.00" value={editingQuote.addons?.pad?.cost || ''} onChange={e => handleEditChange('pad', e.target.value, 'addons', 'cost')} className="w-full p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-white" />
                                  </div>
                              </div>

                              <div className="pt-3 mt-2 border-t border-gray-200">
                                  <label className="text-xs font-bold text-gray-700 block mb-2">Trim Quantities</label>
                                  <div className="flex gap-2 mb-3">
                                      <input type="number" placeholder="Standard" title="Standard Transitions" value={editingQuote.addons?.trims?.details?.standard || ''} onChange={e => handleEditChange('trims', e.target.value, 'addons', 'standard')} className="w-1/3 p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-xs bg-white text-center" />
                                      <input type="number" placeholder="Stairnose" title="Stair Noses" value={editingQuote.addons?.trims?.details?.stairnose || ''} onChange={e => handleEditChange('trims', e.target.value, 'addons', 'stairnose')} className="w-1/3 p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-xs bg-white text-center" />
                                      <input type="number" placeholder="1/4 Round" title="Quarter Round" value={editingQuote.addons?.trims?.details?.quarterRound || ''} onChange={e => handleEditChange('trims', e.target.value, 'addons', 'quarterRound')} className="w-1/3 p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-xs bg-white text-center" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                      <label className="text-xs font-bold text-gray-700">Total Trims Cost ($)</label>
                                      <input type="number" placeholder="0.00" value={editingQuote.addons?.trims?.cost || ''} onChange={e => handleEditChange('trims', e.target.value, 'addons', 'cost')} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-white" />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Labor & Logistics */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gold flex justify-between items-end mb-3">Labor & Logistics (Base Cost)</h4>
                          <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Total Installation Labor</label>
                                  <input type="number" value={editingQuote.services?.installTotal || ''} onChange={e => handleEditChange('installTotal', e.target.value, 'services')} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-white" />
                              </div>
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Tear Out & Prep</label>
                                  <input type="number" value={editingQuote.services?.prep || ''} onChange={e => handleEditChange('prep', e.target.value, 'services')} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-white" />
                              </div>
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Delivery</label>
                                  <input type="number" value={editingQuote.services?.delivery || ''} onChange={e => handleEditChange('delivery', e.target.value, 'services')} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-white" />
                              </div>

                              {/* Custom Labor Lines */}
                              <div className="pt-3 mt-2 border-t border-gray-200 space-y-2">
                                  <div className="flex gap-2">
                                      <input type="text" placeholder="Custom Labor 1 (e.g. Stairs)" value={editingQuote.services?.custom1?.name || ''} onChange={e => handleEditChange('custom1', e.target.value, 'services', 'name')} className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gold bg-white" />
                                      <input type="number" placeholder="$ 0.00" value={editingQuote.services?.custom1?.cost || ''} onChange={e => handleEditChange('custom1', e.target.value, 'services', 'cost')} className="w-20 p-2 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-gold bg-white" />
                                  </div>
                                  <div className="flex gap-2">
                                      <input type="text" placeholder="Custom Labor 2 (e.g. Appliances)" value={editingQuote.services?.custom2?.name || ''} onChange={e => handleEditChange('custom2', e.target.value, 'services', 'name')} className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gold bg-white" />
                                      <input type="number" placeholder="$ 0.00" value={editingQuote.services?.custom2?.cost || ''} onChange={e => handleEditChange('custom2', e.target.value, 'services', 'cost')} className="w-20 p-2 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-gold bg-white" />
                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>

                  {/* Save Footer */}
                  <div className="bg-gray-900 text-white p-6 sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Base Cost</div>
                              <div className="text-lg font-mono text-gray-200">${editingQuote.totals?.wholesale?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] text-gold font-bold uppercase tracking-widest flex items-center gap-2 justify-end">
                                  Margin: {editingQuote.totals?.margin}%
                              </div>
                              <div className="text-2xl font-black text-white font-mono">${editingQuote.totals?.turnkeyRetail?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                          </div>
                      </div>
                      
                      <input type="range" min="0" max="100" step="1" value={editingQuote.totals?.margin || 0} onChange={e => handleEditChange('margin', e.target.value)} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold mb-6" />

                      <button onClick={saveEdit} disabled={isSaving} className="w-full bg-gold text-black hover:bg-white font-black uppercase tracking-widest py-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer outline-none">
                          {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <span className="font-black text-gold">✓</span>
          <p className="font-bold text-xs uppercase tracking-widest m-0">{toastMsg}</p>
      </div>
    </div>
  );
}