import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Task, TaskStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Plus, Search, Filter, Trash2, Edit2, Check, CheckSquare } from 'lucide-react';
import { TaskFormModal } from '../components/TaskFormModal';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await api.tasks.list();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskSubmit = async (data: { title: string; description: string; status: TaskStatus }) => {
    if (editingTask) {
      await api.tasks.update(editingTask.id, data);
    } else {
      await api.tasks.create(data.title, data.description);
    }
    await fetchTasks();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store previous state for rollback
    const previousTasks = [...tasks];
    
    // Optimistic update: remove immediately from UI
    setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
    
    try {
      await api.tasks.delete(id);
    } catch (err) {
      console.error('Delete failed:', err);
      // Revert on error
      setTasks(previousTasks);
      alert('Failed to delete task');
    }
  };

  const openModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleStatusChange = async (e: React.MouseEvent | React.ChangeEvent, task: Task, newStatus: TaskStatus) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      await api.tasks.update(task.id, { status: newStatus });
    } catch (err) {
      console.error(err);
      // Revert on error
      fetchTasks();
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = statusFilter === 'ALL' || task.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            A list of all your tasks including their title, status, and description.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="ALL">All Status</option>
            <option value={TaskStatus.PENDING}>Pending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
             <li className="p-4 text-center text-gray-500">Loading tasks...</li>
          ) : filteredTasks.length === 0 ? (
            <li className="p-12 text-center flex flex-col items-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <CheckSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
              <div className="mt-6">
                <Button onClick={() => openModal()} variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
            </li>
          ) : (
            filteredTasks.map((task) => (
              <li key={task.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleStatusChange(e, task, task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED)}
                        className={`flex-shrink-0 h-5 w-5 rounded border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center transition-colors ${
                          task.status === TaskStatus.COMPLETED 
                            ? 'bg-green-500 border-transparent' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                         {task.status === TaskStatus.COMPLETED && <Check className="h-3.5 w-3.5 text-white pointer-events-none" />}
                      </button>
                      <div className="truncate">
                        <p className={`text-sm font-medium truncate ${task.status === TaskStatus.COMPLETED ? 'text-gray-500 line-through' : 'text-indigo-600'}`}>
                          {task.title}
                        </p>
                        <p className="mt-1 flex items-center text-sm text-gray-500 truncate">
                          {task.description}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                      <select
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(e, task, e.target.value as TaskStatus)}
                        className="hidden sm:block text-xs border-gray-300 rounded-full py-1 pl-2 pr-6 bg-gray-50 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value={TaskStatus.PENDING}>Pending</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                      </select>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openModal(task); }} 
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                          title="Edit task"
                        >
                          <Edit2 className="h-4 w-4 pointer-events-none" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDelete(e, task.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 z-10 relative cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
      />
    </div>
  );
};