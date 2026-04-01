import { useState, useCallback } from 'react';
import { getTodos, saveTodos } from '../services/settings.service';
import { pushSingleKey } from '../services/sync.service';
import { CACHE_KEYS } from '../lib/cache';
import type { TodoItem } from '../types';

function syncTodos() { pushSingleKey(CACHE_KEYS.todos).catch(() => {}); }

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>(getTodos);

  const addTodo = useCallback((text: string) => {
    setTodos((prev) => {
      const next = [
        ...prev,
        { id: Date.now(), text, done: false, date: new Date().toISOString().slice(0, 10) },
      ];
      saveTodos(next); syncTodos();
      return next;
    });
  }, []);

  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      saveTodos(next); syncTodos();
      return next;
    });
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTodos(next); syncTodos();
      return next;
    });
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo };
}
