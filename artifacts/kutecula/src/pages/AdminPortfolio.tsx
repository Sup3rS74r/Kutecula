import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, LogOut, Plus, Trash2, Save, Eye, EyeOff,
  Image as ImageIcon, Play, Loader2, AlertCircle, CheckCircle,
  ChevronDown, ChevronUp, GripVertical, ArrowUp, ArrowDown, Code2, AlertTriangle
} from 'lucide-react';
import { extractYouTubeId, normalizeImageUrl, getYouTubeThumbnail } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type ItemType = 'image' | 'video';
type Category = 'casamentos' | 'eventos' | 'corporativo' | 'estudio' | 'audiovisual';

interface PortfolioItem {
  id: number;
  type: ItemType;
  src?: string;
  videoId?: string;
  label: { pt: string; en: string };
  category: Category;
}

const CATEGORY_LABELS: Record<Category, { pt: string; en: string }> = {
  casamentos:  { pt: 'Casamentos',  en: 'Weddings'    },
  eventos:     { pt: 'Eventos',     en: 'Events'       },
  corporativo: { pt: 'Corporativo', en: 'Corporate'    },
  estudio:     { pt: 'Estúdio',     en: 'Studio'       },
  audiovisual: { pt: 'Audiovisual', en: 'Audiovisual'  },
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function nextId(items: PortfolioItem[]) {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

// ─────────────────────────────────────────────────────────────
// Login Screen
// ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onLogin(data.token);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-[#141414] border border-white/[0.07] rounded-sm p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-sm bg-[#7B2D8E]/20 flex items-center justify-center">
              <Lock size={18} className="text-[#7B2D8E]" />
            </div>
            <div>
              <p className="text-white font-medium">Acesso Restrito</p>
              <p className="text-[#666] text-xs">Apenas administradores</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#999] text-xs uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setStatus('idle'); }}
                  required
                  autoFocus
                  className="w-full px-4 py-3 pr-12 bg-[#111] border border-white/[0.07] rounded-sm text-white placeholder-[#444] focus:outline-none focus:border-[#7B2D8E] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle size={15} />
                  Password incorrecta
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={status === 'loading' || !password}
              className="w-full py-3 bg-[#7B2D8E] text-white font-medium rounded-sm hover:bg-[#8f3aa3] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Entrar
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Item Card
// ─────────────────────────────────────────────────────────────
function ItemCard({
  item,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  item: PortfolioItem;
  onUpdate: (updated: PortfolioItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cleanVideoId = extractYouTubeId(item.videoId);
  const normalizedImgSrc = normalizeImageUrl(item.src);
  const thumb = item.type === 'image' ? normalizedImgSrc : (cleanVideoId ? getYouTubeThumbnail(cleanVideoId) : '');
  const isDriveLink = Boolean(item.src && /(?:drive\.google\.com|lh3\.googleusercontent\.com)/i.test(item.src));

  return (
    <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-sm overflow-hidden transition-colors hover:border-white/[0.12]">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        {/* Reordering buttons */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            title="Subir posição"
            className="p-1 text-[#555] hover:text-white disabled:opacity-20 disabled:hover:text-[#555] transition-colors"
          >
            <ArrowUp size={13} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            title="Descer posição"
            className="p-1 text-[#555] hover:text-white disabled:opacity-20 disabled:hover:text-[#555] transition-colors"
          >
            <ArrowDown size={13} />
          </button>
        </div>

        {/* Thumbnail */}
        <div className="w-14 h-10 rounded-sm bg-[#111] flex-shrink-0 overflow-hidden relative border border-white/5">
          {thumb ? (
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {item.type === 'video' ? (
                <Play size={14} className="text-[#444]" />
              ) : (
                <ImageIcon size={14} className="text-[#444]" />
              )}
            </div>
          )}
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Play size={10} className="text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm truncate font-medium">
            {item.type === 'image'
              ? (item.src ? (isDriveLink ? 'Imagem Google Drive' : item.src) : 'Sem link de imagem')
              : (cleanVideoId ? `YouTube ID: ${cleanVideoId}` : 'Sem vídeo')}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[#666] text-xs">{item.type === 'image' ? 'Imagem' : 'Vídeo YouTube'}</p>
            {isDriveLink && (
              <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800/40">
                Google Drive
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-[#666] hover:text-white transition-colors rounded-sm hover:bg-white/5"
            title={expanded ? 'Recolher' : 'Editar'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-[#666] hover:text-red-400 transition-colors rounded-sm hover:bg-red-400/10"
            title="Remover"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/[0.05] space-y-3 bg-[#161616]">
              {/* Type selector */}
              <div>
                <label className="block text-[#666] text-xs uppercase tracking-widest mb-2">Tipo</label>
                <div className="flex gap-2">
                  {(['image', 'video'] as ItemType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => onUpdate({ ...item, type: t, src: t === 'video' ? undefined : item.src, videoId: t === 'image' ? undefined : item.videoId })}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-sm border transition-colors ${
                        item.type === t
                          ? 'border-[#7B2D8E] bg-[#7B2D8E]/15 text-white font-medium'
                          : 'border-white/10 text-[#666] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {t === 'image' ? <ImageIcon size={14} /> : <Play size={14} />}
                      {t === 'image' ? 'Imagem' : 'Vídeo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL or YouTube ID */}
              {item.type === 'image' ? (
                <div>
                  <label className="block text-[#666] text-xs uppercase tracking-widest mb-2">Link da Imagem (Google Drive, Imgur, etc.)</label>
                  <input
                    type="url"
                    value={item.src ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const converted = normalizeImageUrl(raw);
                      onUpdate({ ...item, src: converted });
                    }}
                    placeholder="https://drive.google.com/file/d/... ou https://..."
                    className="w-full px-3 py-2 bg-[#111] border border-white/[0.07] rounded-sm text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#7B2D8E] transition-colors"
                  />
                  {isDriveLink ? (
                    <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1.5">
                      <CheckCircle size={13} />
                      Link do Google Drive pronto! Certifique-se de que no Google Drive o arquivo está partilhado como <strong>"Qualquer pessoa com o link pode ver"</strong>.
                    </p>
                  ) : (
                    <p className="text-[#555] text-xs mt-1.5">
                      Pode colar diretamente o link de partilha do Google Drive, Imgur, Cloudinary ou o caminho de uma imagem existente.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-[#666] text-xs uppercase tracking-widest mb-2">Link ou ID do YouTube</label>
                  <input
                    type="text"
                    value={item.videoId ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const cleanId = extractYouTubeId(raw);
                      onUpdate({ ...item, videoId: cleanId });
                    }}
                    placeholder="ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ ou dQw4w9WgXcQ"
                    className="w-full px-3 py-2 bg-[#111] border border-white/[0.07] rounded-sm text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#7B2D8E] transition-colors"
                  />
                  {cleanVideoId && (
                    <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1.5">
                      <CheckCircle size={13} />
                      Vídeo pronto: ID extraído com sucesso ({cleanVideoId})
                    </p>
                  )}
                  <p className="text-[#555] text-xs mt-1.5">
                    Pode colar o link completo do vídeo (inclusive Shorts ou links partilhados do telemóvel). O ID é extraído automaticamente.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category Section
// ─────────────────────────────────────────────────────────────
function CategorySection({
  category,
  items,
  onUpdate,
  onDelete,
  onAdd,
  onMove,
}: {
  category: Category;
  items: PortfolioItem[];
  onUpdate: (id: number, updated: PortfolioItem) => void;
  onDelete: (id: number) => void;
  onAdd: (type: ItemType) => void;
  onMove: (id: number, direction: 'up' | 'down') => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const labels = CATEGORY_LABELS[category];

  return (
    <div className="bg-[#141414] border border-white/[0.05] rounded-sm overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7B2D8E]" />
          <div className="text-left">
            <p className="text-white font-semibold">{labels.pt}</p>
            <p className="text-[#555] text-xs">{labels.en} · {items.length} item{items.length !== 1 ? 's' : ''} (Os 2 primeiros aparecem no separador "Todos")</p>
          </div>
        </div>
        {collapsed ? <ChevronDown size={18} className="text-[#555]" /> : <ChevronUp size={18} className="text-[#555]" />}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {items.length === 0 && (
            <p className="text-[#555] text-sm text-center py-4">Sem itens nesta categoria</p>
          )}

          {items.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              onUpdate={(updated) => onUpdate(item.id, updated)}
              onDelete={() => onDelete(item.id)}
              onMoveUp={() => onMove(item.id, 'up')}
              onMoveDown={() => onMove(item.id, 'down')}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
            />
          ))}

          {/* Add buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onAdd('image')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/10 text-[#888] hover:border-[#7B2D8E]/50 hover:text-white transition-colors rounded-sm text-sm"
            >
              <Plus size={14} />
              Adicionar Imagem
            </button>
            <button
              onClick={() => onAdd('video')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/10 text-[#888] hover:border-[#7B2D8E]/50 hover:text-white transition-colors rounded-sm text-sm"
            >
              <Plus size={14} />
              Adicionar Vídeo YouTube
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Admin Dashboard
// ─────────────────────────────────────────────────────────────
function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load portfolio on mount directly from Redis via API (no localStorage)
  useEffect(() => {
    fetch(`/api/portfolio?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { items?: PortfolioItem[]; source?: string }) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoadError('Erro ao carregar dados do servidor.');
        setLoading(false);
      });
  }, []);

  const handleUpdate = (id: number, updated: PortfolioItem) => {
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    setSaveStatus('idle');
    setSaveErrorMessage('');
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSaveStatus('idle');
    setSaveErrorMessage('');
  };

  const handleMove = (id: number, direction: 'up' | 'down') => {
    setItems((prev) => {
      const itemToMove = prev.find((i) => i.id === id);
      if (!itemToMove) return prev;

      const cat = itemToMove.category;
      const catIndices = prev.map((it, idx) => (it.category === cat ? idx : -1)).filter((idx) => idx !== -1);
      const currentPosInCat = catIndices.findIndex((idx) => prev[idx].id === id);

      const targetPosInCat = direction === 'up' ? currentPosInCat - 1 : currentPosInCat + 1;
      if (targetPosInCat < 0 || targetPosInCat >= catIndices.length) return prev;

      const globalIdxA = catIndices[currentPosInCat];
      const globalIdxB = catIndices[targetPosInCat];

      const newItems = [...prev];
      const temp = newItems[globalIdxA];
      newItems[globalIdxA] = newItems[globalIdxB];
      newItems[globalIdxB] = temp;

      return newItems;
    });
    setSaveStatus('idle');
  };

  const handleAdd = (category: Category, type: ItemType) => {
    const newItem: PortfolioItem = {
      id: nextId(items),
      type,
      label: CATEGORY_LABELS[category],
      category,
      ...(type === 'image' ? { src: '' } : { videoId: '' }),
    };
    setItems((prev) => [...prev, newItem]);
    setSaveStatus('idle');
    setSaveErrorMessage('');
  };

  // POST /api/portfolio directly to Redis (No localStorage)
  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveErrorMessage('');

    // Pre-sanitize items before saving to Redis
    const sanitizedItems = items.map((it) => ({
      ...it,
      src: it.type === 'image' ? normalizeImageUrl(it.src) : undefined,
      videoId: it.type === 'video' ? extractYouTubeId(it.videoId) : undefined,
    }));
    setItems(sanitizedItems);

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: sanitizedItems }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success !== true) {
        setSaveStatus('error');
        setSaveErrorMessage(data.error || 'Erro ao gravar os dados no Redis.');
        return;
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3500);
    } catch (err: any) {
      console.error('Error saving to Redis:', err);
      setSaveStatus('error');
      setSaveErrorMessage(`Falha na ligação com o servidor: ${err?.message || String(err)}`);
    }
  };

  const itemsByCategory = CATEGORIES.reduce<Record<Category, PortfolioItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<Category, PortfolioItem[]>);

  const formattedCodeSnippet = `const STATIC_PORTFOLIO = ${JSON.stringify(items, null, 2)};`;

  const copySnippet = () => {
    navigator.clipboard.writeText(formattedCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold tracking-[0.15em]">KUTECULA</h1>
            <p className="text-[#7B2D8E] text-[10px] tracking-[0.4em] uppercase">Admin · Portfólio (Redis)</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCodeModal(true)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/10"
              title="Ver e copiar código para o projeto"
            >
              <Code2 size={14} />
              <span className="hidden sm:inline">Exportar Código</span>
            </button>

            <a
              href="/"
              className="text-[#888] hover:text-white text-sm transition-colors flex items-center gap-1"
              target="_blank"
            >
              Ver site →
            </a>

            {/* Save button (Redis) */}
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-semibold transition-all ${
                saveStatus === 'saved'
                  ? 'bg-green-600 text-white border border-green-500 shadow-lg shadow-green-900/30'
                  : saveStatus === 'error'
                  ? 'bg-red-600 text-white border border-red-500 shadow-lg shadow-red-900/30'
                  : 'bg-[#7B2D8E] text-white hover:bg-[#8f3aa3] shadow-lg shadow-[#7B2D8E]/30'
              } disabled:cursor-not-allowed`}
            >
              {saveStatus === 'saving' && <Loader2 size={16} className="animate-spin" />}
              {saveStatus === 'saved' && <CheckCircle size={16} />}
              {saveStatus === 'error' && <AlertCircle size={16} />}
              {saveStatus === 'idle' && <Save size={16} />}
              {saveStatus === 'saving'
                ? 'A gravar no Redis...'
                : saveStatus === 'saved'
                ? 'Gravado no Redis!'
                : saveStatus === 'error'
                ? 'Erro ao Gravar no Redis'
                : 'Guardar no Redis'}
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-[#555] hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Redis Error Alert */}
        {saveStatus === 'error' && saveErrorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 mb-6 text-sm text-red-300 flex items-start gap-3">
            <AlertCircle size={19} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-200 mb-1">Erro ao gravar na base de dados Redis</p>
              <p className="text-xs text-red-300/90 leading-relaxed mb-3">{saveErrorMessage}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-red-500/20 text-red-200 border border-red-500/40 font-medium text-xs rounded-sm hover:bg-red-500/30 transition-colors"
                >
                  Conectar KV / Redis na Vercel (Storage → Create Database) →
                </a>
                <button
                  onClick={() => setShowCodeModal(true)}
                  className="px-3 py-1.5 bg-white/10 text-white font-medium text-xs rounded-sm hover:bg-white/20 transition-colors flex items-center gap-1.5"
                >
                  <Code2 size={13} />
                  Copiar Código Atualizado para o Projeto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info banner */}
        <div className="bg-[#7B2D8E]/10 border border-[#7B2D8E]/20 rounded-sm p-4 mb-8 text-sm text-[#ccc]">
          <p className="font-medium text-white mb-1">Como gerir o Portfólio (Simples e Rápido)</p>
          <ul className="space-y-1 text-[#888]">
            <li>1. Para <strong className="text-white">imagens</strong>: insira o link da imagem (ex: Google Drive, Cloudinary, Imgur, etc.).</li>
            <li>2. Para <strong className="text-white">vídeos do YouTube</strong>: insira apenas o ID do vídeo (ex: <span className="text-[#7B2D8E]">dQw4w9WgXcQ</span>).</li>
            <li>3. Clique em <strong className="text-white">Guardar no Site</strong> no canto superior direito. O site é atualizado instantaneamente!</li>
          </ul>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-[#7B2D8E] animate-spin" />
          </div>
        ) : loadError ? (
          <div className="text-center py-24">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{loadError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <CategorySection
                key={cat}
                category={cat}
                items={itemsByCategory[cat]}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAdd={(type) => handleAdd(cat, type)}
                onMove={handleMove}
              />
            ))}
          </div>
        )}

        {/* Export Code Modal */}
        <AnimatePresence>
          {showCodeModal && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-sm p-6 max-w-2xl w-full max-h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">Código Atualizado do Portfólio</h3>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="text-[#888] hover:text-white text-sm"
                  >
                    ✕ Fechar
                  </button>
                </div>
                <p className="text-[#aaa] text-xs mb-3">
                  Podes copiar este array de código e colar diretamente no ficheiro <code className="text-[#7B2D8E]">src/components/Portfolio.tsx</code> para atualizar as fotos permanentemente no código-fonte!
                </p>
                <pre className="bg-[#111] p-4 rounded-sm border border-white/5 text-green-400 text-xs overflow-auto flex-1 font-mono mb-4">
                  {formattedCodeSnippet}
                </pre>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={copySnippet}
                    className="px-5 py-2 bg-[#7B2D8E] hover:bg-[#8f3aa3] text-white text-sm font-medium rounded-sm transition-colors flex items-center gap-2"
                  >
                    {copiedCode ? <CheckCircle size={15} /> : null}
                    {copiedCode ? 'Copiado para a área de transferência!' : 'Copiar Código'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Entry Point
// ─────────────────────────────────────────────────────────────
export default function AdminPortfolio() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem('kutecula_admin_token')
  );

  const handleLogout = () => {
    sessionStorage.removeItem('kutecula_admin_token');
    setToken(null);
  };

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
