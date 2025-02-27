import MDEditor from '@uiw/react-md-editor';
import { cva } from 'class-variance-authority';
import { ChevronDown, Tag, UserX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '~/lib/utils.ts';
import type { Task } from '~/modules/common/electric/electrify.ts';
import { Button } from '~/modules/ui/button';
import { Card, CardContent } from '~/modules/ui/card';
import { Checkbox } from '../../ui/checkbox.tsx';
import { impacts } from './task-selectors/select-impact.tsx';
import { type TaskStatus, statusVariants, taskStatuses } from './task-selectors/select-status.tsx';
import { taskTypes } from './task-selectors/select-task-type.tsx';
import './style.css';

import { AvatarWrap } from '~/modules/common/avatar-wrap.tsx';
import { AvatarGroup, AvatarGroupList, AvatarOverflowIndicator } from '~/modules/ui/avatar';
import { Badge } from '../../ui/badge.tsx';
import { NotSelected } from './task-selectors/impact-icons/not-selected.tsx';

import { type Edge, attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type { DropTargetRecord, ElementDragPayload } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { getDraggableItemData } from '~/lib/utils';
import { DropIndicator } from '~/modules/common/drop-indicator';
import type { DraggableItemData } from '~/types';
import ExpandedTask from './task-expanded.tsx';
import type { Mode } from '~/store/theme.ts';

type TaskDraggableItemData = DraggableItemData<Task> & { type: 'task' };

export const isTaskData = (data: Record<string | symbol, unknown>): data is TaskDraggableItemData => {
  return data.dragItem === true && typeof data.order === 'number' && data.type === 'task';
};

interface TaskProps {
  task: Task;
  mode: Mode;
  isExpanded: boolean;
  isSelected: boolean;
  isFocused: boolean;
  handleTaskChange: (field: keyof Task, value: string | number | null, taskId: string) => void;
  handleTaskActionClick: (task: Task, field: keyof Task, trigger: HTMLElement) => void;
  setIsExpanded?: (exp: boolean) => void;
  handleTaskSelect?: (selected: boolean, taskId: string) => void;
}

export function TaskCard({
  task,
  mode,
  isSelected,
  isFocused,
  isExpanded,
  handleTaskChange,
  handleTaskSelect,
  handleTaskActionClick,
  setIsExpanded,
}: TaskProps) {
  const { t } = useTranslation();

  const taskRef = useRef<HTMLDivElement>(null);
  const taskDragRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const selectedImpact = task.impact !== null ? impacts[task.impact] : null;

  const variants = cva('task-card', {
    variants: {
      dragging: {
        over: 'ring-2 opacity-30',
        overlay: 'ring-2 ring-primary',
      },
      status: {
        0: 'to-sky-500/10 border-b-sky-500/20',
        1: '',
        2: 'to-slate-500/10 border-b-slate-500/20',
        3: 'to-lime-500/10 border-b-lime-500/20',
        4: 'to-yellow-500/10 border-b-yellow-500/20',
        5: 'to-orange-500/10 border-b-orange-500/20',
        6: 'to-green-500/10 border-b-green-500/20',
      },
    },
  });

  const dispatchCustomFocusEvent = (taskId: string, projectId: string) => {
    const event = new CustomEvent('task-card-focus', {
      detail: {
        taskId,
        projectId,
      },
    });
    document.dispatchEvent(event);
  };

  const dragEnd = () => {
    setClosestEdge(null);
    setDragOver(false);
  };

  const isDragOver = ({ self, source }: { source: ElementDragPayload; self: DropTargetRecord }) => {
    setDragOver(true);
    if (!isTaskData(source.data) || !isTaskData(self.data)) return;
    setClosestEdge(extractClosestEdge(self.data));
  };

  // create draggable & dropTarget elements and auto scroll
  useEffect(() => {
    const element = taskRef.current;
    const dragElement = taskDragRef.current;
    const data = getDraggableItemData<Task>(task, task.sort_order, 'task', 'project');
    if (!element || !dragElement) return;

    return combine(
      draggable({
        element,
        dragHandle: dragElement,
        getInitialData: () => data,
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForExternal({
        element,
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          const data = source.data;
          return isTaskData(data) && data.item.id !== task.id && data.item.status === task.status && data.type === 'task';
        },
        getIsSticky: () => true,
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDragEnter: ({ self, source }) => isDragOver({ self, source }),
        onDrag: ({ self, source }) => isDragOver({ self, source }),
        onDragLeave: () => dragEnd(),
        onDrop: () => dragEnd(),
      }),
    );
  }, [task]);

  return (
    <Card
      onMouseDown={() => {
        if (document.activeElement === taskRef.current) return;
        taskRef.current?.focus();
      }}
      onFocus={() => {
        if (isFocused) return;
        dispatchCustomFocusEvent(task.id, task.project_id);
      }}
      tabIndex={0}
      ref={taskRef}
      className={cn(
        `group/task relative rounded-none border-0 border-b text-sm bg-transparent hover:bg-card/20 bg-gradient-to-br from-transparent focus:outline-none 
        focus-visible:none border-l-2 via-transparent via-60% to-100% opacity-${dragging ? '30' : '100'} 
        ${dragOver ? 'bg-card/20' : ''} 
        ${isFocused ? 'border-l-primary is-focused' : 'border-l-transparent'}
        ${isExpanded ? 'is-expanded' : 'is-collapsed'}`,
        variants({
          status: task.status as TaskStatus,
        }),
      )}
    >
      <CardContent id={`${task.id}-content`} ref={taskDragRef} className="pl-1.5 pt-1 pb-2 pr-2 space-between flex flex-col relative">
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 w-full">
            <div className="flex flex-col justify-between gap-0.5 relative">
              <Button
                id="type"
                onClick={(event) => handleTaskActionClick(task, 'type', event.currentTarget)}
                aria-label="Set type"
                variant="ghost"
                size="xs"
                className="relative group-hover/task:opacity-100 group-[.is-focused]/task:opacity-100 opacity-70"
              >
                {taskTypes[taskTypes.findIndex((t) => t.value === task.type)]?.icon() || ''}
              </Button>
            </div>
            <div className="flex flex-col grow gap-2 mt-1.5">
              {!isExpanded && setIsExpanded && (
                <div className="inline">
                  <MDEditor.Markdown
                    source={task.summary || ''}
                    style={{ color: mode === 'dark' ? '#F2F2F2' : '#17171C' }}
                    className="inline summary before:!content-none after:!content-none prose font-light text-start max-w-none"
                  />

                  <div className="opacity-50 group-hover/task:opacity-70 group-[.is-focused]/task:opacity-70 text-xs inline ml-1 font-light gap-1">
                    <Button variant="link" size="micro" onClick={() => setIsExpanded(true)} className="inline-flex py-0 h-5 ml-1">
                      {t('common:more').toLowerCase()}
                    </Button>
                    {task.subTasks.length > 0 && (
                      <Button variant="ghost" size="micro" onClick={() => setIsExpanded(true)} className="inline-flex py-0 h-5 ml-1 gap-[.1rem]">
                        <span className="text-success">{task.subTasks.filter((t) => t.status === 6).length}</span>
                        <span className="font-light">/</span>
                        <span className="font-light">{task.subTasks.length}</span>
                      </Button>
                    )}
                    {/* <Button variant="ghost" size="micro" onClick={() => setIsExpanded(true)} className="inline-flex py-0 h-5 ml-1 gap-[.07rem]">
                        <Paperclip size={10} className="transition-transform -rotate-45" />
                        <span>3</span>
                      </Button> */}
                  </div>
                </div>
              )}
              <ExpandedTask
                mode={mode}
                task={task}
                taskRef={taskRef}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                handleTaskChange={handleTaskChange}
              />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1">
            {handleTaskSelect && (
              <Checkbox
                className="group-hover/task:opacity-100 mb-1.5 border-foreground/25 data-[state=checked]:border-primary ml-1.5 group-[.is-focused]/task:opacity-100 opacity-70"
                checked={isSelected}
                onCheckedChange={(checked) => handleTaskSelect(!!checked, task.id)}
              />
            )}
            {task.type !== 'bug' && (
              <Button
                id="impact"
                onClick={(event) => handleTaskActionClick(task, 'impact', event.currentTarget)}
                aria-label="Set impact"
                variant="ghost"
                size="xs"
                className="relative group-hover/task:opacity-100 group-[.is-focused]/task:opacity-100 opacity-70"
              >
                {selectedImpact === null ? (
                  <NotSelected className="size-4 fill-current" aria-hidden="true" title="Set impact" />
                ) : (
                  <selectedImpact.icon className="size-4 fill-current" aria-hidden="true" title="Set impact" />
                )}
              </Button>
            )}

            {
              // TODO: Bind the entire task object instead of individual IDs
            }
            <Button
              id="labels"
              onClick={(event) => handleTaskActionClick(task, 'labels', event.currentTarget)}
              aria-label="Set labels"
              variant="ghost"
              size="xs"
              className="relative flex h-auto justify-start font-light py-0.5 min-h-8 min-w-8 group-hover/task:opacity-70 group-[.is-focused]/task:opacity-70 opacity-50"
            >
              <div className="flex truncate flex-wrap gap-[.07rem]">
                {task.virtualLabels.length > 0 ? (
                  task.virtualLabels.map(({ name, id }) => {
                    return (
                      <div key={id} className="flex flex-wrap max-w-24 align-center justify-center items-center rounded-full border px-0 bg-border">
                        <Badge
                          variant="outline"
                          key={id}
                          className="inline-block border-0 max-w-32 truncate font-normal text-[.75rem] h-5 bg-transparent last:mr-0 leading-4"
                        >
                          {name}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <Tag size={16} className="opacity-50" />
                )}
              </div>
            </Button>

            <div className="flex gap-1 ml-auto mr-1">
              <Button
                id="assigned_to"
                onClick={(event) => handleTaskActionClick(task, 'assigned_to', event.currentTarget)}
                aria-label="Assign"
                variant="ghost"
                size="xs"
                className="relative flex justify-start gap-2 group-hover/task:opacity-100 group-[.is-focused]/task:opacity-100 opacity-70"
              >
                {task.virtualAssignedTo.length > 0 ? (
                  <AvatarGroup limit={3}>
                    <AvatarGroupList>
                      {task.virtualAssignedTo.map((user) => (
                        <AvatarWrap type="user" key={user.id} id={user.id} name={user.name} url={user.thumbnailUrl} className="h-6 w-6 text-xs" />
                      ))}
                    </AvatarGroupList>
                    <AvatarOverflowIndicator className="h-6 w-6 text-xs" />
                  </AvatarGroup>
                ) : (
                  <UserX className="h-4 w-4 opacity-50" />
                )}
              </Button>
              <>
                <Button
                  id="status"
                  onClick={() => handleTaskChange('status', task.status + 1, task.id)}
                  disabled={(task.status as TaskStatus) === 6}
                  variant="outlineGhost"
                  size="xs"
                  className={cn(
                    'relative border-r-0 rounded-r-none font-normal [&:not(.absolute)]:active:translate-y-0 disabled:opacity-100 mr-1',
                    statusVariants({ status: task.status as TaskStatus }),
                  )}
                >
                  {t(taskStatuses[task.status as TaskStatus].action)}
                </Button>
                <Button
                  onClick={(event) => handleTaskActionClick(task, 'status', event.currentTarget)}
                  aria-label="Set status"
                  variant="outlineGhost"
                  size="xs"
                  className={cn(
                    'relative rounded-none rounded-r -ml-2 [&:not(.absolute)]:active:translate-y-0',
                    statusVariants({ status: task.status as TaskStatus }),
                  )}
                >
                  <ChevronDown size={12} />
                </Button>
              </>
            </div>
          </div>
        </div>
      </CardContent>
      {closestEdge && <DropIndicator className="h-0.5" edge={closestEdge} gap={0.2} />}
    </Card>
  );
}
