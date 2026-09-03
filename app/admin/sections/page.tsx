"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface SectionItem {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count?: { products: number };
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form state
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sections");
      if (!res.ok) throw new Error("Failed to load sections");
      const data = await res.json();
      setSections(data.sections || []);
    } catch (err: any) {
      setError(err.message || "Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleNameChange = (val: string) => {
    setNewName(val);
    setNewSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          slug: newSlug.trim(),
          sortOrder: sections.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create section");

      setSuccess(`Section "${data.section.name}" created successfully`);
      setNewName("");
      setNewSlug("");
      loadSections();
    } catch (err: any) {
      setError(err.message || "Failed to create section");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (sec: SectionItem) => {
    setEditingId(sec.id);
    setEditName(sec.name);
    setEditSlug(sec.slug);
  };

  const saveEdit = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/admin/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update section");

      setEditingId(null);
      loadSections();
    } catch (err: any) {
      setError(err.message || "Failed to update section");
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const current = sections[index];
    const target = sections[targetIndex];

    try {
      await Promise.all([
        fetch(`/api/admin/sections/${current.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: target.sortOrder }),
        }),
        fetch(`/api/admin/sections/${target.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: current.sortOrder }),
        }),
      ]);

      loadSections();
    } catch {
      setError("Failed to reorder sections");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete section "${name}"? Products assigned to it will remain in catalog.`)) return;

    try {
      const res = await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete section");
      loadSections();
    } catch (err: any) {
      setError(err.message || "Failed to delete section");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            Sections & Curations
          </h1>
          <p className="text-xs text-[#99948D] mt-1">
            Create, rename, and reorder homepage drop rails and collection sections.
          </p>
        </div>

        <button
          onClick={loadSections}
          className="px-3.5 py-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-xs font-semibold text-[#FAF8F5] flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#E85D2C]" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Section Form */}
      <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#E85D2C]" />
          <span>Create New Section / Collection</span>
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
              Section Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Vault Drop"
              value={newName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs focus:outline-none focus:border-[#E85D2C]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
              Slug *
            </label>
            <input
              type="text"
              required
              placeholder="summer-vault-drop"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
              className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs font-mono focus:outline-none focus:border-[#E85D2C]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{creating ? "Adding..." : "Add Section"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sections Table with Reorder Controls */}
      <div className="bg-[#141310] border border-[#24221D] overflow-x-auto">
        <div className="p-4 border-b border-[#24221D] flex items-center justify-between">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#E85D2C]" />
            <span>Active Sections Hierarchy</span>
          </h2>
          <span className="text-[11px] text-[#99948D]">
            Order controls homepage rails and navigation menu sequence.
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#99948D] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E85D2C]" />
            <span>Loading sections...</span>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B665F]">
            No sections created yet. Add one above.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#24221D] text-[#6B665F] uppercase tracking-wider font-mono text-[10px] bg-[#11100D]">
                <th className="py-3 px-4 w-16">Sort</th>
                <th className="py-3 px-4">Section Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Assigned Products</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1D19]">
              {sections.map((sec, index) => {
                const isEditing = editingId === sec.id;

                return (
                  <tr key={sec.id} className="hover:bg-[#1C1A16] transition-colors">
                    {/* Sort Order Controls */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveOrder(index, "up")}
                          disabled={index === 0}
                          title="Move up"
                          className="p-1 text-[#99948D] hover:text-white disabled:opacity-20"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveOrder(index, "down")}
                          disabled={index === sections.length - 1}
                          title="Move down"
                          className="p-1 text-[#99948D] hover:text-white disabled:opacity-20"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-bold text-white">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 bg-[#12110E] border border-[#282622] text-white text-xs w-full max-w-xs"
                        />
                      ) : (
                        sec.name
                      )}
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4 font-mono text-[#99948D]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                          className="px-2 py-1 bg-[#12110E] border border-[#282622] text-white text-xs font-mono w-full max-w-xs"
                        />
                      ) : (
                        `/${sec.slug}`
                      )}
                    </td>

                    {/* Product count */}
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 bg-[#1C1A16] border border-[#282622] text-[11px] text-[#FAF8F5]">
                        {sec._count?.products || 0} products
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(sec.id)}
                              className="px-2.5 py-1 bg-[#E85D2C] text-white text-xs font-bold uppercase flex items-center gap-1"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-[#201E1A] text-[#99948D] text-xs font-bold uppercase hover:text-white"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(sec)}
                              title="Rename Section"
                              className="p-1.5 text-[#99948D] hover:text-[#E85D2C] hover:bg-[#201E1A]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sec.id, sec.name)}
                              title="Delete Section"
                              className="p-1.5 text-[#99948D] hover:text-red-400 hover:bg-[#201E1A]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
