import React, { useEffect, useState } from 'react';
import { 
  initDatabase, importDatabase, exportDatabase, downloadDatabase, getTableList, getTableContents, runSql
} from '../services/database';
import { 
  initAdminDatabase, importAdminDatabase, exportAdminDatabase, downloadAdminDatabase, getAdminTableList, getAdminTableContents, runAdminSql
} from '../services/adminDatabase';

const DBSelector = ({ value, onChange }: { value: 'user' | 'admin'; onChange: (v: 'user' | 'admin') => void }) => (
  <div className="flex gap-2">
    <button onClick={() => onChange('user')} className={`px-4 py-2 rounded ${value === 'user' ? 'bg-[#2D5A27] text-white' : 'bg-white border'}`}>User DB</button>
    <button onClick={() => onChange('admin')} className={`px-4 py-2 rounded ${value === 'admin' ? 'bg-[#2D5A27] text-white' : 'bg-white border'}`}>Admin DB</button>
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

  useEffect(() => {
    (async () => {
      await initDatabase();
      await initAdminDatabase();
      refreshTables();
    })();
  }, []);

  // Refresh tables whenever the selector changes
  useEffect(() => {
    refreshTables();
  }, [dbType]);

  // Auto-refresh when DB changes elsewhere in the app (e.g., signup, orders)
  useEffect(() => {
    const onUserDbChange = () => {
      refreshTables();
      if (selectedTable && dbType === 'user') viewTable(selectedTable);
    };
    const onAdminDbChange = () => {
      refreshTables();
      if (selectedTable && dbType === 'admin') viewTable(selectedTable);
    };
    window.addEventListener('deepthi-db-changed', onUserDbChange);
    window.addEventListener('deepthi-admin-db-changed', onAdminDbChange);
    return () => {
      window.removeEventListener('deepthi-db-changed', onUserDbChange);
      window.removeEventListener('deepthi-admin-db-changed', onAdminDbChange);
    };
  }, [selectedTable, dbType]);

  const refreshTables = async () => {
    try {
      const list = dbType === 'user' ? getTableList() : getAdminTableList();
      setTables(list);
    } catch (e) {
      setMessage(String(e));
    }
  };

  const onSaveExplicitly = async () => {
    try {
      if (dbType === 'user') {
        await initDatabase();
      } else {
        await initAdminDatabase();
      }
      setMessage('✅ Database saved to IndexedDB');
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) {
      setMessage('❌ Save failed: ' + e.message);
    }
  };

  const viewTable = (name: string) => {
    setSelectedTable(name);
    const data = dbType === 'user' ? getTableContents(name) : getAdminTableContents(name);
    setTableData(data as any);
  };

  const onExecute = () => {
    if (!query.trim()) return;
    try {
      const res = dbType === 'user' ? runSql(query) : runAdminSql(query);
      setQueryResult(res);
    } catch (e: any) {
      setQueryResult({ error: String(e) });
    }
    refreshTables();
  };

  const onExport = () => {
    if (dbType === 'user') downloadDatabase();
    else downloadAdminDatabase();
  };

  const onImportFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as ArrayBuffer;
      try {
        if (dbType === 'user') await importDatabase(result);
        else await importAdminDatabase(result);
        setMessage('Import successful');
        refreshTables();
      } catch (e: any) {
        setMessage('Import failed: ' + e.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="w-full flex gap-6">
      <aside className="w-72 bg-[#FAF9F6] p-4 rounded-lg border">
        <div className="mb-4 flex items-center justify-between">
          <strong className="text-sm">DB Selector</strong>
          <DBSelector value={dbType} onChange={(v) => { setDbType(v); setSelectedTable(null); setTableData({ columns: [], values: [] }); setQueryResult(null); }} />
        </div>

        <div className="flex gap-2 mb-3">
          <input id="import-file" type="file" accept=".sqlite,.db,application/octet-stream" onChange={(e) => onImportFile(e.target.files ? e.target.files[0] : undefined)} />
        </div>
        <div className="mb-3 text-xs text-gray-500">
          Tip: export the DB (Export) and open the .sqlite file in VS Code using a SQLite extension (e.g., "SQLite" by alexcvzz or "SQLite Viewer") to browse tables within VS Code.
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={onExport} className="px-3 py-2 rounded bg-[#2D5A27] text-white">Export</button>
          <button onClick={onSaveExplicitly} className="px-3 py-2 rounded bg-[#A4C639] text-white font-bold">💾 Save</button>
          <button onClick={refreshTables} className="px-3 py-2 rounded bg-white border">Refresh</button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-bold mb-2">Tables</h4>
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
            {tables.length === 0 ? (
              <div className="p-3 text-sm text-gray-400">No tables found. Click <strong>Refresh</strong> or import a .sqlite file to load a database.</div>
            ) : (
              tables.map(t => (
                <button key={t} onClick={() => viewTable(t)} className={`text-left px-3 py-2 rounded ${selectedTable === t ? 'bg-[#2D5A27] text-white' : 'bg-white border'}`}>{t}</button>
              ))
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mb-4">
          <h3 className="text-xl font-bold">Table: {selectedTable || '—'}</h3>
          {message && <p className="text-sm text-red-500">{message}</p>}
        </div>

        <div className="mb-6">
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={6} className="w-full p-3 border rounded" placeholder={`-- Write SQL here (SELECT, UPDATE, CREATE, etc.)\n-- All changes are auto-saved to IndexedDB`}></textarea>
          <div className="flex gap-2 mt-2">
            <button onClick={onExecute} className="px-4 py-2 rounded bg-[#2D5A27] text-white">Execute</button>
            <button onClick={() => { setQuery(''); setQueryResult(null); }} className="px-4 py-2 rounded border">Clear</button>
          </div>
        </div>

        {queryResult && (
          <div className="mb-6">
            <h4 className="font-bold mb-2">Query Result</h4>
            <div className={`p-3 rounded text-sm ${queryResult.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {queryResult.error ? `❌ ${queryResult.error}` : '✅ Query executed and saved'}
            </div>
            <pre className="p-3 bg-white border rounded max-h-72 overflow-auto text-sm mt-2">{JSON.stringify(queryResult, null, 2)}</pre>
          </div>
        )}

        {editingRow && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white w-full max-w-2xl rounded-lg p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Edit Row ({editingRow.pkCol} = {String(editingRow.pkValue)})</h3>
                <button onClick={() => setEditingRow(null)} className="px-3 py-1 border rounded">Close</button>
              </div>
              <textarea value={editJson || JSON.stringify(editingRow.data, null, 2)} onChange={e => setEditJson(e.target.value)} rows={10} className="w-full p-3 border rounded mb-3" />
              <div className="flex gap-2">
                <button onClick={() => {
                  try {
                    const obj = JSON.parse(editJson || JSON.stringify(editingRow.data));
                    const cols = Object.keys(obj).filter(c => c !== editingRow.pkCol);
                    const setParts = cols.map(c => `${c} = '${String(obj[c]).replace(/'/g, "''")}'`).join(', ');
                    const whereVal = String(editingRow.pkValue).replace(/'/g, "''");
                    const q = `UPDATE ${selectedTable} SET ${setParts} WHERE ${editingRow.pkCol} = '${whereVal}'`;
                    const res = dbType === 'user' ? runSql(q) : runAdminSql(q);
                    setMessage('Row updated');
                    setEditingRow(null);
                    setEditJson('');
                    refreshTables();
                    if (selectedTable) viewTable(selectedTable);
                  } catch (e: any) {
                    setMessage('Update failed: ' + e.message);
                  }
                }} className="px-3 py-2 rounded bg-[#2D5A27] text-white">Save</button>
                <button onClick={() => setEditingRow(null)} className="px-3 py-2 rounded border">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {selectedTable && (
          <div>
            <h4 className="font-bold mb-2">Rows</h4>
            <div className="overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAF9F6]">
                    {tableData.columns.map(c => <th key={c} className="p-2 text-left border-b">{c}</th>)}
                    <th className="p-2 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.values.map((row, i) => {
                    const pkCol = tableData.columns.includes('id') ? 'id' : tableData.columns[0];
                    const pkIndex = tableData.columns.indexOf(pkCol);
                    const pkValue = row[pkIndex];
                    return (
                      <tr key={i} className="even:bg-white odd:bg-[#fffdf9]">
                        {row.map((cell: any, j: number) => <td key={j} className="p-2 border-r align-top">{String(cell)}</td>)}
                        <td className="p-2 border-r align-top">
                          <div className="flex gap-2">
                            <button onClick={() => {
                              const obj: any = {};
                              tableData.columns.forEach((c, idx) => obj[c] = row[idx]);
                              setEditJson(JSON.stringify(obj, null, 2));
                              setEditingRow({ pkCol, pkValue, data: obj });
                            }} className="px-2 py-1 rounded bg-white border text-sm">Edit</button>
                            <button onClick={() => {
                              if (!confirm(`Delete row with ${pkCol} = ${pkValue}?`)) return;
                              try {
                                const val = String(pkValue).replace(/'/g, "''");
                                const q = `DELETE FROM ${selectedTable} WHERE ${pkCol} = '${val}'`;
                                const res = dbType === 'user' ? runSql(q) : runAdminSql(q);
                                setMessage('Row deleted');
                                refreshTables();
                                if (selectedTable) viewTable(selectedTable);
                              } catch (e: any) {
                                setMessage('Delete failed: ' + e.message);
                              }
                            }} className="px-2 py-1 rounded bg-red-500 text-white text-sm">Delete</button>
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
      </main>
    </div>
  );
};

export default AdminDBViewer;
