"use client";
import { useState } from "react";
import { Database, Table, Search, CheckCircle2, Layers } from "lucide-react";
function DbViewerClient({ tableNames, dbData }) {
  const [selectedTable, setSelectedTable] = useState(tableNames[0] || "users");
  const [searchQuery, setSearchQuery] = useState("");
  const currentRows = dbData[selectedTable] || [];
  const columns = currentRows.length > 0 ? Object.keys(currentRows[0]) : [];
  const filteredRows = currentRows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(row).some(
      (val) => val !== null && val !== void 0 && String(val).toLowerCase().includes(query)
    );
  });
  return <div className="max-w-7xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-5.5 h-5.5 text-blue-600" />
            <span>SQLite Database Table Explorer</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and inspect all 28 relational tables directly inside your application (`data/bookbridge.db`).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Physical SQLite Connected ({tableNames.length} Tables)</span>
          </span>
        </div>
      </div>

      {
    /* Table Selector Tabs */
  }
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Select Table to Browse</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Showing top 100 rows per table</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
          {tableNames.map((name) => {
    const count = (dbData[name] || []).length;
    return <button
      key={name}
      onClick={() => {
        setSelectedTable(name);
        setSearchQuery("");
      }}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${selectedTable === name ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
    >
                <Table className="w-3.5 h-3.5 text-blue-400" />
                <span>{name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedTable === name ? "bg-slate-700 text-blue-300" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>;
  })}
        </div>
      </div>

      {
    /* Active Table Data Section */
  }
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-4.5 h-4.5 text-blue-600" />
              <span>Table: <code className="text-blue-600 font-mono">{selectedTable}</code></span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Displaying {filteredRows.length} of {currentRows.length} records.
            </p>
          </div>

          {
    /* Search Input */
  }
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder={`Filter ${selectedTable} rows...`}
    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
  />
          </div>
        </div>

        {
    /* Data Table */
  }
        {currentRows.length === 0 ? <div className="py-16 text-center text-slate-400 text-xs space-y-1">
            <p className="font-bold text-slate-600">No records found in `{selectedTable}` table.</p>
            <p>Perform an action in the application to log entries into this table.</p>
          </div> : <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
              <thead className="sticky top-0 bg-slate-100 z-10 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 border-b border-slate-200">#</th>
                  {columns.map((col) => <th key={col} className="p-3 border-b border-slate-200 whitespace-nowrap">{col}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRows.map((row, idx) => <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-400 text-[10px] font-mono">{idx + 1}</td>
                    {columns.map((col) => <td key={col} className="p-3 whitespace-nowrap max-w-[240px] truncate text-slate-800 font-mono text-[11px]">
                        {row[col] === null || row[col] === void 0 ? <span className="text-slate-300 italic">null</span> : typeof row[col] === "boolean" ? <span className={row[col] ? "text-emerald-600 font-bold" : "text-slate-400"}>
                            {row[col] ? "true" : "false"}
                          </span> : String(row[col])}
                      </td>)}
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </div>
    </div>;
}
export {
  DbViewerClient as default
};
