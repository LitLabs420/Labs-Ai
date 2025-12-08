'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, Play, Trophy, Clock } from 'lucide-react';
import type { GameLibraryItem, GameSession } from '@/lib/xbox-gaming';

interface XboxGamingWidgetProps {
  userId: string;
}

export function XboxGamingWidget({ userId }: XboxGamingWidgetProps) {
  const [games, setGames] = useState<GameLibraryItem[]>([]);
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<GameLibraryItem | null>(null);
  const [libraryType, setLibraryType] = useState<'all' | 'cloud' | 'emulator'>('all');

  // Fetch game library
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/xbox/library?type=${libraryType}`);
        if (!response.ok) throw new Error('Failed to fetch library');
        const data = await response.json();
        setGames(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading library');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [libraryType]);

  const handleStartSession = async (game: GameLibraryItem) => {
    try {
      setLoading(true);
      const response = await fetch('/api/xbox/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          type: game.platform,
          emulator: game.emulator,
          resolution: 'hd',
        }),
      });

      if (!response.ok) throw new Error('Failed to start session');
      const data = await response.json();
      setActiveSession(data.data);
      setSelectedGame(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error starting session');
    } finally {
      setLoading(false);
    }
  };

  if (activeSession) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 to-black rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="w-6 h-6" />
          <h3 className="text-lg font-bold">Gaming Session Active</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-purple-800/30 rounded p-3">
            <p className="text-sm text-gray-300">Currently Playing</p>
            <p className="font-semibold text-lg">
              {games.find(g => g.id === activeSession.gameId)?.title || 'Game'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800/30 rounded p-2">
              <p className="text-xs text-gray-400">Resolution</p>
              <p className="font-semibold uppercase text-sm">{activeSession.resolution}</p>
            </div>
            <div className="bg-gray-800/30 rounded p-2">
              <p className="text-xs text-gray-400">FPS</p>
              <p className="font-semibold text-sm">{activeSession.fps}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveSession(null)}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-semibold"
          >
            End Session
          </button>
        </div>
      </div>
    );
  }

  if (selectedGame) {
    return (
      <div className="h-full bg-gray-900 rounded-lg p-6 text-white">
        <button
          onClick={() => setSelectedGame(null)}
          className="mb-4 text-sm text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <div className="space-y-4">
          <img
            src={selectedGame.image}
            alt={selectedGame.title}
            className="w-full h-32 object-cover rounded"
          />
          <div>
            <h3 className="font-bold text-lg">{selectedGame.title}</h3>
            <p className="text-sm text-gray-400">{selectedGame.description}</p>
          </div>
          <div className="flex gap-2">
            {selectedGame.genre.map(g => (
              <span key={g} className="text-xs bg-purple-700 px-2 py-1 rounded">
                {g}
              </span>
            ))}
          </div>
          <button
            onClick={() => handleStartSession(selectedGame)}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 py-2 rounded font-semibold flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Starting...' : 'Play'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Gamepad2 className="w-6 h-6 text-purple-400" />
        <h3 className="text-lg font-bold">Game Library</h3>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(['all', 'cloud', 'emulator'] as const).map(type => (
          <button
            key={type}
            onClick={() => setLibraryType(type)}
            className={`px-3 py-1 rounded text-sm capitalize ${
              libraryType === type
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {games.map(game => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="bg-gray-800 hover:bg-gray-700 rounded p-3 cursor-pointer transition"
            >
              <div className="flex gap-3">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{game.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{game.platform}</p>
                  {game.playTime && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {game.playTime}m
                    </p>
                  )}
                </div>
                {game.rating && (
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold">{game.rating}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
