"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
// Correct path to the firebase lib from components directory
import { db, appId } from "../lib/firebase";

export default function ClientBoardsManager({ proId }) {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // House Account Logic
  const [isStaff, setIsStaff] = useState(false);
  const [boardBrand, setBoardBrand] = useState('custom');

  const [showToast, setShowToast] = useState(false);

  // Load the Pro's existing boards
  useEffect(() => {
    if (!proId || !db) return;
    const fetchBoards = async () => {
      try {
          // Check if user is staff to unlock Abbey branding
          const staffSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'staff', proId));
          if (staffSnap.exists()) setIsStaff(true);

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
        if (proSnap.exists() && proSnap.data().clientMargin !== undefined) {
            lockedMargin = Number(proSnap.data().clientMargin);
        }

        // Apply selected brand override
        if (boardBrand === 'abbey') {
            lockedBusiness = "Abbey Carpet & Floor";
            lockedBgColor = "#003366"; // Navy Blue
            lockedTextColor = "#ffffff";
        } else if (boardBrand === 'f55') {
            lockedBusiness = "Floors 55";
            lockedBgColor = "#000000";
            lockedTextColor = "#ffffff";
        } else if (proSnap.exists()) {
            const data = proSnap.data();
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

  const copyToClipboard = async (board) => {
      const targetPath = `/client/${board.slug}`;
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
      const plainText = `Project Presentation: ${board.name}\n${finalUrl}`;

      // Cross-browser clipboard logic
      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(plainText).then(triggerToast).catch(err => {
              console.error('Failed to copy', err);
          });
      } else {
          const tempInput = document.createElement("textarea");
          tempInput.value = plainText;
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
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-black"></div>
      
      <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black uppercase tracking-tight">Client Presentations</h2>
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
        <select 
            value={boardBrand} 
            onChange={(e) => setBoardBrand(e.target.value)} 
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm bg-white text-gray-700 font-bold"
        >
            <option value="custom">My Brand</option>
            <option value="f55">Floors 55</option>
            {isStaff && <option value="abbey">Abbey Carpet & Floor</option>}
        </select>
        <button 
          type="submit" 
          disabled={isCreating}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isCreating ? "Creating..." : "+ New Board"}
        </button>
      </form>

      {/* Boards List */}
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
                      {board.businessName === "Abbey Carpet & Floor" && (
                          <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase tracking-widest border border-blue-200">
                              Abbey Brand
                          </span>
                      )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyToClipboard(board)} className="flex-1 md:flex-none bg-white border border-gray-200 hover:border-gold hover:text-gold text-black px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-center cursor-pointer outline-none">
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

      {/* Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <span className="font-black text-gold">✓</span>
          <p className="font-bold text-xs uppercase tracking-widest m-0">Link Copied</p>
      </div>

    </div>
  );
}