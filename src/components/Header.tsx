import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import Button from './ui/Button';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const email = user?.email || '';
  const nombre = user?.nombre || '';

  return (
    <header className="bg-[#1e3a8a] shadow-sm border-b border-blue-900 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between relative">
        {/* Botones de navegación */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="border-2 border-white text-white hover:bg-blue-800 hover:border-white bg-transparent"
            onClick={() => navigate('/dashboard')}
          >
            Pacientes
          </Button>
          <Button
            variant="outline"
            className="border-2 border-white text-white hover:bg-blue-800 hover:border-white bg-transparent"
            onClick={() => navigate('/display')}
          >
            Display
          </Button>
          <Button
            variant="outline"
            useCan={"display.agregar-video"}
            className="border-2 border-white text-white hover:bg-blue-800 hover:border-white bg-transparent"
            onClick={() => navigate('/videos')}
          >
            Videos
          </Button>
        </div>

        {/* Info usuario */}
        <div className="flex items-center space-x-4">
          {/* Icono usuario */}
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-900" />
          </div>

          {/* Info usuario */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{nombre || ''}</p>
            <p className="text-xs text-blue-200">{email || ''}</p>
          </div>

          {/* Botón logout */}
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-blue-800 transition-colors duration-200"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
