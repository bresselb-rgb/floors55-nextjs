"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, appId } from "../lib/firebase";

export default function ClientBoardsManager({ proId }) {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  const [showToast, setShowToast] = useState(false);

  // Load the Pro's existing boards
  useEffect(() => {
    if (!proId || !db) return;
    const fetchBoards = async () => {
      try {
          const q = query(collection(db, "artifacts", appId, "public", "data", "client_boards"), where("proId", "==", proId));
          const querySnapshot = await getDocs(q);
          const boardsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort newest first
          boardsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setBoards(boardsData);
      } catch (e) {
          console.error("Error fetching client boards:", e);
      }
    };
    fetchBoards();
  }, [proId]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim() || !db) return;
    setIsCreating(true);

    const randomString = Math.random().toString(36).substring(2, 6);
    const slug = `${newBoardName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomString}`;

    // Fetch the absolute latest margin AND branding directly from the database right now
    let lockedMargin = 20;
    let lockedBusiness = "Your Flooring Professional";
    let lockedLogo = "";
    let lockedBgColor = "#ffffff";
    let lockedTextColor = "#000000";

    try {
        const proRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', proId);
        const proSnap = await getDoc(proRef);
        if (proSnap.exists()) {
            const data = proSnap.data();
            if (data.clientMargin !== undefined) lockedMargin = Number(data.clientMargin);
            if (data.business) lockedBusiness = data.business;
            if (data.logoUrl) lockedLogo = data.logoUrl;
            if (data.brandBgColor) lockedBgColor = data.brandBgColor;
            if (data.brandTextColor) lockedTextColor = data.brandTextColor;
        }
    } catch(err) {
        console.error("Could not fetch pro profile for margin locking:", err);
    }

    const newBoard = {
      proId: proId,
      name: newBoardName,
      slug: slug,
      products: [],
      margin: lockedMargin, // Permanently snapshotted!
      businessName: lockedBusiness,
      logoUrl: lockedLogo,
      brandBgColor: lockedBgColor,
      brandTextColor: lockedTextColor,
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
      setTimeout(() => {
          setShowToast(false);
      }, 3000);
  };

  const copyToClipboard = (slug) => {
      const url = `${window.location.origin}/client/${slug}`;
      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(url).then(triggerToast).catch(err => {
              console.error('Failed to copy', err);
          });
      } else {
          const tempInput = document.createElement("input");
          tempInput.value = url;
          document.body.appendChild(tempInput);
          tempInput.select();
          try {
              document.execCommand("copy");
              triggerToast();
          } catch (err) {
              console.error('Fallback copy failed', err);
          }
          document.body.removeChild(tempInput);
      }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-black"></div>
      
      <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black uppercase tracking-tight">Client Presentations</h2>
          <button 
              onClick={() => setIsInfoOpen(true)}
              className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gold transition-colors flex items-center gap-1 bg-gray-50 hover:bg-gold/10 px-3 py-1.5 rounded-full border border-gray-200 outline-none cursor-pointer"
          >
              <span>❓</span> How to use
          </button>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">Create curated product boards to share with your clients.</p>
      
      {/* Create New Board Form */}
      <form onSubmit={handleCreateBoard} className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="e.g., Smith Kitchen Remodel"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm transition-colors"
          required
        />
        <button 
          type="submit" 
          disabled={isCreating}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isCreating ? "Creating..." : "+ New Board"}
        </button>
      </form>

      {}
      <div className="space-y-4">
        {boards.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-6 bg-gray-50 rounded-xl border border-gray-100">No client boards created yet.</p>
        ) : (
          boards.map((board) => {
            // Calculate Markup and Margin for display
            const markupVal = board.margin !== undefined ? Number(board.margin) : 0;
            const marginVal = markupVal > 0 ? Math.round((markupVal / (100 + markupVal)) * 100) : 0;

            return (
              <div key={board.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{board.name}</h3>
                  <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {board.products?.length || 0} Products
                      </p>
                      {board.margin !== undefined && (
                          <span className="text-[10px] font-black bg-gold/10 text-gold px-2 py-0.5 rounded uppercase tracking-widest border border-gold/20">
                              Locked @ {markupVal}% Markup / {marginVal}% Margin
                          </span>
                      )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyToClipboard(board.slug)} className="flex-1 md:flex-none bg-white border border-gray-200 hover:border-gold hover:text-gold text-black px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-center cursor-pointer outline-none">
                      Copy Link
                  </button>
                  <button onClick={() => handleDelete(board.id, board.name)} className="bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 px-3 py-2.5 rounded-lg transition-colors cursor-pointer outline-none" title="Delete Board">
                      🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <span className="font-black text-gold">✓</span>
          <p className="font-bold text-xs uppercase tracking-widest m-0">Link Copied</p>
      </div>

      {/* Info Modal / Instructions */}
      {isInfoOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
                <button 
                    onClick={() => setIsInfoOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors font-bold outline-none"
                >
                    ✕
                </button>
                
                <h3 className="text-2xl font-black mb-2 text-gray-900">How to Use Project Boards</h3>
                <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-100">
                    Create beautiful, white-labeled presentations curated specifically for your clients.
                </p>

                <div className="space-y-5">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black shrink-0">1</div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Customize Your Brand</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                Upload your company logo and pick your brand colors in the profile section so your presentations look extremely professional.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black shrink-0">2</div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Lock Your Pricing</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                Adjust your retail margin slider to the desired markup for this specific client. When you click "+ New Board", it permanently locks that price and your current branding into the board forever.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black shrink-0">3</div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Add Products from the Catalog</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                Navigate to any product in the catalog. At the top of the product page, click the black &quot;Save&quot; button to drop that specific colorway right into your client&apos;s board.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black shrink-0">4</div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Share the Link</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                Click &quot;Copy Link&quot; and text or email it to your client. They will see a beautifully branded, private showroom with your retail pricing!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={() => setIsInfoOpen(false)}
                        className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}