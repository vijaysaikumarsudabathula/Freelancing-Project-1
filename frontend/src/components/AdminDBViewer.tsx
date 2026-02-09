import React, { useEffect, useState, useCallback } from 'react';
import { 
  initDatabase, importDatabase, exportDatabase, downloadDatabase, getTableList, getTableContents, runSql
} from '../services/database';
import { 
  initAdminDatabase, importAdminDatabase, exportAdminDatabase, downloadAdminDatabase, getAdminTableList, getAdminTableContents, runAdminSql
} from '../services/adminDatabase';

const DBSelector = ({ value, onChange }: { value: 'user' | 'admin'; onChange: (v: 'user' | 'admin') => void }) => (
  <div className="flex gap-2 flex-wrap">
    <button onClick={() => onChange('user')} className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${value === 'user' ? 'bg-[#2D5A27] text-white' : 'bg-white border'}`}>User DB</button>
    <button onClick={() => onChange('admin')} className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${value === 'admin' ? 'bg-[#2D5A27] text-white' : 'bg-white border'}`}>Admin DB</button>
  </div>
);

const AdminDBViewer: React.FC = () => {
  const [dbType, setDbType] = useState<'user' | 'admin'>('user');
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<{ columns: string[]; values: any[] }>({ columns: [], values: [] });
  const [query, setQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [editingRow, setEditingRow] = useState<{ pkCol: string; pkValue: any; data: any } | null>(null);
  const [editJson, setEditJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  // Initialize databases
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        await initDatabase().catch(e => console.warn('User DB init:', e));
        await initAdminDatabase().catch(e => console.warn('Admin DB init:', e));
        refreshTables();
      } catch (e) {
        setMessage('⚠️ Failed to initialize databases: ' + String(e));
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Refresh tables when db type changes
  useEffect(() => {
    refreshTables();
  }, [dbType]);

  // Handle auto-refresh on DB changes
  useEffect(() => {
    const onUserDbChange = () => {
      if (dbType === 'user') refreshTables();
    };
    const onAdminDbChange = () => {
      if (dbType === 'admin') refreshTables();
    };
    window.addEventListener('deepthi-db-changed', onUserDbChange);
    window.addEventListener('deepthi-admin-db-changed', onAdminDbChange);
    return () => {
      window.removeEventListener('deepthi-db-changed', onUserDbChange);
      window.removeEventListener('deepthi-admin-db-changed', onAdminDbChange);
    };
  }, [dbType]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const refreshTables = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = dbType === 'user' ? getTableList() : getAdminTableList();
      setTables(list);
      setSelectedTable(null);
      setTableData({ columns: [], values: [] });
    } catch (e) {
      setMessage('❌ Error refreshing tables: ' + String(e));
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  }, [dbType]);

  const onSaveExplicitly = async () => {
    try {
      setIsLoading(true);
      if (dbType === 'user') {
        await initDatabase();
      } else {
        await initAdminDatabase();
      }
      setMessage('✅ Database saved to IndexedDB');
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) {
      setMessage('❌ Save failed: ' + (e.message || String(e)));
    } finally {
      setIsLoading(false);
    }
  };

  const viewTable = useCallback((name: string) => {
    try {
      setSelectedTable(name);
      const data = dbType === 'user' ? getTableContents(name) : getAdminTableContents(name);
      setTableData(data as any);
      if (!data || (data.columns && data.columns.length === 0)) {
        setMessage('⚠️ Table is empty or could not be loaded');
      } else {
        setMessage('');
      }
    } catch (e) {
      setMessage('❌ Error loading table: ' + String(e));
      setTableData({ columns: [], values: [] });
    }
  }, [dbType]);

  const onExecute = useCallback(() => {
    if (!query.trim()) {
      setMessage('⚠️ Please enter a SQL query');
      return;
    }
    try {
      setIsLoading(true);
      const res = dbType === 'user' ? runSql(query) : runAdminSql(query);
      setQueryResult(res);
      setMessage('✅ Query executed successfully');
      setTimeout(() => setMessage(''), 3000);
      refreshTables();
    } catch (e: any) {
      setQueryResult({ error: String(e) });
      setMessage('❌ Query failed: ' + String(e));
    } finally {
      setIsLoading(false);
    }
  }, [query, dbType, refreshTables]);

  const onExport = useCallback(() => {
    try {
      if (dbType === 'user') downloadDatabase();
      else downloadAdminDatabase();
      setMessage('✅ Database exported successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('❌ Export failed: ' + String(e));
    }
  }, [dbType]);

  const onImportFile = useCallback((file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsLoading(true);
        const result = reader.result as ArrayBuffer;
        if (dbType === 'user') await importDatabase(result);
        else await importAdminDatabase(result);
        setMessage('✅ Import successful');
        refreshTables();
      } catch (e: any) {
        setMessage('❌ Import failed: ' + (e.message || String(e)));
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [dbType, refreshTables]);

  const handleDeleteRow = useCallback((pkCol: string, pkValue: any, row: any[]) => {
    if (!selectedTable) return;
    if (!confirm(`Delete row with ${pkCol} = ${pkValue}?`)) return;
    
    try {
      setIsLoading(true);
      const val = String(pkValue).replace(/'/g, "''");
      const q = `DELETE FROM ${selectedTable} WHERE ${pkCol} = '${val}'`;
      const res = dbType === 'user' ? runSql(q) : runAdminSql(q);
      setMessage('✅ Row deleted successfully');
      setTimeout(() => setMessage(''), 2000);
      refreshTables();
      if (selectedTable) viewTable(selectedTable);
    } catch (e: any) {
      setMessage('❌ Delete failed: ' + String(e));
    } finally {
      setIsLoading(false);
    }
  }, [selectedTable, dbType, refreshTables, viewTable]);

  const handleSaveEdit = useCallback(() => {
    if (!editingRow || !selectedTable) return;
    try {
      setIsLoading(true);
      const obj = JSON.parse(editJson || JSON.stringify(editingRow.data));
      const cols = Object.keys(obj).filter(c => c !== editingRow.pkCol);
      const setParts = cols.map(c => `${c} = '${String(obj[c]).replace(/'/g, "''")}'`).join(', ');
      const whereVal = String(editingRow.pkValue).replace(/'/g, "''");
      const q = `UPDATE ${selectedTable} SET ${setParts} WHERE ${editingRow.pkCol} = '${whereVal}'`;
      const res = dbType === 'user' ? runSql(q) : runAdminSql(q);
      setMessage('✅ Row updated successfully');
      setTimeout(() => setMessage(''), 2000);
      setEditingRow(null);
      setEditJson('');
      refreshTables();
      if (selectedTable) viewTable(selectedTable);
    } catch (e: any) {
      setMessage('❌ Update failed: ' + String(e));
    } finally {
      setIsLoading(false);
    }
  }, [editingRow, selectedTable, editJson, dbType, refreshTables, viewTable]);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row gap-2 md:gap-6 p-2 md:p-4">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Database Console</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 rounded bg-[#2D5A27] text-white text-sm"
        >
          {sidebarOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'block' : 'hidden'
      } md:block w-full md:w-72 bg-[#FAF9F6] p-3 md:p-4 rounded-lg border`}>
        <div className="mb-3 flex flex-col gap-2">
          <strong className="text-sm">DB Selector</strong>
          <DBSelector 
            value={dbType} 
            onChange={(v) => { 
              setDbType(v); 
              setSelectedTable(null); 
              setTableData({ columns: [], values: [] }); 
              setQueryResult(null);
              setSidebarOpen(false);
            }} 
          />
        </div>

        <div className="flex gap-2 mb-3">
          <input 
            id="import-file" 
            type="file" 
            accept=".sqlite,.db,application/octet-stream" 
            onChange={(e) => onImportFile(e.target.files ? e.target.files[0] : undefined)}
            className="text-xs flex-1"
            disabled={isLoading}
          />
        </div>

        <div className="mb-3 text-xs text-gray-500">
          💡 Tip: Export the DB and open the .sqlite file in VS Code using a SQLite extension.
        </div>

        <div className="flex flex-col gap-2 mb-3">
          <button 
            onClick={onExport} 
            className="px-3 py-2 rounded bg-[#2D5A27] text-white text-sm disabled:opacity-50"
            disabled={isLoading}
          >
            📥 Export
          </button>
          <button 
            onClick={onSaveExplicitly} 
            className="px-3 py-2 rounded bg-[#A4C639] text-white font-bold text-sm disabled:opacity-50"
            disabled={isLoading}
          >
            💾 Save
          </button>
          <button 
            onClick={refreshTables}
            className="px-3 py-2 rounded bg-white border text-sm disabled:opacity-50"
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-bold mb-2">Tables</h4>
          <div className="flex flex-col gap-2 max-h-[40vh] md:max-h-[60vh] overflow-auto">
            {isLoading && <div className="text-sm text-gray-400">Loading...</div>}
            {tables.length === 0 && !isLoading ? (
              <div className="p-3 text-sm text-gray-400">
                No tables found. Click <strong>Refresh</strong> or import a .sqlite file.
              </div>
            ) : (
              tables.map(t => (
                <button 
                  key={t} 
                  onClick={() => {
                    viewTable(t);
                    setSidebarOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded text-sm ${selectedTable === t ? 'bg-[#2D5A27] text-white' : 'bg-white border hover:bg-gray-50'}`}
                >
                  {t}
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="mb-4">
          <h3 className="text-xl md:text-2xl font-bold break-words">
            {selectedTable ? `Table: ${selectedTable}` : 'Select a table to view'}
          </h3>
          {message && (
            <p className={`text-sm mt-2 ${message.includes('❌') ? 'text-red-600' : message.includes('✅') ? 'text-green-600' : 'text-yellow-600'}`}>
              {message}
            </p>
          )}
          {isLoading && <p className="text-sm text-blue-600">⏳ Loading...</p>}
        </div>

        <div className="mb-6 bg-white p-3 md:p-4 rounded border">
          <label className="block text-sm font-bold mb-2">Execute SQL</label>
          <textarea 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            rows={5}
            disabled={isLoading}
            className="w-full p-3 border rounded text-sm resize-none disabled:opacity-50" 
            placeholder={`-- Write SQL here (SELECT, UPDATE, CREATE, etc.)
-- All changes are auto-saved to IndexedDB`}
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            <button 
              onClick={onExecute}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 rounded bg-[#2D5A27] text-white text-sm disabled:opacity-50"
            >
              ▶ Execute
            </button>
            <button 
              onClick={() => { setQuery(''); setQueryResult(null); }}
              disabled={isLoading}
              className="px-4 py-2 rounded border text-sm disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        {queryResult && (
          <div className="mb-6 bg-white p-3 md:p-4 rounded border">
            <h4 className="font-bold mb-2">Query Result</h4>
            <div className={`p-3 rounded text-sm mb-2 ${queryResult.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {queryResult.error ? `❌ ${queryResult.error}` : '✅ Query executed and saved'}
            </div>
            <div className="overflow-x-auto">
              <pre className="p-3 bg-gray-50 border rounded text-xs max-h-48 overflow-auto">
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {editingRow && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white w-full max-w-2xl rounded-lg p-6 border shadow-lg max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="font-bold text-sm sm:text-base">Edit Row ({editingRow.pkCol} = {String(editingRow.pkValue)})</h3>
                <button 
                  onClick={() => setEditingRow(null)} 
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  Close
                </button>
              </div>
              <textarea 
                value={editJson || JSON.stringify(editingRow.data, null, 2)} 
                onChange={e => setEditJson(e.target.value)} 
                rows={10}
                disabled={isLoading}
                className="w-full p-3 border rounded mb-3 text-xs font-mono resize-none disabled:opacity-50"
              />
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="px-3 py-2 rounded bg-[#2D5A27] text-white text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button 
                  onClick={() => setEditingRow(null)}
                  disabled={isLoading}
                  className="px-3 py-2 rounded border text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTable && tableData.columns.length > 0 && (
          <div className="bg-white p-3 md:p-4 rounded border">
            <h4 className="font-bold mb-3">Rows ({tableData.values.length} total)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b">
                    {tableData.columns.map(c => (
                      <th key={c} className="p-2 text-left font-bold min-w-fit">{c}</th>
                    ))}
                    <th className="p-2 text-left font-bold min-w-fit">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.values.map((row, i) => {
                    const pkCol = tableData.columns.includes('id') ? 'id' : tableData.columns[0];
                    const pkIndex = tableData.columns.indexOf(pkCol);
                    const pkValue = row[pkIndex];
                    return (
                      <tr key={i} className="even:bg-white odd:bg-[#fffdf9] border-b hover:bg-gray-50">
                        {row.map((cell: any, j: number) => (
                          <td key={j} className="p-2 border-r break-all">
                            {typeof cell === 'string' && cell.length > 50 
                              ? cell.substring(0, 50) + '...' 
                              : String(cell)}
                          </td>
                        ))}
                        <td className="p-2 whitespace-nowrap">
                          <div className="flex gap-1 flex-wrap">
                            <button 
                              onClick={() => {
                                const obj: any = {};
                                tableData.columns.forEach((c, idx) => obj[c] = row[idx]);
                                setEditJson(JSON.stringify(obj, null, 2));
                                setEditingRow({ pkCol, pkValue, data: obj });
                              }}
                              disabled={isLoading}
                              className="px-2 py-1 rounded bg-white border text-xs disabled:opacity-50 hover:bg-gray-50"
                            >
                              ✎
                            </button>
                            <button 
                              onClick={() => handleDeleteRow(pkCol, pkValue, row)}
                              disabled={isLoading}
                              className="px-2 py-1 rounded bg-red-500 text-white text-xs disabled:opacity-50 hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTable && tableData.columns.length === 0 && !isLoading && (
          <div className="bg-white p-4 rounded border text-center text-gray-500">
            ⚠️ Table is empty or could not be loaded
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDBViewer;
