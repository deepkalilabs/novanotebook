// app/store.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { NotebookCell } from './types';

interface NotebookStore {
  cells: NotebookCell[];
  maxExecutionCount: number;
  addCell: () => void;
  updateCellCode: (id: string, code: string) => void;
  updateCellOutput: (id: string, output: string) => void;
  deleteCell: (id: string) => void;
  moveCellUp: (id: string) => void;
  moveCellDown: (id: string) => void;
  setCells: (cells: NotebookCell[]) => void;
}

export const useNotebookStore = create<NotebookStore>((set) => ({
  cells: [],
  maxExecutionCount: 0,
  
  addCell: () => set((state) => ({
    cells: [...state.cells, {
      id: uuidv4(),
      code: '',
      output: '',
      executionCount: 0
    }]
  })),
  
  updateCellCode: (id, code) => set((state) => ({
    cells: state.cells.map(cell => 
      cell.id === id ? { ...cell, code } : cell
    )
  })),
  
  updateCellOutput: (id, output) => set((state) => ({
    cells: state.cells.map(cell =>
      cell.id === id ? { ...cell, output, executionCount: state.maxExecutionCount + 1 } : cell
    ),
    maxExecutionCount: state.maxExecutionCount + 1
  })),
  
  deleteCell: (id) => set((state) => ({
    cells: state.cells.filter(cell => cell.id !== id)
  })),
  
  moveCellUp: (id) => set((state) => {
    const index = state.cells.findIndex(cell => cell.id === id);
    if (index <= 0) return state;
    
    const newCells = [...state.cells];
    [newCells[index - 1], newCells[index]] = [newCells[index], newCells[index - 1]];
    return { cells: newCells };
  }),
  
  moveCellDown: (id) => set((state) => {
    const index = state.cells.findIndex(cell => cell.id === id);
    if (index === -1 || index === state.cells.length - 1) return state;
    
    const newCells = [...state.cells];
    [newCells[index], newCells[index + 1]] = [newCells[index + 1], newCells[index]];
    return { cells: newCells };
  }),
  
  setCells: (cells) => set({ cells })
}));