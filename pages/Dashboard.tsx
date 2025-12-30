import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Task, TaskStatus } from '../types';
import { CheckCircle, Clock, List, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.tasks.list();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
  };

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.username}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link to="/tasks" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Manage Tasks
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Tasks" 
            value={stats.total} 
            icon={<List className="h-6 w-6 text-white" />} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="In Progress" 
            value={stats.inProgress} 
            icon={<Clock className="h-6 w-6 text-white" />} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            icon={<CheckCircle className="h-6 w-6 text-white" />} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            icon={<AlertCircle className="h-6 w-6 text-white" />} 
            color="bg-yellow-500" 
          />
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {loading ? (
             [1, 2, 3].map((i) => (
              <li key={i} className="px-4 py-4 sm:px-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </li>
            ))
          ) : recentTasks.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No tasks found. Get started by creating one!
            </li>
          ) : (
            recentTasks.map((task) => (
              <li key={task.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-600 truncate">
                    {task.title}
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                        task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {task.description || "No description provided."}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>
                      Updated {new Date(task.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="bg-gray-50 px-4 py-4 sm:px-6 rounded-b-lg">
          <div className="text-sm">
            <Link to="/tasks" className="font-medium text-indigo-600 hover:text-indigo-500">
              View all tasks<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};