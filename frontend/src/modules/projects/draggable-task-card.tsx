import { type Edge, attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type { DropTargetRecord, ElementDragPayload } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { useContext, useEffect, useRef, useState } from 'react';
import { getDraggableItemData } from '~/lib/utils';
import type { DraggableItemData } from '~/types';
import { DropIndicator } from '../common/drop-indicator';
import type { Task } from '../common/root/electric';
import { TaskContext } from './board-column';
import { TaskCard } from './task-card';

export const DraggableTaskCard = ({ taskIndex }: { taskIndex: number }) => {
  const taskDragRef = useRef(null);
  const taskDragButtonRef = useRef<HTMLButtonElement>(null);
  const { task, focusedTaskId } = useContext(TaskContext);
  const [dragging, setDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  type TaskDraggableItemData = DraggableItemData<Task> & { type: 'task' };

  const dragIsOn = () => {
    setClosestEdge(null);
    setIsDraggedOver(false);
  };

  const dragIsOver = ({ self, source }: { source: ElementDragPayload; self: DropTargetRecord }) => {
    setIsDraggedOver(true);
    if (!isTaskData(source.data) || !isTaskData(self.data)) return;
    if (source.data.index === self.data.index - 1 && source.data.item.project_id === self.data.item.project_id) {
      setClosestEdge('bottom');
      return;
    }
    if (source.data.index === self.data.index + 1 && source.data.item.project_id === self.data.item.project_id) {
      setClosestEdge('top');
      return;
    }
    setClosestEdge(extractClosestEdge(self.data));
  };

  const isTaskData = (data: Record<string | symbol, unknown>): data is TaskDraggableItemData => {
    return data.dragItem === true && typeof data.index === 'number' && data.type === 'task';
  };

  // create draggable & dropTarget elements and auto scroll
  useEffect(() => {
    const element = taskDragRef.current;
    const dragButton = taskDragButtonRef.current;
    const data = getDraggableItemData<Task>(task, taskIndex, 'task');
    if (!element || !dragButton) return;

    return combine(
      draggable({
        element,
        dragHandle: dragButton,
        getInitialData: () => data,
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForExternal({
        element: element,
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          const data = source.data;
          return isTaskData(data) && data.item.id !== task.id && data.item.status === task.status && data.type === 'task';
        },
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDragEnter: ({ self, source }) => dragIsOver({ self, source }),
        onDrag: ({ self, source }) => dragIsOver({ self, source }),
        onDragLeave: () => dragIsOn(),
        onDrop: () => dragIsOn(),
      }),
    );
  }, [task]);
  return (
    <>
      <TaskCard
        // focusedTask={focusedTask}
        // setFocusedTask={setFocusedTask}
        // task={task}
        taskRef={taskDragRef}
        taskDragButtonRef={taskDragButtonRef}
        dragging={dragging}
        dragOver={isDraggedOver}
        className={`relative border-l-2 ${focusedTaskId === task.id ? 'border-l-primary' : 'border-l-transparent'}`}
      />

      {closestEdge && <DropIndicator edge={closestEdge} />}
    </>
  );
};
