import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, LayoutDashboard, CheckSquare, Menu, X, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/tasks') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Tasks
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Logout"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                 isActive('/')
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/tasks"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                 isActive('/tasks')
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Tasks
            </Link>
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 font-bold text-lg">{user.username.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.username}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};