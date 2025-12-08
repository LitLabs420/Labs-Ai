'use client';

import React, { useState, useCallback } from 'react';
import { Widget } from '@/lib/layout-manager';
import { GripVertical, X } from 'lucide-react';

interface DraggableGridProps {
  widgets: Widget[];
  children: (widget: Widget) => React.ReactNode;
  onPositionChange: (widgetId: string, position: Widget['position']) => void;
  onToggle: (widgetId: string, enabled: boolean) => void;
  gridColumns?: number;
  rowHeight?: number;
  editable?: boolean;
}

interface DragState {
  widgetId: string | null;
  startX: number;
  startY: number;
  startPosition: Widget['position'];
}

export function DraggableGrid({
  widgets,
  children,
  onPositionChange,
  onToggle,
  gridColumns = 12,
  rowHeight = 100,
  editable = false,
}: DraggableGridProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);

  const cellWidth = Math.floor(100 / gridColumns);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, widgetId: string) => {
      if (!editable) return;
      
      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) return;

      setDragState({
        widgetId,
        startX: e.clientX,
        startY: e.clientY,
        startPosition: widget.position,
      });
    },
    [editable, widgets]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      const gridPixelWidth = (document.documentElement.clientWidth * cellWidth) / 100;
      const colDelta = Math.round(deltaX / gridPixelWidth);
      const rowDelta = Math.round(deltaY / rowHeight);

      const newX = Math.max(0, dragState.startPosition.x + colDelta);
      const newY = Math.max(0, dragState.startPosition.y + rowDelta);

      // Prevent widget from going off grid
      const maxX = Math.max(0, gridColumns - dragState.startPosition.width);
      const newPosition = {
        ...dragState.startPosition,
        x: Math.min(newX, maxX),
        y: newY,
      };

      onPositionChange(dragState.widgetId, newPosition);
    },
    [dragState, onPositionChange, gridColumns, cellWidth, rowHeight]
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  React.useEffect(() => {
    if (!editable || !dragState) return;

    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, editable, handleMouseMove, handleMouseUp]);

  const enabledWidgets = widgets.filter(w => w.enabled);

  return (
    <div
      className="relative w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: '1rem',
        padding: '1rem',
      }}
    >
      {enabledWidgets.map(widget => (
        <div
          key={widget.id}
          className="relative"
          style={{
            gridColumn: `${widget.position.x + 1} / span ${widget.position.width}`,
            gridRow: `${widget.position.y + 1} / span ${widget.position.height}`,
            minHeight: `${widget.position.height * rowHeight}px`,
          }}
          onMouseEnter={() => editable && setHoveredWidget(widget.id)}
          onMouseLeave={() => setHoveredWidget(null)}
        >
          <div
            className={`
              relative h-full rounded-lg border transition-all
              ${editable ? 'border-dashed border-blue-400 cursor-move' : 'border-gray-200'}
              ${hoveredWidget === widget.id ? 'shadow-lg' : 'shadow'}
            `}
          >
            {/* Edit Controls */}
            {editable && hoveredWidget === widget.id && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onMouseDown={e => {
                    e.stopPropagation();
                    handleMouseDown(e, widget.id);
                  }}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Drag to move"
                >
                  <GripVertical size={16} />
                </button>
                <button
                  onClick={() => onToggle(widget.id, false)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  title="Hide widget"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Widget Content */}
            <div className="h-full overflow-auto">
              {children(widget)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
