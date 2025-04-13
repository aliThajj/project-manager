
import { useEffect } from "react";
import { useProjects } from "../../context/ProjectsContext";
import { CheckIcon } from "../UI/Icons";
export default function ProjectTasks({ projectId }) {
    const {
        currentProjectTasks,
        tasksLoading,
        updateTask,
        taskLimits: { maxLength: MAX_TASK_LENGTH }
    } = useProjects();

    useEffect(() => {
        console.log(currentProjectTasks)
    }, [currentProjectTasks])

    // Handle task completion toggle only
    const handleToggleTask = async (taskId, currentStatus) => {
        try {
            await updateTask(projectId, taskId, {
                completed: !currentStatus,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Failed to toggle task:", error);
        }
    };

    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">
                Tasks ({currentProjectTasks.length})
            </h3>
            {/* <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Tasks ({currentProjectTasks.length})
                </h3>
                <Link
                    to={`/projects/${projectId}/edit`}
                    className="text-sm underline text-blue-600 hover:text-blue-800">
                    Edit Tasks
                </Link>
            </div> */}

            {tasksLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-3 bg-gray-100 rounded-lg animate-pulse h-12" />
                    ))}
                </div>
            ) : currentProjectTasks.length > 0 ? (
                <div className="space-y-2 w-full">
                    {currentProjectTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${task.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center min-w-0 w-full"> {/* Changed this line */}
                                <button
                                    onClick={() => handleToggleTask(task.id, task.completed)}
                                    className={`mr-3 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {task.completed && <CheckIcon className="text-white w-3 h-3" />}
                                </button>
                                <div className="min-w-0 overflow-hidden"> {/* Added this wrapper div */}
                                    <span
                                        className={`max-w-32 lg:max-w-fit truncate block ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                                        title={task.title.length > MAX_TASK_LENGTH ? task.title : ''}>
                                        {task.title}
                                    </span>
                                </div>
                            </div>
                            {task.completed && (
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0 whitespace-nowrap">
                                    {new Date(
                                        task.updatedAt?.seconds * 1000 ||
                                        task.createdAt?.seconds * 1000
                                    ).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                    No tasks yet. Edit project to add tasks.
                </div>
            )}
        </div>
    );
}