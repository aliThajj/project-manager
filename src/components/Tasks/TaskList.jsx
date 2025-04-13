import { Reorder, useDragControls } from "framer-motion";
import { GripIcon, TrashIcon, CheckIcon } from '../UI/Icons';

// Create a separate component for the reorderable item
const TaskItem = ({
    task,
    onTaskUpdate,
    onTaskDelete,
    maxLength,
    isLoading,
    isDragging
}) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={task}
            as="div"
            className="w-full touch-none"
            dragListener={false}
            dragControls={dragControls}>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 w-full overflow-hidden touch-pan-y">
                {/* Drag Handle */}
                <span
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-auto"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        dragControls.start(e);
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        dragControls.start({
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                        });
                    }}
                >
                    <GripIcon className="text-gray-400 w-5 h-5" />
                </span>

                {/* Checkbox */}
                <button
                    onClick={() => onTaskUpdate(task.id, { completed: !task.completed })}
                    className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center ${task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                        }`}
                    disabled={isLoading || isDragging}>
                    {task.completed && <CheckIcon className="w-3 h-3 text-white" />}
                </button>

                {/* Task Input */}
                <input
                    type="text"
                    value={task.title}
                    onChange={(e) => onTaskUpdate(task.id, { title: e.target.value })}
                    className="flex-1 min-w-0 bg-transparent outline-none text-sm truncate touch-auto"
                    maxLength={maxLength}
                    disabled={isLoading || isDragging} />

                {/* Character counter */}
                {task.title.length >= maxLength - 5 && (
                    <span className={`text-xs flex-shrink-0 ${task.title.length === maxLength
                        ? 'text-red-500'
                        : 'text-gray-400'
                        }`}>
                        {maxLength - task.title.length}
                    </span>
                )}

                {/* Delete Button */}
                <button
                    onClick={() => onTaskDelete(task.id)}
                    className="flex-shrink-0 touch-auto"
                    disabled={isLoading || isDragging}>
                    <TrashIcon className="text-gray-400 hover:text-red-500 w-4 h-4" />
                </button>
            </div>
        </Reorder.Item>
    );
};

export default function TaskList({
    tasks,
    onReorder,
    onTaskUpdate,
    onTaskDelete,
    maxLength,
    maxTasks,
    isLoading = false,
    isDragging = false
}) {
    if (tasks.length === 0) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                {tasks.length >= maxTasks
                    ? "Task limit reached"
                    : "No tasks added yet"
                }
            </div>
        );
    }

    return (
        <Reorder.Group
            axis="y"
            values={tasks}
            onReorder={onReorder}
            className="space-y-3 w-full">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onTaskUpdate={onTaskUpdate}
                    onTaskDelete={onTaskDelete}
                    maxLength={maxLength}
                    isLoading={isLoading}
                    isDragging={isDragging}
                />
            ))}
        </Reorder.Group>
    );
};