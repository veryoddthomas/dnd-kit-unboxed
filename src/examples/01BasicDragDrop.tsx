import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, pointerWithin } from '@dnd-kit/core';

function Draggable() {
  const { attributes,  listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-item',
  });

  const style = transform ? {
    transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
  }
  : undefined

  return (
    <div ref = {setNodeRef}
      style={style}
      className="h-24 w-24 cursor-grab touch-none rounded-md bg-blue-500 text-white p-4 active:cursor-grabbing dark:bg-blue-600"
      {...listeners}
      {...attributes}
      >
      Drag me
    </div>
  );
}

function Droppable({children}: {children?: React.ReactNode}) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'drop-zone',
  });

  return (
    <div ref={setNodeRef} className={`flex h-40 w-40 items-center justify-center rounded-md border-2 border-dashed ${
    isOver ? 'border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30' : 'border-gray-400 dark:border-gray-600'}`}>
      {children || (<span className="text-gray-500 dark:text-gray-400">Drop here</span>)}
    </div>
  );
}
export default function BasicDragDrop() {
  const [isDropped, setIsDropped] = useState(false)

  function handleDragEnd(event: DragEndEvent) {
    if (event.over && event.over.id === 'drop-zone') {
      setIsDropped(true);
    } else {
      setIsDropped(false);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}
    collisionDetection={pointerWithin}>
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
        {!isDropped && <Draggable /> }
        <Droppable>{isDropped && <Draggable/>}</Droppable>
      </div>
    </DndContext>
  )
}
