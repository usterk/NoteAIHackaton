'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { encryptData, decryptData } from '@/lib/crypto-client';
import { useEncryption } from '../context/EncryptionContext';

interface Note {
  id: string;
  title: string;
  content: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  folder: { id: string; name: string; color: string } | null;
  folderId: string | null;
  tags: { id: string; name: string; color: string }[];
}

interface Folder {
  id: string;
  name: string;
  color: string;
  _count: { notes: number };
}

interface Tag {
  id: string;
  name: string;
  color: string;
  _count: { notes: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const { encryptionKey, clearEncryptionKey } = useEncryption();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);

  useEffect(() => {
    fetchNotes();
    fetchFolders();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived, selectedFolder, selectedTag]);

  const fetchNotes = async () => {
    if (!encryptionKey) {
      console.error('No encryption key available');
      return;
    }

    const params = new URLSearchParams();
    if (showArchived) params.append('archived', 'true');
    if (selectedFolder) params.append('folderId', selectedFolder);
    if (selectedTag) params.append('tagId', selectedTag);

    try {
      const response = await fetch(`/api/notes?${params}`);
      if (response.ok) {
        const encryptedData = await response.json();

        console.log('Encrypted notes:', encryptedData);

        // Decrypt all notes
        const decryptedNotes = await Promise.all(
          encryptedData.map(async (note: any) => {
            try {
              return {
                ...note,
                title: await decryptData(note.encryptedTitle, note.iv, encryptionKey),
                content: await decryptData(note.encryptedContent, note.iv, encryptionKey),
              };
            } catch (err) {
              console.error('Failed to decrypt note:', note.id, err);
              // Return note with encrypted data as fallback
              return {
                ...note,
                title: '[Decryption Error]',
                content: '[Failed to decrypt]',
              };
            }
          })
        );

        console.log('Decrypted notes:', decryptedNotes);
        setNotes(decryptedNotes);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const fetchFolders = async () => {
    const response = await fetch('/api/folders');
    if (response.ok) {
      const data = await response.json();
      setFolders(data);
    }
  };

  const fetchTags = async () => {
    const response = await fetch('/api/tags');
    if (response.ok) {
      const data = await response.json();
      setTags(data);
    }
  };

  const createNote = async (title: string, content: string, folderId: string | null, tagIds: string[]) => {
    if (!encryptionKey) {
      console.error('No encryption key available');
      return;
    }

    // Generate one IV for the entire note
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const ivBase64 = btoa(String.fromCharCode.apply(null, Array.from(iv)));

    // Encrypt both title and content with the same IV
    const encoder = new TextEncoder();

    const titleBuffer = encoder.encode(title);
    const encryptedTitleBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      encryptionKey,
      titleBuffer.buffer as ArrayBuffer
    );
    const encryptedTitle = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encryptedTitleBuffer))));

    const contentBuffer = encoder.encode(content);
    const encryptedContentBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      encryptionKey,
      contentBuffer.buffer as ArrayBuffer
    );
    const encryptedContent = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encryptedContentBuffer))));

    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encryptedTitle,
        encryptedContent,
        iv: ivBase64,
        folderId,
        tagIds
      }),
    });

    if (response.ok) {
      await fetchNotes();
      await fetchFolders();
      await fetchTags();
      setShowNewNote(false);
    }
  };

  const updateNote = async () => {
    if (!selectedNote || !encryptionKey) return;

    // Generate one IV for the entire note
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const ivBase64 = btoa(String.fromCharCode.apply(null, Array.from(iv)));

    // Encrypt both title and content with the same IV
    const encoder = new TextEncoder();

    const titleBuffer = encoder.encode(editTitle);
    const encryptedTitleBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      encryptionKey,
      titleBuffer.buffer as ArrayBuffer
    );
    const encryptedTitle = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encryptedTitleBuffer))));

    const contentBuffer = encoder.encode(editContent);
    const encryptedContentBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      encryptionKey,
      contentBuffer.buffer as ArrayBuffer
    );
    const encryptedContent = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encryptedContentBuffer))));

    const response = await fetch(`/api/notes/${selectedNote.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encryptedTitle,
        encryptedContent,
        iv: ivBase64,
        folderId: editFolderId,
        tagIds: editTagIds,
      }),
    });

    if (response.ok) {
      await fetchNotes();
      await fetchFolders();
      await fetchTags();
      setIsEditing(false);
      const encryptedNote = await response.json();
      // Decrypt for display
      const decryptedNote = {
        ...encryptedNote,
        title: await decryptData(encryptedNote.encryptedTitle, encryptedNote.iv, encryptionKey),
        content: await decryptData(encryptedNote.encryptedContent, encryptedNote.iv, encryptionKey),
      };
      setSelectedNote(decryptedNote);
    }
  };

  const archiveNote = async (noteId: string) => {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived: true }),
    });

    if (response.ok) {
      await fetchNotes();
      setSelectedNote(null);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę notatkę?')) return;

    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await fetchNotes();
      await fetchFolders();
      await fetchTags();
      setSelectedNote(null);
    }
  };

  const createFolder = async (name: string, color: string) => {
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });

    if (response.ok) {
      await fetchFolders();
      setShowNewFolder(false);
    }
  };

  const createTag = async (name: string, color: string) => {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });

    if (response.ok) {
      await fetchTags();
      setShowNewTag(false);
    }
  };

  const logout = async () => {
    clearEncryptionKey(); // Clear encryption key from context
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const toggleTag = (tagId: string) => {
    setEditTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="flex h-screen relative z-10">
      {/* Sidebar */}
      <div className="w-64 cyber-panel border-r border-cyan-500 flex flex-col overflow-hidden gradient-bg">
        <div className="p-4 neon-border-magenta mb-4 relative">
          <h1 className="text-xl font-bold neon-text terminal-text glitch">[ SECURE NOTES ]</h1>
          <div className="text-xs neon-text-green terminal-text mt-1">v2.0.0 ENCRYPTED</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => {
              setSelectedFolder(null);
              setSelectedTag(null);
              setShowArchived(false);
            }}
            className={`w-full text-left px-3 py-2 mb-2 text-sm terminal-text ${
              !selectedFolder && !selectedTag && !showArchived
                ? 'neon-glow-btn'
                : 'neon-text opacity-70 hover:opacity-100'
            }`}
          >
            &gt; ALL NOTES
          </button>

          <button
            onClick={() => {
              setSelectedFolder(null);
              setSelectedTag(null);
              setShowArchived(true);
            }}
            className={`w-full text-left px-3 py-2 mb-4 text-sm terminal-text ${
              showArchived
                ? 'neon-glow-btn-magenta'
                : 'neon-text-magenta opacity-70 hover:opacity-100'
            }`}
          >
            &gt; ARCHIVE
          </button>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs terminal-text neon-text-green">
                &gt; FOLDERS [{folders.length}]
              </h3>
              <button
                onClick={() => setShowNewFolder(true)}
                className="neon-text-green hover:neon-text text-lg glitch-effect-2"
                title="Add folder"
              >
                [+]
              </button>
            </div>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setSelectedTag(null);
                  setShowArchived(false);
                }}
                className={`w-full text-left px-3 py-2 mb-1 text-sm terminal-text transition-all ${
                  selectedFolder === folder.id
                    ? 'neon-border neon-text'
                    : 'neon-text opacity-70 cyber-hover'
                }`}
              >
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: folder.color }} />
                {folder.name} ({folder._count.notes})
              </button>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs terminal-text neon-text-magenta">
                &gt; TAGS [{tags.length}]
              </h3>
              <button
                onClick={() => setShowNewTag(true)}
                className="neon-text-magenta hover:neon-text text-lg glitch-effect-2"
                title="Add tag"
              >
                [+]
              </button>
            </div>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTag(tag.id);
                  setSelectedFolder(null);
                  setShowArchived(false);
                }}
                className={`w-full text-left px-3 py-2 mb-1 text-sm terminal-text transition-all ${
                  selectedTag === tag.id
                    ? 'neon-border-magenta neon-text-magenta'
                    : 'neon-text opacity-70 cyber-hover'
                }`}
              >
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                {tag.name} ({tag._count.notes})
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-cyan-900">
          <button
            onClick={logout}
            className="w-full neon-glow-btn-red px-4 py-2 terminal-text"
          >
            [ LOGOUT ]
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="w-80 cyber-panel border-r border-cyan-900 flex flex-col gradient-bg">
        <div className="p-4 neon-border mb-4">
          <button
            onClick={() => setShowNewNote(true)}
            className="w-full neon-glow-btn-green px-4 py-3 terminal-text pulse-border"
          >
            [ + NEW NOTE ]
          </button>
          <div className="text-xs neon-text terminal-text mt-2 text-center opacity-70">
            &gt; {notes.length} NOTES LOADED
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note);
                setIsEditing(false);
              }}
              className={`p-4 border-b border-cyan-900 cursor-pointer transition-all ${
                selectedNote?.id === note.id ? 'neon-border cyber-panel' : 'cyber-hover'
              }`}
            >
              <h3 className="font-semibold neon-text mb-1 text-sm terminal-text">{note.title}</h3>
              <p className="text-xs neon-text opacity-80 line-clamp-2 mb-2">
                {note.content}
              </p>
              {note.folder && (
                <div className="mb-1">
                  <span
                    className="text-xs px-2 py-1 rounded terminal-text"
                    style={{ backgroundColor: note.folder.color + '33', color: note.folder.color }}
                  >
                    📁 {note.folder.name}
                  </span>
                </div>
              )}
              {note.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {note.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-1 rounded terminal-text"
                      style={{ backgroundColor: tag.color + '33', color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Note Detail */}
      <div className="flex-1 flex flex-col cyber-panel gradient-bg">
        {showNewNote ? (
          <NewNoteForm
            folders={folders}
            tags={tags}
            onSave={createNote}
            onCancel={() => setShowNewNote(false)}
          />
        ) : showNewFolder ? (
          <NewFolderForm
            onSave={createFolder}
            onCancel={() => setShowNewFolder(false)}
          />
        ) : showNewTag ? (
          <NewTagForm
            onSave={createTag}
            onCancel={() => setShowNewTag(false)}
          />
        ) : selectedNote ? (
          <>
            <div className="p-4 border-b border-cyan-900">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-2xl font-bold px-2 py-1 cyber-input terminal-text"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold neon-text-green terminal-text">
                      {selectedNote.title}
                    </h2>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={updateNote}
                        className="px-4 py-2 neon-glow-btn-green terminal-text text-sm"
                      >
                        [ SAVE ]
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 neon-glow-btn terminal-text text-sm"
                      >
                        [ CANCEL ]
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditTitle(selectedNote.title);
                          setEditContent(selectedNote.content);
                          setEditFolderId(selectedNote.folderId);
                          setEditTagIds(selectedNote.tags.map(t => t.id));
                        }}
                        className="px-4 py-2 neon-glow-btn terminal-text text-sm"
                      >
                        [ EDIT ]
                      </button>
                      <button
                        onClick={() => archiveNote(selectedNote.id)}
                        className="px-4 py-2 neon-glow-btn-yellow terminal-text text-sm"
                      >
                        [ ARCHIVE ]
                      </button>
                      <button
                        onClick={() => deleteNote(selectedNote.id)}
                        className="px-4 py-2 neon-glow-btn-red terminal-text text-sm"
                      >
                        [ DELETE ]
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm terminal-text neon-text-green mb-1">
                      &gt; FOLDER
                    </label>
                    <select
                      value={editFolderId || ''}
                      onChange={(e) => setEditFolderId(e.target.value || null)}
                      className="w-full px-3 py-2 cyber-input terminal-text text-sm"
                    >
                      <option value="">[ NO FOLDER ]</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm terminal-text neon-text-magenta mb-1">
                      &gt; TAGS
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1 text-sm terminal-text ${
                            editTagIds.includes(tag.id)
                              ? 'neon-glow-btn-magenta'
                              : 'border border-cyan-900 neon-text opacity-70 hover:opacity-100'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full p-4 cyber-input terminal-text resize-none text-sm"
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap neon-text text-sm terminal-text">{selectedNote.content}</pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center neon-text terminal-text opacity-70">
            &gt;&gt; SELECT OR CREATE A NOTE
          </div>
        )}
      </div>
    </div>
  );
}

function NewNoteForm({
  folders,
  tags,
  onSave,
  onCancel,
}: {
  folders: Folder[];
  tags: Tag[];
  onSave: (title: string, content: string, folderId: string | null, tagIds: string[]) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <>
      <div className="p-4 border-b border-cyan-900 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="[ NOTE TITLE ]"
          className="w-full text-2xl font-bold px-2 py-1 cyber-input terminal-text"
        />

        <div>
          <label className="block text-sm terminal-text neon-text-green mb-1">
            &gt; FOLDER
          </label>
          <select
            value={folderId || ''}
            onChange={(e) => setFolderId(e.target.value || null)}
            className="w-full px-3 py-2 cyber-input terminal-text text-sm"
          >
            <option value="">[ NO FOLDER ]</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm terminal-text neon-text-magenta mb-1">
            &gt; TAGS
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 text-sm terminal-text ${
                  selectedTagIds.includes(tag.id)
                    ? 'neon-glow-btn-magenta'
                    : 'border border-cyan-900 neon-text opacity-70 hover:opacity-100'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="[ NOTE CONTENT ]"
          className="w-full h-full p-4 cyber-input terminal-text resize-none text-sm"
        />
      </div>

      <div className="p-4 border-t border-cyan-900 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-6 py-2 neon-glow-btn terminal-text text-sm"
        >
          [ CANCEL ]
        </button>
        <button
          onClick={() => onSave(title, content, folderId, selectedTagIds)}
          disabled={!title || !content}
          className="px-6 py-2 neon-glow-btn-green terminal-text disabled:opacity-50 text-sm"
        >
          [ SAVE ]
        </button>
      </div>
    </>
  );
}

function NewFolderForm({
  onSave,
  onCancel,
}: {
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#00ffff');

  const colors = [
    '#00ffff', '#ff00ff', '#00ff00', '#ffff00',
    '#ff6600', '#9d00ff', '#ff0055', '#14b8a6'
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md cyber-panel neon-border p-6 relative">
        <div className="absolute top-2 left-2 neon-text-green text-xl">╔</div>
        <div className="absolute top-2 right-2 neon-text-green text-xl">╗</div>
        <div className="absolute bottom-2 left-2 neon-text-green text-xl">╚</div>
        <div className="absolute bottom-2 right-2 neon-text-green text-xl">╝</div>

        <h2 className="text-xl font-bold mb-4 neon-text-green terminal-text">[ NEW FOLDER ]</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm terminal-text neon-text mb-2">
              &gt; FOLDER NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="[ WORK, PERSONAL... ]"
              className="w-full px-3 py-2 cyber-input terminal-text"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm terminal-text neon-text mb-2">
              &gt; COLOR
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''}`}
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 15px ${c}` : 'none' }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 neon-glow-btn terminal-text"
          >
            [ CANCEL ]
          </button>
          <button
            onClick={() => onSave(name, color)}
            disabled={!name}
            className="flex-1 px-4 py-2 neon-glow-btn-green terminal-text disabled:opacity-50"
          >
            [ CREATE ]
          </button>
        </div>
      </div>
    </div>
  );
}

function NewTagForm({
  onSave,
  onCancel,
}: {
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ff00ff');

  const colors = [
    '#ff00ff', '#00ffff', '#00ff00', '#ffff00',
    '#ff6600', '#9d00ff', '#ff0055', '#14b8a6'
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md cyber-panel neon-border-magenta p-6 relative">
        <div className="absolute top-2 left-2 neon-text-magenta text-xl">╔</div>
        <div className="absolute top-2 right-2 neon-text-magenta text-xl">╗</div>
        <div className="absolute bottom-2 left-2 neon-text-magenta text-xl">╚</div>
        <div className="absolute bottom-2 right-2 neon-text-magenta text-xl">╝</div>

        <h2 className="text-xl font-bold mb-4 neon-text-magenta terminal-text">[ NEW TAG ]</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm terminal-text neon-text mb-2">
              &gt; TAG NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="[ URGENT, TODO... ]"
              className="w-full px-3 py-2 cyber-input terminal-text"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm terminal-text neon-text mb-2">
              &gt; COLOR
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''}`}
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 15px ${c}` : 'none' }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 neon-glow-btn terminal-text"
          >
            [ CANCEL ]
          </button>
          <button
            onClick={() => onSave(name, color)}
            disabled={!name}
            className="flex-1 px-4 py-2 neon-glow-btn-magenta terminal-text disabled:opacity-50"
          >
            [ CREATE ]
          </button>
        </div>
      </div>
    </div>
  );
}
