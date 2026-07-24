// src/components/ClientBoardsManager.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, getDoc, serverTimestamp, setDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { db, appId } from "../lib/firebase";

export default function ClientBoardsManager({ proId }) {
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [expandedBoardId, setExpandedBoardId] = useState(null);

  const handleRemoveProduct = async (boardId, productObj) => {
      if (!db) return;
      if (window.confirm(`Remove ${productObj.name} from this presentation?`)) {
          try {
              const boardRef = doc(db, "artifacts", appId, "public", "data", "client_boards", boardId);
              await updateDoc(boardRef, {
                  products: arrayRemove(productObj)
              });
              
              // Instantly update the UI without needing a page refresh
              setBoards(boards.map(b => {
                  if (b.id === boardId) {
                      return { ...b, products: (b.products || []).filter(p => p.addedAt !== productObj.addedAt) };
                  }
                  return b;
              }));
          } catch (error) {
              console.error("Error removing product:", error);
              alert("Failed to remove product.");
          }
      }
  };
  const [isCreating, setIsCreating] = useState(false);
  
  const [isStaff, setIsStaff] = useState(false);
  const [boardBrand, setBoardBrand] = useState('custom');
  
  const [boardMargin, setBoardMargin] = useState(20);
  const [proProfile, setProProfile] = useState(null);

  const [showToast, setShowToast] = useState(false);

  const ABBEY_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Fabbey-logo.png?alt=media";
  const F55_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Ff55-pros-logo.jpg?alt=media";

  useEffect(() => {
    if (!proId || !db) return;
    const fetchBoardsAndProfile = async () => {
      try {
          const staffSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'staff', proId));
          if (staffSnap.exists()) {
              setIsStaff(true);
              setBoardBrand('f55'); // Default staff to Floors 55
          }

          const proSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', proId));
          if (proSnap.exists()) {
              setProProfile(proSnap.data());
              if (proSnap.data().clientMargin !== undefined) {
                  setBoardMargin(Number(proSnap.data().clientMargin));
              }
          }

          const q = query(collection(db, "artifacts", appId, "public", "data", "client_boards"), where("proId", "==", proId));
          const querySnapshot = await getDocs(q);
          const boardsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          boardsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setBoards(boardsData);
      } catch (e) {
          console.error("Error fetching client boards:", e);
      }
    };
    fetchBoardsAndProfile();
  }, [proId]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim() || !db) return;
    setIsCreating(true);

    const randomString = Math.random().toString(36).substring(2, 6);
    const slug = `${newBoardName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomString}`;

    let lockedBusiness = "Your Flooring Professional";
    let lockedLogo = "";
    let lockedBgColor = "#ffffff";
    let lockedTextColor = "#000000";
    let brandIdentifier = "custom";

    try {
        if (boardBrand === 'abbey') {
            lockedBusiness = "Abbey Carpet & Floor";
            lockedLogo = ABBEY_LOGO_URL;
            brandIdentifier = "abbey";
        } else if (boardBrand === 'f55') {
            lockedBusiness = "Floors 55";
            lockedLogo = F55_LOGO_URL;
            brandIdentifier = "f55";
        } else if (boardBrand === 'private') {
            // If private label is selected, use the Pro's custom colors/logos but set the identifier to 'private'
            if (proProfile) {
                if (proProfile.business) lockedBusiness = proProfile.business;
                if (proProfile.logoUrl) lockedLogo = proProfile.logoUrl;
                if (proProfile.brandBgColor) lockedBgColor = proProfile.brandBgColor;
                if (proProfile.brandTextColor) lockedTextColor = proProfile.brandTextColor;
            }
            brandIdentifier = "private";
        } else if (proProfile) {
            if (proProfile.business) lockedBusiness = proProfile.business;
            if (proProfile.logoUrl) lockedLogo = proProfile.logoUrl;
            if (proProfile.brandBgColor) lockedBgColor = proProfile.brandBgColor;
            if (proProfile.brandTextColor) lockedTextColor = proProfile.brandTextColor;
            brandIdentifier = "custom";
        }
    } catch(err) {
        console.error("Could not fetch pro profile for branding lock:", err);
    }

    const newBoard = {
      proId: proId,
      name: newBoardName,
      slug: slug,
      products: [],
      margin: boardMargin, 
      businessName: lockedBusiness,
      logoUrl: lockedLogo,
      brandBgColor: lockedBgColor,
      brandTextColor: lockedTextColor,
      brandIdentifier: brandIdentifier,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "artifacts", appId, "public", "data", "client_boards"), newBoard);
      setBoards([{ id: docRef.id, ...newBoard }, ...boards]);
      setNewBoardName("");
    } catch (error) {
      console.error("Error creating new client board:", error);
      alert("Failed to create board. Please try again.");
    }
    setIsCreating(false);
  };

  const handleDelete = async (boardId, boardName) => {
      if (!db) return;
      if (window.confirm(`Are you sure you want to permanently delete the board "${boardName}"?`)) {
          try {
              await deleteDoc(doc(db, "artifacts", appId, "public", "data", "client_boards", boardId));
              setBoards(boards.filter(b => b.id !== boardId));
          } catch (error) {
              console.error("Error deleting client board:", error);
              alert("Failed to delete board.");
          }
      }
  };

  const triggerToast = () => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = async (board) => {
      const targetPath = `/client/${board.slug}`;
      const shortCode = Math.random().toString(36).substring(2, 8);
      let finalUrl = `${window.location.origin}/s/${shortCode}`;
      
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'short_links', shortCode), {
              target: targetPath,
              createdAt: new Date().toISOString()
          });
      } catch(err) {
          finalUrl = `${window.location.origin}${targetPath}`;
      }

      const plainText = `Project Presentation: ${board.name}\n${finalUrl}`;

      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(plainText).then(triggerToast).catch(err => console.error('Failed to copy', err));
      } else {
          const tempInput = document.createElement("textarea");
          tempInput.value = plainText;
          document.body.appendChild(tempInput);
          tempInput.select();
          try { document.execCommand("copy"); triggerToast(); } catch (err) { console.error('Fallback copy failed', err); }
          document.body.removeChild(tempInput);
      }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-black"></div>
      
      <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black uppercase tracking-tight">Client Presentations</h2>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">Create curated product boards to share with your clients.</p>
      
      <form onSubmit={handleCreateBoard} className="bg-gray-50 p-5 border border-gray-100 rounded-xl mb-8 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="e.g., Smith Kitchen Remodel"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm transition-colors bg-white"
              required
            />
            <select 
                value={boardBrand} 
                onChange={(e) => setBoardBrand(e.target.value)} 
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm bg-white text-gray-700 font-bold shrink-0"
            >
                {!isStaff && <option value="custom">My Brand</option>}
                <option value="f55">Floors 55 Pro</option>
                {isStaff && <option value="abbey">Abbey Carpet & Floor</option>}
                {isStaff && <option value="private">Private Label (Hide Brands)</option>}
            </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Locked Markup</label>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Yields <span className="text-black font-black">{boardMargin > 0 ? Math.round((boardMargin / (100 + boardMargin)) * 100) : 0}%</span> Gross Margin
                        </div>
                    </div>
                    <span className="text-lg font-black text-gold font-mono">{boardMargin}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="100" step="5" 
                    value={boardMargin} 
                    onChange={e => setBoardMargin(Number(e.target.value))} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
                />
            </div>
            <button 
              type="submit" 
              disabled={isCreating}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50 whitespace-nowrap w-full sm:w-auto mt-2 sm:mt-0 outline-none cursor-pointer"
            >
              {isCreating ? "Creating..." : "+ New Board"}
            </button>
        </div>
      </form>

      <div className="space-y-4">
        {boards.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-6 bg-gray-50 rounded-xl border border-gray-100">No client boards created yet.</p>
        ) : (
          boards.map((board) => {
            const markupVal = board.margin !== undefined ? Number(board.margin) : 0;
            const marginVal = markupVal > 0 ? Math.round((markupVal / (100 + markupVal)) * 100) : 0;

            let displayLogo = F55_LOGO_URL;
            let displayBrandName = "Floors 55 Pro";
            let brandBadgeClass = "bg-gray-100 text-gray-800 border border-gray-200";

            if (board.brandIdentifier === 'abbey' || board.businessName === "Abbey Carpet & Floor") {
                displayLogo = ABBEY_LOGO_URL;
                displayBrandName = "Abbey Carpet";
                brandBadgeClass = "bg-blue-50 text-blue-800 border border-blue-200";
            } else if (board.brandIdentifier === 'private') {
                displayLogo = null;
                displayBrandName = "Private Label";
                brandBadgeClass = "bg-purple-50 text-purple-800 border border-purple-200";
            } else if (board.brandIdentifier === 'custom' || (!board.brandIdentifier && board.logoUrl && board.logoUrl !== ABBEY_LOGO_URL && board.logoUrl !== F55_LOGO_URL)) {
                displayLogo = board.logoUrl || null;
                displayBrandName = board.businessName || "Custom Brand";
                brandBadgeClass = "bg-emerald-50 text-emerald-800 border border-emerald-200";
            }

            return (
              <div key={board.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Dynamic Logo Thumbnail */}
                      {displayLogo ? (
                          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-1 shrink-0">
                              <img src={displayLogo} alt={displayBrandName} className="max-w-full max-h-full object-contain" />
                          </div>
                      ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Logo</span>
                          </div>
                      )}

                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{board.name}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white border border-gray-200 px-2 py-0.5 rounded">
                            {board.products?.length || 0} Products
                            </p>
                            {board.margin !== undefined && (
                                <span className="text-[10px] font-black bg-gold/10 text-gold px-2 py-0.5 rounded uppercase tracking-widest border border-gold/20">
                                    {markupVal}% Markup
                                </span>
                            )}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${brandBadgeClass}`}>
                                {displayBrandName}
                            </span>
                            {/* ADD PRODUCTS BUTTON */}
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    sessionStorage.setItem('active_curation_board_id', board.id);
                                    sessionStorage.setItem('active_curation_board_name', board.name);
                                    router.push('/category');
                                }}
                                className="text-[10px] font-black bg-black text-white px-3 py-0.5 rounded uppercase tracking-widest hover:bg-gold hover:text-black transition-colors border-none cursor-pointer outline-none"
                            >
                                + Add Products
                            </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => copyToClipboard(board)} className="flex-1 md:flex-none bg-white border border-gray-200 hover:border-gold hover:text-gold text-black px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-center cursor-pointer outline-none">
                          Copy Link
                      </button>
                      <button onClick={() => setExpandedBoardId(expandedBoardId === board.id ? null : board.id)} className="bg-white border border-gray-200 text-gray-600 hover:border-gold hover:text-gold px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none text-xs font-bold uppercase tracking-widest">
                          {expandedBoardId === board.id ? 'Hide' : 'View'}
                      </button>
                      <button onClick={() => handleDelete(board.id, board.name)} className="bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none" title="Delete Board">
                          🗑️
                      </button>
                    </div>
                </div>

                {/* EXPANDED PRODUCTS LIST */}
                {expandedBoardId === board.id && (
                    <div className="mt-5 pt-5 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Products on this Board</h4>
                        {(!board.products || board.products.length === 0) ? (
                            <p className="text-xs text-gray-400 italic bg-white p-4 rounded-lg border border-gray-100">No products have been added to this board yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {board.products.map((p, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-gold transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{p.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category} | Color: {p.colorName || p.colorSku}</p>
                                        </div>
                                        <button onClick={() => handleRemoveProduct(board.id, p)} className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest px-2 py-2 outline-none cursor-pointer shrink-0 border border-transparent hover:border-red-100 rounded bg-transparent hover:bg-red-50 transition-colors">
                                            ✕ Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <span className="font-black text-gold">✓</span>
          <p className="font-bold text-xs uppercase tracking-widest m-0">Link Copied</p>
      </div>
    </div>
  );
}