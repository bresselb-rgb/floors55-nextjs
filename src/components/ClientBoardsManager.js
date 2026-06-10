"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, appId } from "../lib/firebase";

export default function ClientBoardsManager({ proId, currentMargin = 20, businessName = "Premium Flooring Portal" }) {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  useEffect(() => {
    if (!proId) return;
    const fetchBoards = async () => {
      try {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'client_boards'), where("proId", "==", proId));
        const querySnapshot = await getDocs(q);
        const boardsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort by newest first
        boardsData.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
        setBoards(boardsData);
      } catch (err) {
        console.error("Error fetching boards:", err);
      }
    };
    fetchBoards();
  }, [proId]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setIsCreating(true);

    // Generate a short, clean URL slug (e.g., smith-kitchen-a7b2)
    const randomString = Math.random().toString(36).substring(2, 6);
    const slug = `${newBoardName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomString}`;

    const newBoard = {
      proId: proId,
      name: newBoardName,
      slug: slug,
      products: [], // Starts empty!
      margin: currentMargin, // Snapshot the slider right now!
      businessName: businessName, // Snapshot the business name right now!
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'client_boards'), newBoard);
      setBoards([{ id: docRef.id, ...newBoard }, ...boards]);
      setNewBoardName("");
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (slug) => {
    const url = `${window.location.origin}/client/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDeleteBoard = async (boardId, boardName) => {
    if (window.confirm(`Are you sure you want to delete the board "${boardName}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'client_boards', boardId));
        setBoards(boards.filter(b => b.id !== boardId));
      } catch (err) {
        console.error("Error deleting board:", err);
        alert("Failed to delete board.");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-black"></div>
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <span className="text-gold">📁</span> My Client Boards
      </h3>
      <p className="text-xs text-gray-500 mb-6">Create custom, curated product lists to share directly with your homeowners.</p>
      
      <form onSubmit={handleCreateBoard} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="e.g. Smith Kitchen Remodel"
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gold transition-colors"
          required
        />
        <button 
          type="submit" 
          disabled={isCreating}
          className="bg-black text-white px-6 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors disabled:opacity-50 shrink-0"
        >
          {isCreating ? "Creating..." : "Create Board"}
        </button>
      </form>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {boards.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-gray-100">No client boards created yet.</div>
        ) : (
          boards.map((board) => (
            <div key={board.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm transition-all gap-4">
              <div>
                <h4 className="font-bold text-gray-900 text-sm leading-tight">{board.name}</h4>
                <p className="text-xs text-gold font-bold mt-0.5">
                  {board.products?.length || 0} Products Saved
                </p>
                {/* Visual indicator of the locked margin for the Pro */}
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-black">
                  Locked Margin: +{board.margin !== undefined ? board.margin : 20}%
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button 
                  onClick={() => copyToClipboard(board.slug)}
                  className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 hover:border-gold px-3 py-1.5 rounded transition-colors text-center"
                >
                  {copiedSlug === board.slug ? "✓ Copied Link!" : "🔗 Copy Share Link"}
                </button>
                <button
                  onClick={() => handleDeleteBoard(board.id, board.name)}
                  className="text-gray-400 hover:text-red-600 p-1.5 border border-transparent hover:border-red-200 hover:bg-red-50 rounded transition-all outline-none cursor-pointer shrink-0 flex items-center justify-center"
                  title="Delete Board"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}