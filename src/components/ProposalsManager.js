"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db, appId } from "../lib/firebase";

export default function ProposalsManager({ proId }) {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [editingQuote, setEditingQuote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // New simplified editor state variables
  const [editClientName, setEditClientName] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editNetSqft, setEditNetSqft] = useState('');
  const [editWaste, setEditWaste] = useState('1.10');
  const [editPadSelection, setEditPadSelection] = useState('none');
  const [editPadCost, setEditPadCost] = useState('0.00');
  const [editTrimQty, setEditTrimQty] = useState({ standard: 0, stairnose: 0, quarterRound: 0 });
  const [editTrimCost, setEditTrimCost] = useState({ standard: 25, stairnose: 45, quarterRound: 10 });
  const [editLaborInstall, setEditLaborInstall] = useState('');
  const [editLaborPrep, setEditLaborPrep] = useState('');
  const [editLaborDelivery, setEditLaborDelivery] = useState('');
  const [editCustomLabor1Name, setEditCustomLabor1Name] = useState('');
  const [editCustomLabor1Cost, setEditCustomLabor1Cost] = useState('');
  const [editCustomLabor2Name, setEditCustomLabor2Name] = useState('');
  const [editCustomLabor2Cost, setEditCustomLabor2Cost] = useState('');
  const [editMargin, setEditMargin] = useState(20);
  const [productDetailsCache, setProductDetailsCache] = useState(null);

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

  const handleEditClick = async (quote) => {
      setIsLoading(true);
      try {
          // We need to fetch the live product to calculate math accurately!
          const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', quote.productId);
          const prodSnap = await getDoc(prodRef);
          if (prodSnap.exists()) {
              setProductDetailsCache(prodSnap.data());
          } else {
              alert("Original product data could not be loaded for math recalculations.");
              setIsLoading(false);
              return;
          }

          // Populate the builder states!
          setEditClientName(quote.clientName || '');
          setEditProjectName(quote.projectName || '');
          setEditNetSqft(quote.measurements?.netSqft || '');
          setEditWaste(quote.measurements?.waste?.toFixed(2) || '1.10');
          
          if (quote.addons?.pad) {
              if (quote.addons.pad.name.includes("6lb")) setEditPadSelection('6lb');
              else if (quote.addons.pad.name.includes("Hope")) setEditPadSelection('8lb_hope');
              else if (quote.addons.pad.name.includes("Memory")) setEditPadSelection('8lb_memory');
              else setEditPadSelection('none');
              
              // Reverse engineer per-sqyd pad cost
              const requiredSqYd = Math.ceil(((quote.measurements?.netSqft || 0) * (quote.measurements?.waste || 1.1)) / 9);
              if (requiredSqYd > 0) setEditPadCost((quote.addons.pad.cost / requiredSqYd).toFixed(2));
          } else {
              setEditPadSelection('none');
              setEditPadCost('0.00');
          }

          setEditTrimQty({
              standard: quote.addons?.trims?.details?.standard || 0,
              stairnose: quote.addons?.trims?.details?.stairnose || 0,
              quarterRound: quote.addons?.trims?.details?.quarterRound || 0
          });

          // Reverse engineer labor per sqft
          const installCost = quote.services?.installTotal || 0;
          const net = quote.measurements?.netSqft || 0;
          setEditLaborInstall(net > 0 ? (installCost / net).toFixed(2) : '');

          setEditLaborPrep(quote.services?.prep || '');
          setEditLaborDelivery(quote.services?.delivery || '');
          
          setEditCustomLabor1Name(quote.services?.custom1?.name || '');
          setEditCustomLabor1Cost(quote.services?.custom1?.cost || '');
          setEditCustomLabor2Name(quote.services?.custom2?.name || '');
          setEditCustomLabor2Cost(quote.services?.custom2?.cost || '');

          setEditMargin(quote.totals?.margin || 0);

          setEditingQuote(quote);
      } catch (err) {
          console.error(err);
          alert("Error loading quote editor.");
      }
      setIsLoading(false);
  };

  useEffect(() => {
        if (editPadSelection === '6lb') setEditPadCost('2.50');
        else if (editPadSelection === '8lb_hope') setEditPadCost('3.75');
        else if (editPadSelection === '8lb_memory') setEditPadCost('4.50');
        else if (editPadSelection === 'none') setEditPadCost('0.00');
  }, [editPadSelection]);

  // Recalculate Totals
  const isCarpet = editingQuote?.category === 'Carpet' || (editingQuote?.category || '').toLowerCase().includes('carpet');
  const basePrice = productDetailsCache?.price || 0;
  
  let cartonSqft = parseFloat(productDetailsCache?.cartonSize);
  if (isNaN(cartonSqft) || cartonSqft <= 0) cartonSqft = parseFloat(productDetailsCache?.boxSqft);
  if (!cartonSqft && productDetailsCache?.specs && Array.isArray(productDetailsCache.specs)) {
      const specText = productDetailsCache.specs.join(' ').toLowerCase();
      const sqftMatch = specText.match(/([\d.]+)\s*(sq\.?ft\.?|sq\s*ft|sf)/);
      if (sqftMatch && parseFloat(sqftMatch[1]) > 0) cartonSqft = parseFloat(sqftMatch[1]);
  }
  cartonSqft = cartonSqft || 20;

  const netSqftNum = parseFloat(editNetSqft) || 0;
  const totalSqftWithWaste = netSqftNum * parseFloat(editWaste);
  
  const requiredSqYd = Math.ceil(totalSqftWithWaste / 9);
  const requiredCartons = Math.ceil(totalSqftWithWaste / cartonSqft);
  const finalMaterialQty = isCarpet ? requiredSqYd : requiredCartons;
  const finalMaterialUnit = isCarpet ? 'sqyd' : 'cartons';
  const finalMaterialCoverageSqft = isCarpet ? (requiredSqYd * 9) : (requiredCartons * cartonSqft);
  
  const totalMaterialCost = isCarpet 
      ? (requiredSqYd * (basePrice * 9)) 
      : (requiredCartons * cartonSqft * basePrice);

  const totalPadCost = isCarpet && editPadSelection !== 'none' 
      ? (requiredSqYd * (parseFloat(editPadCost) || 0)) 
      : 0;

  const totalTrimCost = isCarpet ? 0 : 
      (editTrimQty.standard * editTrimCost.standard) + 
      (editTrimQty.stairnose * editTrimCost.stairnose) + 
      (editTrimQty.quarterRound * editTrimCost.quarterRound);

  const totalLaborCost = 
      (parseFloat(editLaborPrep) || 0) + 
      (netSqftNum * (parseFloat(editLaborInstall) || 0)) + 
      (parseFloat(editLaborDelivery) || 0) + 
      (parseFloat(editCustomLabor1Cost) || 0) + 
      (parseFloat(editCustomLabor2Cost) || 0);

  const currentWholesale = totalMaterialCost + totalPadCost + totalTrimCost + totalLaborCost;
  const currentTurnkeyRetail = currentWholesale * (1 + (editMargin / 100));


  const saveEdit = async () => {
      setIsSaving(true);
      try {
          let padName = '';
          if (editPadSelection === '6lb') padName = "6lb Standard Cushion";
          else if (editPadSelection === '8lb_hope') padName = "Premium 8lb 'Hope' Moisture Barrier Cushion";
          else if (editPadSelection === '8lb_memory') padName = "Luxury 8lb Memory Foam Cushion";

          const updatedQuote = {
              clientName: editClientName,
              projectName: editProjectName || 'Flooring Project',
              measurements: { waste: parseFloat(editWaste), netSqft: netSqftNum, coverageSqft: finalMaterialCoverageSqft },
              material: { qty: finalMaterialQty, unit: finalMaterialUnit, wholesaleTotal: totalMaterialCost },
              addons: {
                  pad: padName ? { name: padName, cost: totalPadCost } : null,
                  trims: !isCarpet && (editTrimQty.standard > 0 || editTrimQty.stairnose > 0 || editTrimQty.quarterRound > 0) ? { 
                      cost: totalTrimCost, 
                      details: { standard: editTrimQty.standard, stairnose: editTrimQty.stairnose, quarterRound: editTrimQty.quarterRound } 
                  } : null
              },
              services: {
                  prep: parseFloat(editLaborPrep) || 0,
                  installTotal: netSqftNum * (parseFloat(editLaborInstall) || 0),
                  delivery: parseFloat(editLaborDelivery) || 0,
                  custom1: (editCustomLabor1Name && parseFloat(editCustomLabor1Cost) > 0) ? { name: editCustomLabor1Name, cost: parseFloat(editCustomLabor1Cost) } : null,
                  custom2: (editCustomLabor2Name && parseFloat(editCustomLabor2Cost) > 0) ? { name: editCustomLabor2Name, cost: parseFloat(editCustomLabor2Cost) } : null
              },
              totals: { wholesale: currentWholesale, margin: editMargin, turnkeyRetail: currentTurnkeyRetail }
          };

          await updateDoc(doc(db, "artifacts", appId, "public", "data", "pro_quotes", editingQuote.id), updatedQuote);
          
          setQuotes(quotes.map(q => q.id === editingQuote.id ? { ...q, ...updatedQuote } : q));
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
          <div className="fixed inset-0 z-50 flex justify-end text-left">
              <div className="absolute inset-0 bg-black/60 transition-opacity backdrop-blur-sm" onClick={() => setEditingQuote(null)}></div>
              
              <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl relative z-10 animate-in slide-in-from-right flex flex-col">
                  
                  <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-20">
                      <div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Edit Proposal</h3>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{editingQuote.productName}</p>
                      </div>
                      <button onClick={() => setEditingQuote(null)} className="text-gray-400 hover:text-black text-2xl font-bold bg-transparent border-none cursor-pointer outline-none p-2">✕</button>
                  </div>

                  <div className="p-6 space-y-8 flex-1">
                      
                      {/* PROPOSAL DETAILS */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Proposal Details</h4>
                          <div className="space-y-3">
                              <div>
                                  <input type="text" placeholder="Client Name (e.g. Smith Family) *" value={editClientName} onChange={e => setEditClientName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                              </div>
                              <div>
                                  <input type="text" placeholder="Project / Room (e.g. Kitchen Remodel)" value={editProjectName} onChange={e => setEditProjectName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                              </div>
                          </div>
                      </div>

                      {/* STEP 1: MEASUREMENTS */}
                      <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><span>1</span> Measurements</h4>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Net Square Footage</label>
                                  <input type="number" value={editNetSqft} onChange={e => setEditNetSqft(e.target.value)} placeholder="e.g. 500" className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-gray-50" />
                              </div>
                              <div>
                                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Waste Factor</label>
                                  <select value={editWaste} onChange={e => setEditWaste(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-gray-50">
                                      <option value="1.00">Exact Net (0%)</option>
                                      <option value="1.05">Standard (5%)</option>
                                      <option value="1.10">Safe (10%)</option>
                                      <option value="1.15">Complex / Diagonal (15%)</option>
                                  </select>
                              </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex justify-between items-center text-xs font-bold text-blue-900">
                              <span>Coverage Required:</span>
                              <span>{finalMaterialCoverageSqft.toFixed(1)} sqft ({finalMaterialQty} {finalMaterialUnit})</span>
                          </div>
                      </div>

                      {/* STEP 2: ACCESSORIES */}
                      <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><span>2</span> Add-Ons & Accessories</h4>
                          
                          {isCarpet ? (
                              <div className="space-y-3">
                                  <div>
                                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Select Carpet Cushion</label>
                                      <select value={editPadSelection} onChange={e => setEditPadSelection(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white">
                                          <option value="none">No Pad Included</option>
                                          <option value="6lb">6lb Standard Cushion</option>
                                          <option value="8lb_hope">Premium 8lb "Hope" Moisture Barrier</option>
                                          <option value="8lb_memory">Luxury 8lb Memory Foam</option>
                                      </select>
                                  </div>
                                  {editPadSelection !== 'none' && (
                                      <div className="flex items-center gap-2">
                                          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 flex-1">Your Cost per sqyd ($)</label>
                                          <input type="number" step="0.01" value={editPadCost} onChange={e => setEditPadCost(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm text-right bg-white" />
                                      </div>
                                  )}
                              </div>
                          ) : (
                              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-700">Standard Transitions</span>
                                        <span className="text-[9px] text-gray-400">T-Mold, Reducer, End Cap</span>
                                      </div>
                                      <input type="number" min="0" placeholder="Qty" value={editTrimQty.standard || ''} onChange={e => setEditTrimQty({...editTrimQty, standard: parseInt(e.target.value)||0})} className="w-16 p-2 border border-gray-200 rounded-lg text-xs text-center outline-none focus:border-gold bg-white" />
                                      <div className="flex items-center gap-1 text-xs text-gray-400">$<input type="number" value={editTrimCost.standard} onChange={e=>setEditTrimCost({...editTrimCost, standard: parseFloat(e.target.value)||0})} className="w-12 p-1 border border-gray-200 rounded bg-white text-right outline-none focus:border-gold"/></div>
                                  </div>
                                  <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                                      <span className="text-xs font-bold text-gray-700">Stair Nose</span>
                                      <input type="number" min="0" placeholder="Qty" value={editTrimQty.stairnose || ''} onChange={e => setEditTrimQty({...editTrimQty, stairnose: parseInt(e.target.value)||0})} className="w-16 p-2 border border-gray-200 rounded-lg text-xs text-center outline-none focus:border-gold bg-white" />
                                      <div className="flex items-center gap-1 text-xs text-gray-400">$<input type="number" value={editTrimCost.stairnose} onChange={e=>setEditTrimCost({...editTrimCost, stairnose: parseFloat(e.target.value)||0})} className="w-12 p-1 border border-gray-200 rounded bg-white text-right outline-none focus:border-gold"/></div>
                                  </div>
                                  <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                                      <span className="text-xs font-bold text-gray-700">Quarter Round</span>
                                      <input type="number" min="0" placeholder="Qty" value={editTrimQty.quarterRound || ''} onChange={e => setEditTrimQty({...editTrimQty, quarterRound: parseInt(e.target.value)||0})} className="w-16 p-2 border border-gray-200 rounded-lg text-xs text-center outline-none focus:border-gold bg-white" />
                                      <div className="flex items-center gap-1 text-xs text-gray-400">$<input type="number" value={editTrimCost.quarterRound} onChange={e=>setEditTrimCost({...editTrimCost, quarterRound: parseFloat(e.target.value)||0})} className="w-12 p-1 border border-gray-200 rounded bg-white text-right outline-none focus:border-gold"/></div>
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* STEP 3: LABOR */}
                      <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><span>3</span> Labor & Logistics (Your Cost)</h4>
                          <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Basic Install <span className="text-[10px] text-gray-400 font-normal ml-1">/ sqft</span></label>
                                  <input type="number" placeholder="0.00" value={editLaborInstall} onChange={e => setEditLaborInstall(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                              </div>
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Tear Out & Prep <span className="text-[10px] text-gray-400 font-normal ml-1">Lump Sum</span></label>
                                  <input type="number" placeholder="0.00" value={editLaborPrep} onChange={e => setEditLaborPrep(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                              </div>
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Fuel & Delivery <span className="text-[10px] text-gray-400 font-normal ml-1">Lump Sum</span></label>
                                  <input type="number" placeholder="0.00" value={editLaborDelivery} onChange={e => setEditLaborDelivery(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                              </div>

                              <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Additional Custom Labor</p>
                                  <div className="flex gap-2">
                                      <input type="text" placeholder="e.g. Stair Labor" value={editCustomLabor1Name} onChange={e => setEditCustomLabor1Name(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gold bg-white" />
                                      <input type="number" placeholder="$ 0.00" value={editCustomLabor1Cost} onChange={e => setEditCustomLabor1Cost(e.target.value)} className="w-20 p-2 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-gold bg-gray-50" />
                                  </div>
                                  <div className="flex gap-2">
                                      <input type="text" placeholder="e.g. Moving Appliances" value={editCustomLabor2Name} onChange={e => setEditCustomLabor2Name(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gold bg-white" />
                                      <input type="number" placeholder="$ 0.00" value={editCustomLabor2Cost} onChange={e => setEditCustomLabor2Cost(e.target.value)} className="w-20 p-2 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-gold bg-gray-50" />
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
                              <div className="text-lg font-mono text-gray-200">${currentWholesale.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] text-gold font-bold uppercase tracking-widest flex items-center gap-2 justify-end">
                                  Margin: {editMargin}%
                              </div>
                              <div className="text-2xl font-black text-white font-mono">${currentTurnkeyRetail.toFixed(2)}</div>
                              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Gross Profit: ${(currentTurnkeyRetail - currentWholesale).toFixed(2)}</div>
                          </div>
                      </div>
                      
                      <input type="range" min="0" max="100" step="1" value={editMargin} onChange={e => setEditMargin(Number(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold mb-6" />

                      <div className="space-y-3">
                          <button onClick={saveEdit} disabled={isSaving || netSqftNum === 0 || !editClientName.trim()} className="w-full bg-gold text-black hover:bg-white font-black uppercase tracking-widest py-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer outline-none">
                              {isSaving ? 'Saving...' : 'Update Proposal'}
                          </button>
                          {(!editClientName.trim() || netSqftNum === 0) && (
                              <div className="text-[10px] text-red-400 text-center uppercase tracking-widest font-bold">Client Name & SqFt Required</div>
                          )}
                      </div>
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