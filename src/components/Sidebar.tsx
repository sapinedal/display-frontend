import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ChevronDown, ChevronRight,
  Menu, X, Package,
  Settings,
  UsersRound,
  Cable,
  Building2,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/suitpress-logo.svg';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: SidebarItem[];
  permission?: string;
}

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/dashboard',
    permission: 'menu.inicio'
  },
  {
    id: 'cadena-custodia',
    label: 'Cadena de Custodia',
    icon: <Package className="w-5 h-5" />,
    href: '/cadena-custodia',
    permission: 'menu.cadena.custodia'
  },
  {
    id: 'audit',
    label: 'Auditoria',
    icon: <Cable className="w-5 h-5" />,
    href: '/auditoria',
    permission: 'menu.auditoria'
  },
  {
    id: 'carro-paro',
    label: 'Carro de Paro',
    icon: <HeartPulse className="w-5 h-5" />,
    href: '/carro-paro',
    permission: 'menu.carro.paro'
  },
  {
    id: 'admin',
    label: 'Administración',
    icon: <Settings className="w-5 h-5" />,
    permission: 'menu.admin',
    children: [
      {
        id: 'operadores',
        label: 'Operadores',
        icon: <UsersRound className="w-4 h-4" />,
        href: '/admin/operadores',
        permission: 'admin.operadores'
      },
      {
        id: 'sedes',
        label: 'Sedes',
        icon: <Building2 className="w-4 h-4" />,
        href: '/admin/sedes',
        permission: 'admin.sedes'
      },
      {
        id: 'permisos',
        label: 'Permisos',
        icon: <UsersRound className='w-4 h-4' />,
        href: '/admin/permisos',
        permission: 'admin.permisos'
      }
    ]
  },
];

const SidebarItemComponent: React.FC<{
  item: SidebarItem;
  isExpanded: boolean;
  expandedItems: string[];
  onToggle: (id: string) => void;
  onNavigate: (href: string) => void;
  currentPath: string;
  userPermissions: string[];
}> = ({ item, isExpanded, expandedItems, onToggle, onNavigate, currentPath, userPermissions }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isItemExpanded = expandedItems.includes(item.id);
  const isActive = item.href === currentPath;
  const hasPermission = !item.permission || userPermissions.includes(item.permission);

  if (!hasPermission) {
    return null;
  }

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.id);
    } else if (item.href) {
      onNavigate(item.href);
    }
  };

  return (
    <div className="space-y-1">
      <div
        onClick={handleClick}
        className={`
          flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-200
          ${isActive
            ? 'bg-gray-100 text-black font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-black'
          }
          ${isExpanded ? 'w-full' : 'w-12 justify-center'}
        `}
      >
        <div className="flex items-center space-x-3">
          <span className={isActive ? 'text-black' : 'text-gray-500'}>
            {item.icon}
          </span>
          {isExpanded && (
            <span className="text-sm">{item.label}</span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <span className="text-gray-400">
            {isItemExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && isItemExpanded && (
        <div className="ml-6 space-y-1 transition-all">
          {item.children!.filter(child => !child.permission || userPermissions.includes(child.permission)).map((child) => {
            const isChildActive = child.href === currentPath;
            return (
              <div
                key={child.id}
                onClick={() => child.href && onNavigate(child.href)}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200
                  ${isChildActive
                    ? 'bg-gray-100 text-black font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }
                `}
              >
                <span className={isChildActive ? 'text-black' : 'text-gray-500'}>
                  {child.icon}
                </span>
                <span className="text-sm">{child.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  return (
    <div
      className={`
        bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-20'}
        flex flex-col h-screen
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {isExpanded && (
          <img src={logo} alt="Logo" className="w-auto h-6 mx-auto" />
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {sidebarItems.map((item) => (
          <SidebarItemComponent
            key={item.id}
            item={item}
            isExpanded={isExpanded}
            expandedItems={expandedItems}
            onToggle={toggleItem}
            onNavigate={handleNavigate}
            currentPath={location.pathname}
            userPermissions={userPermissions}
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
