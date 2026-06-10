"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db, appId } from "../lib/firebase";

export default function ClientBoardsManager({ proId }) {
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
              </div>
              <div className="flex flex-col items-start sm:items-end w-full sm:w-auto shrink-0">
                <button 
                  onClick={() => copyToClipboard(board.slug)}
                  className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 hover:border-gold px-3 py-1.5 rounded transition-colors w-full sm:w-auto text-center"
                >
                  {copiedSlug === board.slug ? "✓ Copied Link!" : "🔗 Copy Share Link"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}