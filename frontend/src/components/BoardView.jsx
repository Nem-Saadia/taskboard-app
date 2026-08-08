import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Trash2, Loader2, GripVertical, X } from 'lucide-react';

export default function BoardView() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [newCardTitles, setNewCardTitles] = useState({});

  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async (boardToSelectId = null) => {
    try {
      const res = await API.get('/boards');
      setBoards(res.data);
      
      if (boardToSelectId) {
        const found = res.data.find(b => b.id === boardToSelectId);
        setSelectedBoard(found || res.data[0] || null);
      } else if (res.data.length > 0) {
        const stillExists = res.data.find(b => b.id === selectedBoard?.id);
        setSelectedBoard(stillExists || res.data[0]);
      } else {
        setSelectedBoard(null);
      }
    } catch (err) {
      console.error('Failed to fetch boards', err);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || isCreatingBoard) return;
    
    setIsCreatingBoard(true);
    const title = newBoardTitle;
    setNewBoardTitle('');

    try {
      const res = await API.post('/boards', { title });
      await fetchBoards(res.data.id);
    } catch (err) {
      console.error(err);
      setNewBoardTitle(title);
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!selectedBoard || !window.confirm(`Delete board "${selectedBoard.title}"?`)) return;

    try {
      await API.delete(`/boards/${selectedBoard.id}`);
      setSelectedBoard(null);
      await fetchBoards();
    } catch (err) {
      console.error('Failed to delete board', err);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim() || !selectedBoard || isCreatingList) return;

    setIsCreatingList(true);
    const title = newListTitle;
    setNewListTitle('');

    try {
      await API.post(`/boards/${selectedBoard.id}/lists`, { title });
      await fetchBoards(selectedBoard.id);
    } catch (err) {
      console.error(err);
      setNewListTitle(title);
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleCreateCard = async (listId) => {
    const title = newCardTitles[listId];
    if (!title || !title.trim()) return;

    setNewCardTitles(prev => ({ ...prev, [listId]: '' }));

    try {
      await API.post(`/boards/lists/${listId}/cards`, { title });
      await fetchBoards(selectedBoard.id);
    } catch (err) {
      console.error(err);
      setNewCardTitles(prev => ({ ...prev, [listId]: title }));
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await API.delete(`/boards/cards/${cardId}`);
      await fetchBoards(selectedBoard.id);
    } catch (err) {
      console.error('Failed to delete card', err);
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, cardId) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    if (!draggedCardId) return;

    try {
      await API.put(`/boards/cards/${draggedCardId}/move?target_list_id=${targetListId}`);
      setDraggedCardId(null);
      await fetchBoards(selectedBoard.id);
    } catch (err) {
      console.error('Failed to move card', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- BOARD SELECTOR & CREATION BAR --- */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400">Select Board:</span>
          <select
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            value={selectedBoard?.id || ''}
            onChange={(e) => {
              const board = boards.find((b) => b.id === parseInt(e.target.value));
              setSelectedBoard(board);
            }}
          >
            {boards.length === 0 && <option value="">No boards created yet</option>}
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.title} (ID: {board.id})
              </option>
            ))}
          </select>

          {selectedBoard && (
            <button
              onClick={handleDeleteBoard}
              title="Delete current board"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Form to create new board */}
        <form onSubmit={handleCreateBoard} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New Board Title..."
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            disabled={isCreatingBoard}
          />
          <button
            type="submit"
            disabled={isCreatingBoard || !newBoardTitle.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            {isCreatingBoard ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Board
          </button>
        </form>
      </div>

      {/* --- KANBAN BOARD VIEW --- */}
      {selectedBoard ? (
        <div className="overflow-x-auto pb-6">
          <div className="flex items-start gap-4 min-w-max">
            {/* List Columns */}
            {selectedBoard.lists?.map((list) => (
              <div
                key={list.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, list.id)}
                className="bg-slate-800 w-80 rounded-xl p-4 border border-slate-700/80 shadow-lg flex flex-col max-h-[75vh]"
              >
                {/* List Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-200 text-base">{list.title}</h3>
                  <span className="text-xs font-semibold bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                    {list.cards?.length || 0}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 mb-3 min-h-[100px]">
                  {list.cards?.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/60 shadow-sm hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        <p className="text-sm text-slate-200 font-medium">{card.title}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Card Input */}
                <div className="pt-2 border-t border-slate-700/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="+ Add a task..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={newCardTitles[list.id] || ''}
                      onChange={(e) =>
                        setNewCardTitles({ ...newCardTitles, [list.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateCard(list.id);
                      }}
                    />
                    <button
                      onClick={() => handleCreateCard(list.id)}
                      disabled={!newCardTitles[list.id]?.trim()}
                      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 p-1.5 rounded-lg text-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* --- ADD NEW LIST COLUMN FORM --- */}
            <div className="bg-slate-800/40 border border-dashed border-slate-700/80 w-80 rounded-xl p-4">
              <form onSubmit={handleCreateList} className="space-y-3">
                <input
                  type="text"
                  placeholder="New list title (e.g., In Review)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  disabled={isCreatingList}
                />
                <button
                  type="submit"
                  disabled={isCreatingList || !newListTitle.trim()}
                  className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-sm py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {isCreatingList ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add List Column
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
          <p className="text-slate-400 mb-2">No board selected.</p>
          <p className="text-xs text-slate-500">Create a board using the top bar above to get started!</p>
        </div>
      )}
    </div>
  );
}