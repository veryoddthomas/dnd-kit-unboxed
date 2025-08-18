import { useState } from 'react'
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor, DragEndEvent, DragStartEvent, DragCancelEvent, DragOverlay, UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface Item {
  id: string
  content: string
}

export default function SortableList() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' },
    { id: '4', content: 'Item 4' },
    { id: '5', content: 'Item 5' },
  ])

  void setItems

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,  //Smal delay helps distinguish click from drag on mobile
        tolerance: 5, // Minimum distance in pixels to activate dragging
        distance: 8,  // Minimum distance in pixels to activate dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragCancel(event: DragCancelEvent) {
    void event
    setActiveId(null);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      // setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      const updatedItems = Array.from(items);
      updatedItems.splice(oldIndex, 1);
      updatedItems.splice(newIndex, 0, items[oldIndex]);

      setItems(updatedItems);
    }
  }

  function SortableItem({id, content}:{
    id: UniqueIdentifier;
    content: string;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });

    const style = {
      // transform: transform ? `translate3d(${transform?.x}px, ${transform?.y}px, 0)`: undefined,
      transform: CSS.Transform.toString(transform),
      transition,
      // opacity: isDragging ? 0.5 : 1,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        // className="rounded-md border bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
        {...attributes}
        {...listeners}
        className={`cursor-grab touch-none rounded-md border p-3 active:cursor-grabbing ${isDragging ? 'border-2 border-dashed border-gray-300 bg-gray-50 opacity-30 dark:border-gray-600 dark:bg-gray-800/30' : 'bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50'}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400">⋮⋮</span>
          <span className="dark:text-gray-200">{content}</span>
        </div>
      </li>
    );
  }

  const getActiveItem = () => {
    return items.find(item => item.id === activeId)?.content;
  }

  return (

    <div className="mx-auto w-full max-w-md rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold dark:text-white">Sortable List</h2>

      <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCenter}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
              <ul className="space-y-2">
        {items.map((item) => (
            <SortableItem
            key={item.id}
            id={item.id}
            content={item.content} />

            //TODO: RESUME AT 8:31 in https://youtu.be/ZALLXGVc_HU?t=511

          // <li
          //   key={item.id}
          //   className="rounded-md border bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          // >
          //   <div className="flex items-center gap-3">
          //     <span className="text-gray-500 dark:text-gray-400">⋮⋮</span>
          //     <span className="dark:text-gray-200">{item.content}</span>
          //   </div>
          // </li>
        ))}
    </ul>
    </SortableContext>
    <DragOverlay
    adjustScale={true}
    dropAnimation={{
      duration: 150,
      easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    }}
    >
      {activeId ? (
        <div className="cursor-grabbing rounded-md border bg-blue-50 p-3 shadow-md dark:border-blue-800 dark:bg-blue-900/30">
          <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400">⋮⋮</span>
          <span className="dark:text-gray-200">{getActiveItem()}</span>
          </div>
        </div>
      ) : null}
    </DragOverlay>
    </DndContext>
    </div>
  )
}
