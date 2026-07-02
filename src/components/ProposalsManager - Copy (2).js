// src/components/ProposalsManager.js
"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db, appId } from "../lib/firebase";

export default function ProposalsManager({ proId }) {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [editingQuote, setEditingQuote] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [viewingCostsQuote, setViewingCostsQuote] = useState(null);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  const [editClientName, setEditClientName] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  
  const [calcNetSqft, setCalcNetSqft] = useState('');
  const [calcWaste, setCalcWaste] = useState('1.10');
  
  const [padSelection, setPadSelection] = useState('none');
  const [padCost, setPadCost] = useState('0.00'); // Stored per SF
  
  const [globalAddons, setGlobalAddons] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const [laborPrep, setLaborPrep] = useState(''); 
  const [laborInstallPerSqft, setLaborInstallPerSqft] = useState(''); 
  const [laborDelivery, setLaborDelivery] = useState(''); 
  const [customLabor1Name, setCustomLabor1Name] = useState('');
  const [customLabor1Cost, setCustomLabor1Cost] = useState('');
  const [customLabor2Name, setCustomLabor2Name] = useState('');
  const [customLabor2Cost, setCustomLabor2Cost] = useState('');
  
  const [builderMargin, setBuilderMargin] = useState(20);
  const [availablePads, setAvailablePads] = useState([]);
  
  // NEW: State for the Edit Drawer Branding Dropdown
  const [isStaff, setIsStaff] = useState(false);
  const [editProposalBrand, setEditProposalBrand] = useState('custom');

  useEffect(() => {
    if (!proId || !db) return;
    const fetchQuotesAndPads = async () => {
      try {
          // Check if this Pro ID actually belongs to an internal Staff member
          const staffSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'staff', proId));
          if (staffSnap.exists()) {
              setIsStaff(true);
          }

          const q = query(collection(db, "artifacts", appId, "public", "data", "pro_quotes"), where("proId", "==", proId));
          const querySnapshot = await getDocs(q);
          const quotesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          quotesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setQuotes(quotesData);
          
          // Fetch live carpet pads
          const padQ = query(collection(db, "artifacts", appId, "public", "data", "pricing"), where("category", "==", "Carpet Cushion"));
          const padSnap = await getDocs(padQ);
          const pads = padSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.isVisible !== false);
          setAvailablePads(pads);

          // Fetch Addon Rules from Firebase
          const addonSnap = await getDoc(doc(db, "artifacts", appId, "public", "data", "settings", "proposal-addons"));
          if (addonSnap.exists()) {
              setGlobalAddons(addonSnap.data());
          }
      } catch (e) {
          console.error("Error fetching quotes:", e);
      } finally {
          setIsLoading(false);
      }
    };
    fetchQuotesAndPads();
  }, [proId]);

  const triggerToast = (msg) => {
      setToastMsg(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = async (quote) => {
      const targetPath = `/proposal/${quote.id}`;
      const shortCode = Math.random().toString(36).substring(2, 8);
      let finalUrl = `${window.location.origin}/s/${shortCode}`;

      try {
          // Save the short link to the database
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'short_links', shortCode), {
              target: targetPath,
              createdAt: new Date().toISOString()
          });
      } catch(err) {
          console.warn("Short link generation failed, using long URL.", err);
          finalUrl = `${window.location.origin}${targetPath}`;
      }

      // Format it perfectly for text messages with the title on top and the link below
      const plainText = `Project Proposal: ${quote.clientName}\n${finalUrl}`;

      // Cross-browser clipboard logic
      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(plainText).then(() => triggerToast("Link Copied")).catch(console.error);
      } else {
          const tempInput = document.createElement("textarea");
          tempInput.value = plainText;
          document.body.appendChild(tempInput);
          tempInput.select();
          try { document.execCommand("copy"); triggerToast("Link Copied"); } catch (err) { console.error('Fallback copy failed', err); }
          document.body.removeChild(tempInput);
      }
  };

  const handleOrderRequest = (quote) => {
      let addonsText = '';
      if (quote.addons?.pad || quote.addons?.customList?.items?.length > 0 || quote.addons?.trims?.details) {
          addonsText += `\nRequired Add-Ons:\n`;
          if (quote.addons?.pad) {
              addonsText += `- Pad/Cushion: ${quote.addons.pad.name} (${quote.addons.pad.rolls} rolls)\n`;
          }
          if (quote.addons?.customList?.items) {
              quote.addons.customList.items.forEach(item => {
                  addonsText += `- ${item.name}: ${item.qty}\n`;
              });
          } else if (quote.addons?.trims?.details) {
              // Legacy support
              const trims = quote.addons.trims.details;
              if (trims.standard > 0) addonsText += `- Standard Transitions: ${trims.standard}\n`;
              if (trims.stairnose > 0) addonsText += `- Stair Noses: ${trims.stairnose}\n`;
              if (trims.quarterRound > 0) addonsText += `- Quarter Round: ${trims.quarterRound}\n`;
          }
      }

      const subject = encodeURIComponent(`PO / Quote Request: ${quote.clientName} - ${quote.projectName || 'Project'}`);
      const bodyText = `Hello Floors 55 Team,

I would like to request a formal wholesale quote / submit a PO for the following proposal:

Project Details:
- Client Name: ${quote.clientName}
- Project: ${quote.projectName || 'N/A'}
- Product: ${quote.productName} (${quote.colorSku ? quote.colorSku + ' - ' : ''}${quote.colorName})
- Required Material: ${quote.material?.qty} ${quote.material?.unit} (${quote.measurements?.coverageSqft?.toFixed(1)} sqft)
${addonsText}
[If you are submitting a formal Purchase Order, please attach the PDF to this email.]

Thank you!`;
      
      const body = encodeURIComponent(bodyText);
      window.location.href = `mailto:admin@floors55pro.com?subject=${subject}&body=${body}`;
  };

  const confirmDelete = async () => {
      if (!quoteToDelete || !db) return;
      try {
          await deleteDoc(doc(db, "artifacts", appId, "public", "data", "pro_quotes", quoteToDelete.id));
          setQuotes(quotes.filter(q => q.id !== quoteToDelete.id));
          triggerToast("Proposal Deleted");
      } catch (error) {
          console.error("Error deleting quote:", error);
          alert("Failed to delete quote.");
      }
      setQuoteToDelete(null);
  };

  const handleEditClick = async (quote) => {
      try {
          const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', quote.productId);
          const prodSnap = await getDoc(prodRef);
          if(prodSnap.exists()) {
              setEditingProduct({ id: prodSnap.id, ...prodSnap.data() });
          }
      } catch(e) {
          console.error("Error fetching product for edit calculations", e);
      }

      setEditClientName(quote.clientName || '');
      setEditProjectName(quote.projectName || '');
      setCalcNetSqft(quote.measurements?.netSqft || '');
      setCalcWaste(quote.measurements?.waste || '1.10');
      
      if(quote.addons?.pad) {
          const matchingPad = availablePads.find(p => p.name === quote.addons.pad.name);
          if (matchingPad) {
              setPadSelection(matchingPad.id);
          } else {
              setPadSelection('custom_legacy');
          }
          
          if (quote.addons.pad.costPerSqft !== undefined) {
              setPadCost(quote.addons.pad.costPerSqft.toFixed(2));
          } else if (quote.addons.pad.rolls && quote.addons.pad.rollSqft) {
              setPadCost((quote.addons.pad.cost / (quote.addons.pad.rolls * quote.addons.pad.rollSqft)).toFixed(2));
          } else if (quote.material?.qty > 0) {
              const perYdCost = quote.addons.pad.cost / quote.material.qty;
              setPadCost((perYdCost / 9).toFixed(2));
          }
      } else {
          setPadSelection('none');
          setPadCost('0.00');
      }

      // Convert legacy trims or load new custom list
      let initialAddons = [];
      if (quote.addons?.customList && quote.addons.customList.items) {
          initialAddons = quote.addons.customList.items;
      } else if (quote.addons?.trims && quote.addons.trims.details) {
          if (quote.addons.trims.details.standard > 0) initialAddons.push({ name: 'Standard Transitions', qty: quote.addons.trims.details.standard, cost: 25.00 });
          if (quote.addons.trims.details.stairnose > 0) initialAddons.push({ name: 'Stair Noses', qty: quote.addons.trims.details.stairnose, cost: 45.00 });
          if (quote.addons.trims.details.quarterRound > 0) initialAddons.push({ name: 'Quarter Round', qty: quote.addons.trims.details.quarterRound, cost: 10.00 });
      }
      setSelectedAddons(initialAddons);

      setLaborPrep(quote.services?.prep || '');
      setLaborInstallPerSqft((quote.services?.installTotal / (quote.measurements?.netSqft || 1)) || '');
      setLaborDelivery(quote.services?.delivery || '');
      
      setCustomLabor1Name(quote.services?.custom1?.name || '');
      setCustomLabor1Cost(quote.services?.custom1?.cost || '');
      setCustomLabor2Name(quote.services?.custom2?.name || '');
      setCustomLabor2Cost(quote.services?.custom2?.cost || '');

      setBuilderMargin(quote.totals?.margin || 20);
      
      // Load their previously selected brand for this quote
      setEditProposalBrand(quote.brandOverride || (quote.useCustomBranding ? 'custom' : 'f55'));
      
      setEditingQuote(quote);
  };

  const isCarpet = editingProduct?.category === 'Carpet' || (editingProduct?.category || '').toLowerCase().includes('carpet');
  let cartonSqft = parseFloat(editingProduct?.cartonSize) || parseFloat(editingProduct?.boxSqft) || 20;
  const basePrice = editingProduct?.price || 0;
  
  const netSqftNum = parseFloat(calcNetSqft) || 0;
  const totalSqftWithWaste = netSqftNum * parseFloat(calcWaste);
  
  const requiredSqYd = Math.ceil(totalSqftWithWaste / 9);
  const requiredCartons = Math.ceil(totalSqftWithWaste / cartonSqft);
  const finalMaterialQty = isCarpet ? requiredSqYd : requiredCartons;
  const finalMaterialUnit = isCarpet ? 'sqyd' : 'cartons';
  const finalMaterialCoverageSqft = isCarpet ? (requiredSqYd * 9) : (requiredCartons * cartonSqft);
  
  const totalMaterialCost = isCarpet ? (requiredSqYd * (basePrice * (editingProduct?.unit === 'sqyd' ? 1 : 9))) : (requiredCartons * cartonSqft * basePrice);
  
  let padRollSqft = 360; // Safe fallback
  let padName = '';
  if (padSelection === 'custom_legacy') {
       padName = editingQuote?.addons?.pad?.name || "Carpet Cushion";
       padRollSqft = editingQuote?.addons?.pad?.rollSqft || 360;
  } else if (padSelection !== 'none') {
      const pad = availablePads.find(p => p.id === padSelection);
      if (pad) {
          const cSize = parseFloat(pad.cartonSize) || parseFloat(pad.boxSqft);
          if (cSize > 0) padRollSqft = pad.unit === 'sqyd' ? cSize * 9 : cSize;
          padName = pad.name;
      }
  }

  const requiredPadRolls = Math.ceil(totalSqftWithWaste / padRollSqft);
  const totalPadCost = isCarpet && padSelection !== 'none' 
      ? (requiredPadRolls * padRollSqft * (parseFloat(padCost) || 0)) 
      : 0;

  // New Dynamic Addons Cost
  const totalAddonsCost = selectedAddons.reduce((sum, item) => sum + ((parseFloat(item.cost) || 0) * (parseInt(item.qty) || 0)), 0);

  const totalLaborCost = (parseFloat(laborPrep) || 0) + (netSqftNum * (parseFloat(laborInstallPerSqft) || 0)) + (parseFloat(laborDelivery) || 0) + (parseFloat(customLabor1Cost) || 0) + (parseFloat(customLabor2Cost) || 0);

  const totalWholesaleProjectCost = totalMaterialCost + totalPadCost + totalAddonsCost + totalLaborCost;
  const turnkeyRetailPrice = totalWholesaleProjectCost * (1 + (builderMargin / 100));
  
  const currentMarginVal = builderMargin > 0 ? ((builderMargin / (100 + builderMargin)) * 100).toFixed(1) : 0;

  useEffect(() => {
      if (padSelection === 'none') {
          setPadCost('0.00');
      } else if (padSelection !== 'custom_legacy') {
          const pad = availablePads.find(p => p.id === padSelection);
          if (pad) {
              const pricePerSqft = pad.unit === 'sqyd' ? ((pad.price || 0) / 9) : (pad.price || 0);
              setPadCost(pricePerSqft.toFixed(2));
          }
      }
  }, [padSelection, availablePads]);

  const handleSaveEdit = async () => {
      if (!editClientName.trim() || netSqftNum === 0) return;
      setIsSaving(true);

      const updatedQuote = {
          clientName: editClientName,
          projectName: editProjectName || 'Flooring Project',
          brandOverride: editProposalBrand, 
          useCustomBranding: editProposalBrand === 'custom',
          measurements: { waste: parseFloat(calcWaste), netSqft: netSqftNum, coverageSqft: finalMaterialCoverageSqft },
          material: { qty: finalMaterialQty, unit: finalMaterialUnit, wholesaleTotal: totalMaterialCost },
          addons: {
              pad: padName ? { 
                  name: padName, 
                  cost: totalPadCost,
                  rolls: requiredPadRolls,
                  rollSqft: padRollSqft,
                  costPerSqft: parseFloat(padCost) || 0 
              } : null,
              customList: selectedAddons.length > 0 ? { cost: totalAddonsCost, items: selectedAddons } : null
          },
          services: {
              prep: parseFloat(laborPrep) || 0,
              installTotal: netSqftNum * (parseFloat(laborInstallPerSqft) || 0),
              delivery: parseFloat(laborDelivery) || 0,
              custom1: (customLabor1Name && parseFloat(customLabor1Cost) > 0) ? { name: customLabor1Name, cost: parseFloat(customLabor1Cost) } : null,
              custom2: (customLabor2Name && parseFloat(customLabor2Cost) > 0) ? { name: customLabor2Name, cost: parseFloat(customLabor2Cost) } : null
          },
          totals: { wholesale: totalWholesaleProjectCost, margin: builderMargin, turnkeyRetail: turnkeyRetailPrice }
      };

      try {
          await updateDoc(doc(db, "artifacts", appId, "public", "data", "pro_quotes", editingQuote.id), updatedQuote);
          setQuotes(quotes.map(q => q.id === editingQuote.id ? { ...q, ...updatedQuote } : q));
          triggerToast("Proposal Updated!");
          setEditingQuote(null);
          setEditingProduct(null);
      } catch (err) {
          console.error("Error updating quote", err);
          alert("Failed to update proposal.");
      } finally {
          setIsSaving(false);
      }
  };

  const categoryAddons = globalAddons && editingProduct?.category ? (globalAddons[editingProduct.category] || globalAddons['Default'] || []) : [];

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-black"></div>
      
      <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black uppercase tracking-tight">Active Proposals</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">Manage your quotes and submit formal Purchase Orders to the warehouse.</p>

      {isLoading ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>
      ) : quotes.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-6 bg-gray-50 rounded-xl border border-gray-100">No proposals generated yet. Find a product in the catalog and click "Build Custom Proposal".</p>
      ) : (
          <div className="space-y-4">
              {quotes.map(quote => {
                  const markupVal = quote.totals?.margin || 20;
                  const marginVal = markupVal > 0 ? ((markupVal / (100 + markupVal)) * 100).toFixed(1) : 0;
                  
                  return (
                  <div key={quote.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all gap-4 group">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 text-lg">{quote.clientName}</h3>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-200 px-2 py-0.5 rounded-full">{new Date(quote.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                              <p className="text-xs font-bold text-gray-500">{quote.projectName || 'Flooring Project'} &bull; {quote.productName} ({quote.colorName})</p>
                              <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-black text-gray-900 font-mono">${quote.totals?.turnkeyRetail?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</span>
                                  <span className="text-[10px] text-gold font-black uppercase tracking-widest border border-gold/30 bg-gold/10 px-1.5 py-0.5 rounded">{markupVal}% Markup ({marginVal}% Margin)</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/proposal/${quote.id}`} target="_blank" className="flex-1 md:flex-none bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-center shadow-sm" style={{ textDecoration: 'none' }}>
                            Preview
                        </Link>
                        <button onClick={() => copyToClipboard(quote)} className="flex-1 md:flex-none bg-black hover:bg-gold hover:text-black text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-center outline-none cursor-pointer shadow-md">
                            Copy Link
                        </button>
                        
                        <div className="h-6 w-px bg-gray-200 hidden md:block mx-1"></div>
                        
                        <button onClick={() => handleOrderRequest(quote)} className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none shadow-sm" title="Email PO / Request Formal Quote">
                            📤 Order
                        </button>
                        <button onClick={() => setViewingCostsQuote(quote)} className="bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-600 px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none shadow-sm" title="Internal Cost Breakdown">
                            💲
                        </button>
                        <button onClick={() => handleEditClick(quote)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none shadow-sm" title="Edit Proposal">
                            ✏️
                        </button>
                        <button onClick={() => setQuoteToDelete(quote)} className="bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none shadow-sm" title="Delete Proposal">
                            🗑️
                        </button>
                      </div>
                  </div>
              )})}
          </div>
      )}

      {/* COST BREAKDOWN OVERLAY */}
      {viewingCostsQuote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setViewingCostsQuote(null)}></div>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0">
                      <div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Cost Breakdown</h3>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{viewingCostsQuote.clientName} &bull; {viewingCostsQuote.productName}</p>
                      </div>
                      <button onClick={() => setViewingCostsQuote(null)} className="text-gray-400 hover:text-black text-2xl font-bold bg-transparent border-none cursor-pointer outline-none">✕</button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-6">
                      {/* Material & Addons */}
                      <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 border-b border-gray-100 pb-1">Materials & Add-Ons</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex justify-between items-start gap-4">
                                  <span>
                                      {viewingCostsQuote.productName} 
                                      <br/>
                                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                                          ({viewingCostsQuote.material?.qty} {viewingCostsQuote.material?.unit} &bull; {viewingCostsQuote.measurements?.coverageSqft?.toFixed(1)} sqft)
                                      </span>
                                  </span>
                                  <span className="font-mono font-bold">${viewingCostsQuote.material?.wholesaleTotal?.toFixed(2) || '0.00'}</span>
                              </div>
                              
                              {viewingCostsQuote.addons?.pad && (
                                  <div className="flex justify-between items-start gap-4">
                                      <span>Pad: {viewingCostsQuote.addons.pad.name}
                                          {viewingCostsQuote.addons.pad.rolls && <br/>}
                                          {viewingCostsQuote.addons.pad.rolls && <span className="text-[10px] text-gray-400 uppercase tracking-widest">({viewingCostsQuote.addons.pad.rolls} rolls &bull; {viewingCostsQuote.addons.pad.rollSqft} sqft/roll)</span>}
                                      </span>
                                      <span className="font-mono font-bold">${viewingCostsQuote.addons.pad.cost?.toFixed(2) || '0.00'}</span>
                                  </div>
                              )}
                              
                              {viewingCostsQuote.addons?.customList?.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-start gap-4">
                                      <span>{item.name} <span className="text-[10px] text-gray-400 uppercase tracking-widest">({item.qty} qty)</span></span>
                                      <span className="font-mono font-bold">${(item.cost * item.qty).toFixed(2)}</span>
                                  </div>
                              ))}
                              
                              {/* Legacy Support for old trims */}
                              {!viewingCostsQuote.addons?.customList && viewingCostsQuote.addons?.trims && (
                                  <div className="flex justify-between items-start gap-4">
                                      <span>Transitions & Trims</span>
                                      <span className="font-mono font-bold">${viewingCostsQuote.addons.trims.cost?.toFixed(2) || '0.00'}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Labor */}
                      <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 border-b border-gray-100 pb-1">Labor & Services</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex justify-between items-start gap-4">
                                  <span>Installation <br/><span className="text-[10px] text-gray-400 uppercase tracking-widest">({viewingCostsQuote.measurements?.netSqft} net sqft)</span></span>
                                  <span className="font-mono font-bold">${viewingCostsQuote.services?.installTotal?.toFixed(2) || '0.00'}</span>
                              </div>
                              {viewingCostsQuote.services?.prep > 0 && (
                                  <div className="flex justify-between items-start gap-4">
                                      <span>Tear Out & Prep</span>
                                      <span className="font-mono font-bold">${viewingCostsQuote.services.prep.toFixed(2)}</span>
                                  </div>
                              )}
                              {viewingCostsQuote.services?.delivery > 0 && (
                                  <div className="flex justify-between items-start gap-4">
                                      <span>Fuel & Delivery</span>
                                      <span className="font-mono font-bold">${viewingCostsQuote.services.delivery.toFixed(2)}</span>
                                  </div>
                              )}
                              {viewingCostsQuote.services?.custom1 && (
                                  <div className="flex justify-between items-start gap-4">
                                      <span>{viewingCostsQuote.services.custom1.name}</span>
                                      <span className="font-mono font-bold">${viewingCostsQuote.services.custom1.cost.toFixed(2)}</span>
                                  </div>
                              )}
                              {viewingCostsQuote.services?.custom2 && (
                                  <div className="flex justify-between items-start gap-4">
                                      <span>{viewingCostsQuote.services.custom2.name}</span>
                                      <span className="font-mono font-bold">${viewingCostsQuote.services.custom2.cost.toFixed(2)}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="bg-gray-900 text-white p-6 sticky bottom-0">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Base Cost</span>
                          <span className="text-lg font-mono font-bold">${viewingCostsQuote.totals?.wholesale?.toFixed(2) || '0.00'}</span>
                      </div>
                      
                      {(() => {
                          const mkVal = viewingCostsQuote.totals?.margin || 0;
                          const mgVal = mkVal > 0 ? ((mkVal / (100 + mkVal)) * 100).toFixed(1) : 0;
                          return (
                              <div className="flex justify-between items-center mb-4">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Markup & Margin</span>
                                  <span className="text-sm font-mono font-bold text-gold">{mkVal}% Markup &bull; {mgVal}% Margin</span>
                              </div>
                          );
                      })()}
                      
                      <div className="pt-4 border-t border-gray-700 flex justify-between items-end">
                          <div>
                              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Gross Profit</div>
                              <div className="text-xl font-black font-mono text-emerald-400">${((viewingCostsQuote.totals?.turnkeyRetail || 0) - (viewingCostsQuote.totals?.wholesale || 0)).toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Turnkey Price</div>
                              <div className="text-2xl font-black text-white font-mono">${viewingCostsQuote.totals?.turnkeyRetail?.toFixed(2) || '0.00'}</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* DELETE WARNING OVERLAY */}
      {quoteToDelete && (
          <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 transition-opacity">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🗑️</div>
                  <h3 className="text-lg font-bold text-gray-950">Delete Proposal?</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">Are you sure you want to permanently delete this quote for {quoteToDelete.clientName}?</p>
                  <div className="flex gap-3 mt-6">
                      <button onClick={() => setQuoteToDelete(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-200 cursor-pointer outline-none">Cancel</button>
                      <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-700 cursor-pointer outline-none">Confirm Delete</button>
                  </div>
              </div>
          </div>
      )}

      {/* EDIT PROPOSAL OVERLAY */}
      {editingQuote && editingProduct && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => { setEditingQuote(null); setEditingProduct(null); }}></div>
              <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl relative z-10 animate-in slide-in-from-right flex flex-col">
                  
                  <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-20">
                      <div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Edit Proposal</h3>
                          <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{editingQuote.productName} ({editingQuote.colorName})</p>
                      </div>
                      <button onClick={() => { setEditingQuote(null); setEditingProduct(null); }} className="text-gray-400 hover:text-black text-2xl font-bold bg-transparent border-none cursor-pointer outline-none p-2">✕</button>
                  </div>

                  <div className="p-6 space-y-8 flex-1">
                      {/* PROPOSAL DETAILS */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Proposal Details</h4>
                          <div className="space-y-3">
                              <div>
                                  <input type="text" placeholder="Client Name *" value={editClientName} onChange={e => setEditClientName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                              </div>
                              <div>
                                  <input type="text" placeholder="Project / Room" value={editProjectName} onChange={e => setEditProjectName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                              </div>
                          </div>
                      </div>
                      
                      {/* STEP 1: MEASUREMENTS */}
                      <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><span>1</span> Measurements</h4>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Net Square Footage</label>
                                  <input type="number" value={calcNetSqft} onChange={e => setCalcNetSqft(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-gray-50" />
                              </div>
                              <div>
                                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Waste Factor</label>
                                  <select value={calcWaste} onChange={e => setCalcWaste(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-gray-50">
                                      <option value="1.00">Exact Net (0%)</option>
                                      <option value="1.05">Standard (5%)</option>
                                      <option value="1.10">Safe (10%)</option>
                                      <option value="1.15">Complex (15%)</option>
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
                          {isCarpet && (
                              <div className="space-y-3 mb-4">
                                  <div>
                                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Select Carpet Cushion</label>
                                      <select value={padSelection} onChange={e => setPadSelection(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white cursor-pointer">
                                          <option value="none">No Pad Included</option>
                                          {availablePads.map(pad => {
                                              const padP_sqft = pad.unit === 'sqyd' ? ((pad.price || 0) / 9) : (pad.price || 0);
                                              const padP_sqyd = pad.unit === 'sqyd' ? (pad.price || 0) : ((pad.price || 0) * 9);
                                              const rollSqft = pad.unit === 'sqyd' ? ((parseFloat(pad.cartonSize) || 40) * 9) : (parseFloat(pad.cartonSize) || 360);
                                              return (
                                                  <option key={pad.id} value={pad.id}>
                                                      {pad.name} (${padP_sqft.toFixed(2)}/sf or ${padP_sqyd.toFixed(2)}/sy) - Roll: {rollSqft} sf
                                                  </option>
                                              );
                                          })}
                                          {padSelection === 'custom_legacy' && <option value="custom_legacy">{editingQuote?.addons?.pad?.name || 'Legacy Pad'}</option>}
                                      </select>
                                  </div>
                                  {padSelection !== 'none' && (
                                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                          <div className="flex items-center gap-2 mb-1">
                                              <label className="block text-[10px] font-bold uppercase text-gray-500 flex-1">Your Cost per sqft ($)</label>
                                              <input type="number" step="0.01" value={padCost} onChange={e => setPadCost(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm text-right bg-white" />
                                          </div>
                                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider text-right mb-2">
                                              (${(parseFloat(padCost || 0) * 9).toFixed(2)} / sqyd)
                                          </div>
                                          <div className="text-[10px] text-gray-500 text-right mt-2 pt-2 border-t border-gray-200">
                                              Requires <span className="font-bold text-gray-900">{requiredPadRolls} roll(s)</span> ({requiredPadRolls * padRollSqft} sqft) = <span className="text-gold font-bold">${totalPadCost.toFixed(2)}</span>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )}
                          
                          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                              {selectedAddons.map((addon, index) => (
                                  <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-white p-2 rounded border border-gray-200">
                                      <input type="text" value={addon.name} onChange={e => {
                                          const newAddons = [...selectedAddons];
                                          newAddons[index].name = e.target.value;
                                          setSelectedAddons(newAddons);
                                      }} className="w-full p-1 text-xs outline-none focus:border-gold border border-transparent focus:border-gray-200 rounded" placeholder="Accessory Name" />
                                      <input type="number" value={addon.qty} onChange={e => {
                                          const newAddons = [...selectedAddons];
                                          newAddons[index].qty = parseInt(e.target.value) || 0;
                                          setSelectedAddons(newAddons);
                                      }} className="w-12 p-1 text-xs border border-gray-200 rounded text-center outline-none focus:border-gold" min="1" placeholder="Qty" />
                                      <div className="flex items-center gap-1 text-xs text-gray-400">
                                          $<input type="number" value={addon.cost} onChange={e => {
                                              const newAddons = [...selectedAddons];
                                              newAddons[index].cost = parseFloat(e.target.value) || 0;
                                              setSelectedAddons(newAddons);
                                          }} className="w-14 p-1 text-xs border border-gray-200 rounded text-right outline-none focus:border-gold" step="0.01" />
                                      </div>
                                      <button onClick={() => {
                                          setSelectedAddons(selectedAddons.filter((_, i) => i !== index));
                                      }} className="text-red-400 hover:text-red-600 font-black px-2 outline-none cursor-pointer">✕</button>
                                  </div>
                              ))}

                              <select onChange={(e) => {
                                  if (e.target.value) {
                                      if (e.target.value === 'custom') {
                                          setSelectedAddons([...selectedAddons, { name: 'Custom Accessory', cost: 0.00, qty: 1 }]);
                                      } else {
                                          const selected = categoryAddons.find(a => a.name === e.target.value);
                                          if (selected) {
                                              const resolvedCost = selected.cost !== undefined ? selected.cost : (selected.defaultCost || 0);
                                              setSelectedAddons([...selectedAddons, { ...selected, cost: resolvedCost, qty: 1 }]);
                                          }
                                      }
                                      e.target.value = '';
                                  }
                              }} className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none focus:border-gold cursor-pointer bg-white">
                                  <option value="">+ Add Accessory / Trim...</option>
                                  {categoryAddons.map(a => {
                                      const resolvedCost = a.cost !== undefined ? a.cost : (a.defaultCost || 0);
                                      return <option key={a.name} value={a.name}>{a.name} (${parseFloat(resolvedCost).toFixed(2)})</option>
                                  })}
                                  <option value="custom">Create Custom Accessory...</option>
                              </select>
                          </div>
                      </div>

                      {/* STEP 3: LABOR */}
                      <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><span>3</span> Labor & Logistics (Your Cost)</h4>
                          <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Basic Install <span className="text-[10px] text-gray-400 font-normal ml-1">/ sqft</span></label>
                                  <input type="number" value={laborInstallPerSqft} onChange={e => setLaborInstallPerSqft(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                              </div>
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Tear Out & Prep <span className="text-[10px] text-gray-400 font-normal ml-1">Lump Sum</span></label>
                                  <input type="number" value={laborPrep} onChange={e => setLaborPrep(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                              </div>
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-700">Fuel & Delivery <span className="text-[10px] text-gray-400 font-normal ml-1">Lump Sum</span></label>
                                  <input type="number" value={laborDelivery} onChange={e => setLaborDelivery(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                              </div>

                              <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Additional Custom Labor</p>
                                  <div className="flex gap-2">
                                      <input type="text" placeholder="e.g. Stair Labor" value={customLabor1Name} onChange={e => setCustomLabor1Name(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gold bg-white" />
                                      <input type="number" placeholder="$ 0.00" value={customLabor1Cost} onChange={e => setCustomLabor1Cost(e.target.value)} className="w-20 p-2 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-gold bg-gray-50" />
                                  </div>
                                  <div className="flex gap-2">
                                      <input type="text" placeholder="e.g. Moving Appliances" value={customLabor2Name} onChange={e => setCustomLabor2Name(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gold bg-white" />
                                      <input type="number" placeholder="$ 0.00" value={customLabor2Cost} onChange={e => setCustomLabor2Cost(e.target.value)} className="w-20 p-2 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-gold bg-gray-50" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* STEP 4: FOOTER & SAVE */}
                  <div className="bg-gray-900 text-white p-6 sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Base Cost</div>
                              <div className="text-lg font-mono text-gray-200">${totalWholesaleProjectCost.toFixed(2)}</div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                              <div className="text-[10px] text-gold font-bold uppercase tracking-widest mb-1 flex flex-col items-end">
                                  <span>Markup: {builderMargin}%</span>
                                  <span className="text-[9px] text-gray-400 capitalize">Yields Margin: {currentMarginVal}%</span>
                              </div>
                              <div className="text-2xl font-black text-white font-mono">${turnkeyRetailPrice.toFixed(2)}</div>
                              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Gross Profit: ${(turnkeyRetailPrice - totalWholesaleProjectCost).toFixed(2)}</div>
                          </div>
                      </div>
                      
                      <input type="range" min="0" max="100" step="1" value={builderMargin} onChange={e => setBuilderMargin(Number(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold mb-6" />

                      <div className="mb-6">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Presentation Branding</label>
                          <select 
                              value={editProposalBrand} 
                              onChange={e => setEditProposalBrand(e.target.value)} 
                              className="w-full p-3 border border-gray-700 rounded-xl text-sm font-bold bg-gray-800 text-white focus:border-gold outline-none cursor-pointer"
                          >
                              {!isStaff && <option value="custom">My White-Label Brand</option>}
                              <option value="f55">Floors 55 Pro</option>
                              {isStaff && <option value="abbey">Abbey Carpet & Floor</option>}
                          </select>
                      </div>

                      <div className="space-y-3">
                          <button onClick={handleSaveEdit} disabled={isSaving || netSqftNum === 0 || !editClientName.trim()} className="w-full bg-gold text-black hover:bg-white font-black uppercase tracking-widest py-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer outline-none">
                              {isSaving ? "Saving..." : "Update Turnkey Proposal"}
                          </button>
                          {(!editClientName.trim() || netSqftNum === 0) && (
                              <div className="text-[10px] text-red-400 text-center uppercase tracking-widest font-bold">Client Name & SqFt Required</div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Toast Notifier */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <span className="font-black text-gold">✓</span>
          <p className="font-bold text-xs uppercase tracking-widest m-0">{toastMsg}</p>
      </div>
    </div>
  );
}