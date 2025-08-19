import { useState } from 'react'
import { DndContext, CollisionDetection, pointerWithin, closestCorners, useSensor, useSensors, useDroppable, PointerSensor, KeyboardSensor, DragEndEvent, DragStartEvent, DragOverEvent, DragCancelEvent, DragOverlay, UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Item {
  id: string
  content: string
}

interface Container {
  id: string
  title: string
  items: Item[]
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
      className={`cursor-grab touch-none rounded-md borderbg-white p-3 active:cursor-grabbing dark:border-gray-700 dark:bg-gray-700 ${isDragging ? 'z-10 opacity-50 shoadow-md' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">⋮⋮</span>
        <span className="dark:text-gray-200">{content}</span>
      </div>
    </li>
  );
}

function DroppableContainer({id, title, items}: {id:string, title: string, items: Item[]}) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
    ref={setNodeRef}
    className="flex h-full min-h-40 flex-col rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
  >
    <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-200">
      {title}
    </h3>
    <div className="flex-1">
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id} content={item.content} />
        ))}
      </ul>
      </SortableContext>
      {items.length === 0 && (
        <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/30">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop items here
          </p>
        </div>
      )}
    </div>
  </div>

  )
}

function ItemOverlay({ children}: { children?: React.ReactNode }) {
  return (
    <div className="curosr-grabbing touch-none rounded-md border bg-white p-3 shadow-md dark:border-gray-700 dark:bg-gray-700">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">⋮⋮</span>
        <span className="dark:text-gray-200">{children || 'Dragging...'}</span>
      </div>
    </div>
  )
}

export default function Kanban() {  // rename MultipleContainers?

  const [containers, setContainers] = useState<Container[]>([
  {
    id: 'todo',
    title: 'To Do',
    items: [
      { id: 'task-1', content: 'Research @dnd-kit' },
      { id: 'task-2', content: 'Create basic example' },
      { id: 'task-3', content: 'Write tutorial' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    items: [{ id: 'task-4', content: 'Record demo video' }],
  },
  {
    id: 'done',
    title: 'Done',
    items: [{ id: 'task-5', content: 'Setup project' }],
  },
  ])
  void setContainers

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  void activeId

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 50,  // Small delay helps distinguish click from drag on mobile
        tolerance: 5,  // Minimum distance in pixels to activate dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function findContainerId(
    itemId: UniqueIdentifier
  ): UniqueIdentifier | undefined {
    return containers.find(container => container.items.some(item => item.id === itemId))?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const activeContainerId = findContainerId(activeId);
    var overContainerId = findContainerId(overId);

    console.log('DragOver:', {
      activeId,
      overId,
      activeContainerId,
      overContainerId,
    });


    /* WTF!!! */
    if (typeof overContainerId === 'undefined' && overId) {
      overContainerId = overId; // If over is not a container, use its ID
    }


    if (!activeContainerId || !overContainerId) return
    if (activeContainerId === overContainerId && activeId !== overId) {
      // handled with DragEnd
      return
    }

    if (activeContainerId === overContainerId) return
    setContainers((prev) => {
      const activeContainer = prev.find((c) => c.id === activeContainerId)
      if (!activeContainer) return prev;

      const activeItem = activeContainer.items.find((item) => item.id === activeId)
      if (!activeItem) return prev

      const newContainers = prev.map((container) => {
        if (container.id === activeContainerId) {
          return {
            ...container,
            items: container.items.filter((item) => item.id !== activeId),
          }
        }
        if (container.id === overContainerId) {
          if (overId === overContainerId) {
            return {
              ...container,
              items: [...container.items, activeItem],
            }
          }
        }
        const overItemIndex = container.items.findIndex((item) => item.id === overId)
        if (overItemIndex !== -1) {
          return {
            ...container,
            items: [
              ...container.items.slice(0, overItemIndex+1),
              activeItem,
              ...container.items.slice(overItemIndex+1),
            ],
          }
        }
        return container
      })

      return newContainers
    })
  }

  function handleDragCancel(event: DragCancelEvent) {
    void event
    setActiveId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      // If the item was dropped outside any container, reset activeId
      setActiveId(null);
      return;
    }
    const activeId = active.id;
    const overId = over.id;
    const activeContainerId = findContainerId(activeId);
    const overContainerId = findContainerId(overId);
    if (!activeContainerId || !overContainerId) {
      setActiveId(null);
      return
    }
    if (activeContainerId === overContainerId && activeId !== overId) {
      const containerIndex = containers.findIndex(c => c.id === activeContainerId);
      if (containerIndex === -1) {
        setActiveId(null);
        return;
      }
      const container = containers[containerIndex];
      const activeIndex = container.items.findIndex(item => item.id === activeId);
      const overIndex = container.items.findIndex(item => item.id === overId);
      if (activeIndex !== -1 && overIndex !== -1) {
        const newItems = arrayMove(container.items, activeIndex, overIndex);
        setContainers((containers) => {
          return containers.map((c, i) => {
            if (i === containerIndex) {
              return {
                ...c,
                items: newItems,
              }
            }
            return c;
          })
        })
      }
    }
    setActiveId(null);
  }

  const getActiveItem = () => {
    for (const container of containers) {
      const item = container.items.find(i => i.id === activeId);
      if (item) return item;
    }
    return null
  }

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-4 text-xl font-bold dark:text-white">Kanban Board</h2>

      <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      >
      <div className="grid gap-4 md:grid-cols-3">
        {containers.map((container) => (
          <DroppableContainer key={container.id} id={container.id} title={container.title} items={container.items} />
        ))}
      </div>
      <DragOverlay
      dropAnimation={({duration:150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'})}>
        {activeId ? (
          <ItemOverlay>
            {getActiveItem()?.content}
          </ItemOverlay>
        ) : null}
      </DragOverlay>
      </DndContext>
    </div>
  )
}
