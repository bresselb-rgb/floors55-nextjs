"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db, appId } from '../lib/firebase'; 

export default function FilterManager() {
    const [config, setConfig] = useState({});
    const [activeCategory, setActiveCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
    
    // NEW: Dynamic categories state
    const [availableCategories, setAvailableCategories] = useState([]);

    // Temp states for new inputs
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newOptionTexts, setNewOptionTexts] = useState({}); 

    useEffect(() => {
        loadConfig();
        loadDynamicCategories();
    }, []);

    // NEW: Fetch categories directly from your active inventory (Mirrors Header.js logic)
    const loadDynamicCategories = async () => {
        try {
            const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'));
            const cats = new Set();
            
            snap.forEach(d => {
                const data = d.data();
                if (data.isVisible !== false) {
                    let cat = (data.category || '').trim();
                    if (cat.toUpperCase() === 'LVP' || cat.toLowerCase() === 'luxury vinyl' || cat.toLowerCase() === 'luxury vinyl plank') {
                        cat = 'Luxury Vinyl (LVP)';
                    } else if (cat) {
                        cats.add(cat);
                    }
                }
            });

            // Format them for the dropdown options
            const formattedCats = [...cats].sort().map(catName => {
                let slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                if (catName === 'Luxury Vinyl (LVP)' || catName.toLowerCase().includes('vinyl')) {
                    slug = 'luxury-vinyl';
                }
                return { label: catName, slug: slug };
            });

            setAvailableCategories(formattedCats);
        } catch (error) {
            console.error("Error loading dynamic categories:", error);
        }
    };

    const loadConfig = async () => {
        setIsLoading(true);
        try {
            // Updated to the correct 6-segment database path
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'filterConfig');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setConfig(data);
                if (Object.keys(data).length > 0) {
                    setActiveCategory(Object.keys(data)[0]);
                }
            } else {
                setConfig({});
            }
        } catch (error) {
            console.error("Error loading config:", error);
            showStatus("Failed to load configuration.", "error");
        }
        setIsLoading(false);
    };

    const saveConfig = async () => {
        setIsSaving(true);
        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'filterConfig');
            await setDoc(docRef, config);
            showStatus("Filters saved successfully! Live site updated.", "success");
        } catch (error) {
            console.error("Error saving config:", error);
            showStatus("Error saving configuration.", "error");
        }
        setIsSaving(false);
    };

    const showStatus = (text, type) => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        if (config[newCategoryName]) {
            showStatus("Category already exists.", "error");
            return;
        }
        setConfig({ ...config, [newCategoryName]: [] });
        setActiveCategory(newCategoryName);
        setNewCategoryName('');
    };

    const handleAddFilterGroup = () => {
        if (!activeCategory) return;
        const updatedCategory = [...(config[activeCategory] || [])];
        updatedCategory.push({
            id: `filter_${Date.now()}`,
            label: 'New Filter',
            options: []
        });
        setConfig({ ...config, [activeCategory]: updatedCategory });
    };

    const updateFilterLabel = (index, newLabel) => {
        const updatedCategory = [...config[activeCategory]];
        updatedCategory[index].label = newLabel;
        updatedCategory[index].id = newLabel.toLowerCase().replace(/[^a-z0-9]+/g, ''); 
        setConfig({ ...config, [activeCategory]: updatedCategory });
    };

    const removeFilterGroup = (index) => {
        if (!confirm("Remove this entire filter group?")) return;
        const updatedCategory = [...config[activeCategory]];
        updatedCategory.splice(index, 1);
        setConfig({ ...config, [activeCategory]: updatedCategory });
    };

    const handleAddOption = (filterIndex) => {
        const optionText = newOptionTexts[filterIndex];
        if (!optionText || !optionText.trim()) return;

        const updatedCategory = [...config[activeCategory]];
        if (!updatedCategory[filterIndex].options) updatedCategory[filterIndex].options = [];
        
        if (!updatedCategory[filterIndex].options.includes(optionText.trim())) {
            updatedCategory[filterIndex].options.push(optionText.trim());
            setConfig({ ...config, [activeCategory]: updatedCategory });
        }
        
        setNewOptionTexts({ ...newOptionTexts, [filterIndex]: '' });
    };

    const removeOption = (filterIndex, optionIndex) => {
        const updatedCategory = [...config[activeCategory]];
        updatedCategory[filterIndex].options.splice(optionIndex, 1);
        setConfig({ ...config, [activeCategory]: updatedCategory });
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Filter Database...</div>;

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 min-h-[70vh] rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar: Categories */}
            <div className="w-full md:w-1/3 bg-white border-r border-gray-100 flex flex-col">
                <div className="bg-gray-900 p-6 text-white">
                    <h2 className="text-xl font-black tracking-tight mb-1">Filter Dashboard</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Sidebar Configuration</p>
                </div>
                
                {/* NEW: Fully Dynamic Dropdown Menu */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Select Category to Build</label>
                    <div className="flex gap-2">
                        <select 
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded text-xs focus:border-gold outline-none bg-white cursor-pointer"
                        >
                            <option value="">-- Choose Category --</option>
                            {availableCategories.map(cat => (
                                <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                            ))}
                        </select>
                        <button onClick={handleAddCategory} className="bg-black text-white px-4 py-2 rounded text-lg font-bold hover:bg-gold transition-colors flex items-center justify-center leading-none">+</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {Object.keys(config).map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === cat ? 'bg-gold text-black shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
                        >
                            {cat.replace(/-/g, ' ')}
                        </button>
                    ))}
                    {Object.keys(config).length === 0 && <div className="text-xs text-gray-400 italic text-center py-4">No categories created yet.</div>}
                </div>
            </div>

            {/* Main Area: Filter Builder */}
            <div className="w-full md:w-2/3 flex flex-col bg-gray-50 relative">
                
                {/* Status Bar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    {statusMsg.text && (
                        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${statusMsg.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {statusMsg.text}
                        </div>
                    )}
                </div>

                {/* Header Actions */}
                <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center sticky top-0 z-0">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                            {activeCategory ? activeCategory.replace(/-/g, ' ') : 'Select a Category'}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Filters</p>
                    </div>
                    <button 
                        onClick={saveConfig} 
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-md disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save & Publish Live'}
                    </button>
                </div>

                {/* Filter Groups List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeCategory && config[activeCategory]?.map((filter, fIndex) => (
                        <div key={fIndex} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Group Header */}
                            <div className="bg-gray-100 border-b border-gray-200 p-4 flex gap-4 items-center">
                                <span className="text-xl opacity-20">⚙️</span>
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        value={filter.label} 
                                        onChange={(e) => updateFilterLabel(fIndex, e.target.value)}
                                        className="bg-transparent font-black text-gray-900 uppercase tracking-widest text-sm outline-none border-b border-transparent focus:border-gold w-full px-1"
                                        placeholder="Filter Name (e.g. Wear Layer)"
                                    />
                                    <div className="text-[9px] text-gray-400 font-mono mt-1 px-1">ID: {filter.id}</div>
                                </div>
                                <button onClick={() => removeFilterGroup(fIndex)} className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase px-3 py-1 bg-white rounded border border-gray-200">Remove</button>
                            </div>

                            {/* Options Area */}
                            <div className="p-4">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {filter.options && filter.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3 pr-1 py-1 text-xs font-bold text-gray-700">
                                            {opt}
                                            <button onClick={() => removeOption(fIndex, oIndex)} className="bg-white hover:bg-red-50 text-red-400 hover:text-red-600 w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-sm text-[10px]">✕</button>
                                        </div>
                                    ))}
                                    {(!filter.options || filter.options.length === 0) && <span className="text-[10px] text-gray-400 italic">No options added yet.</span>}
                                </div>

                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Add option (e.g. 20 mil)"
                                        value={newOptionTexts[fIndex] || ''}
                                        onChange={(e) => setNewOptionTexts({ ...newOptionTexts, [fIndex]: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption(fIndex)}
                                        className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded bg-gray-50 focus:bg-white focus:border-gold outline-none"
                                    />
                                    <button onClick={() => handleAddOption(fIndex)} className="bg-gray-200 hover:bg-gold hover:text-black text-gray-700 font-bold px-4 py-2 rounded text-[10px] uppercase tracking-widest transition-colors">Add</button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Filter Button */}
                    {activeCategory && (
                        <button onClick={handleAddFilterGroup} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-gold hover:border-gold hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex flex-col items-center justify-center gap-1">
                            <span className="text-xl">+</span>
                            Add New Filter Block
                        </button>
                    )}
                    
                    {!activeCategory && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <span className="text-4xl mb-2">👈</span>
                            <span className="text-xs font-bold uppercase tracking-widest">Select or create a category</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}