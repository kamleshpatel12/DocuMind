import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './styles.css';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api' });

function ErrorMessage({ children }) {
  return children ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{children}</p> : null;
}

function App() {
  const [documents, setDocuments] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  async function loadDocuments() {
    try { const response = await api.get('/documents'); setDocuments(response.data.documents); } catch (err) { setError(err.response?.data?.error ?? 'Could not load documents.'); }
  }
  useEffect(() => { loadDocuments(); }, []);

  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      const body = new FormData(); body.append('file', file);
      await api.post('/documents/upload', body);
      await loadDocuments();
    } catch (err) { setError(err.response?.data?.error ?? 'Could not process this PDF.'); }
    finally { setBusy(false); event.target.value = ''; }
  }
  async function removeDocument(id) {
    setError('');
    try { await api.delete(`/documents/${id}`); setDocuments((current) => current.filter((document) => document._id !== id)); }
    catch (err) { setError(err.response?.data?.error ?? 'Could not delete document.'); }
  }
  async function askQuestion(event) {
    event.preventDefault();
    if (!question.trim()) return;
    setBusy(true); setError(''); setAnswer(null);
    try { const response = await api.post('/query', { question }); setAnswer(response.data); }
    catch (err) { setError(err.response?.data?.error ?? 'Could not answer that question.'); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Document intelligence</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Docu<span className="text-cyan-300">Mind</span></h1><p className="mt-3 max-w-xl text-slate-400">Ask questions across your PDFs and get answers grounded in the exact pages that support them.</p></div>
        <button className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200" onClick={loadDocuments}>Refresh library</button>
      </header>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Your library</h2><span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">{documents.length}</span></div>
          <input ref={fileInput} className="hidden" type="file" accept="application/pdf" onChange={uploadFile} />
          <button disabled={busy} onClick={() => fileInput.current?.click()} className="mb-5 w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Processing...' : '+ Upload PDF'}</button>
          <div className="space-y-3">{documents.length === 0 ? <p className="text-sm leading-6 text-slate-500">No documents yet. Upload a text-based PDF to start asking questions.</p> : documents.map((document) => <div className="group rounded-xl border border-slate-800 p-3" key={document._id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{document.filename}</p><p className="mt-1 text-xs text-slate-500">{document.pageCount} pages · {document.status}</p></div><button aria-label={`Delete ${document.filename}`} className="text-slate-600 hover:text-red-300" onClick={() => removeDocument(document._id)}>×</button></div></div>)}</div>
        </aside>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8">
          <div className="mb-8"><p className="mb-2 text-sm font-semibold text-cyan-300">Retrieval-augmented answers</p><h2 className="text-2xl font-semibold">What would you like to know?</h2><p className="mt-2 text-sm text-slate-400">DocuMind searches your uploaded document chunks before asking Gemini to answer.</p></div>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={askQuestion}><input className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-cyan-300 placeholder:text-slate-600 focus:ring-2" maxLength="500" placeholder="e.g. What are the key recommendations?" value={question} onChange={(event) => setQuestion(event.target.value)} /><button disabled={busy || !question.trim()} className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Thinking...' : 'Ask question'}</button></form>
          {answer ? <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950 p-5"><h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-300">Answer</h3><p className="whitespace-pre-wrap leading-7 text-slate-200">{answer.answer}</p>{answer.sources.length > 0 && <div className="mt-6 border-t border-slate-800 pt-4"><h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Sources</h4><div className="flex flex-wrap gap-2">{answer.sources.map((source) => <span className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300" key={`${source.filename}-${source.pageNumber}`}>{source.citation} · {source.filename}{source.pageNumber ? ` · p. ${source.pageNumber}` : ''}</span>)}</div></div>}</div> : <div className="mt-8 rounded-2xl border border-dashed border-slate-700 px-6 py-16 text-center text-slate-500"><p className="text-3xl">⌁</p><p className="mt-3">Your grounded answer will appear here.</p></div>}
        </section>
      </div>
    </div>
  </main>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
