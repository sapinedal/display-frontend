import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Image as ImageIcon, Upload } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import MediaDisplayService from '../lib/services/MediaDisplayService';
import { config } from '../config/env';

interface Media {
  id: number;
  titulo: string;
  tipo: 'video' | 'imagen';
  url: string | null;
  archivo: string | null;
  displayUrl?: string;
  activo: boolean;
  orden: number;
  created_at: string;
}

// Helper para extraer mensajes de error de forma segura
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    return response?.data?.error || 'Error desconocido';
  }
  return 'Error desconocido';
};

export default function VideosPage() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'crear' | 'editar'>('crear');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [sourceType, setSourceType] = useState<'archivo' | 'url'>('archivo');
  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    archivo: null as File | null,
    url: '',
    activo: true,
    orden: 1,
  });

  useEffect(() => {
    cargarMedias();
  }, []);

  const cargarMedias = async () => {
    try {
      const data = await MediaDisplayService.obtenerMediaDisplays();
      const mediasFormateadas = data.map(media => ({
        ...media,
        displayUrl: media.archivo
          ? `${config.API_URL}/storage/${media.archivo}`
          : (media.url || ''),
      }));
      setMedias(mediasFormateadas);
    } catch (error) {
      console.error('Error al cargar medias:', error);
      alert('Error al cargar los medias');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'crear' | 'editar', media?: Media) => {
    setModalMode(mode);
    if (mode === 'editar' && media) {
      setSelectedMedia(media);
      setSourceType(media.archivo ? 'archivo' : 'url');
      setFormData({
        titulo: media.titulo,
        archivo: null,
        url: media.url || '',
        activo: media.activo,
        orden: media.orden,
      });
      setPreviewUrl(media.displayUrl || '');
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMedia(null);
    resetForm();
    setPreviewUrl('');
    setUploading(false);
    setUploadProgress(0);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      archivo: null,
      url: '',
      activo: true,
      orden: 1,
    });
    setSourceType('archivo');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, archivo: file });

      // Generar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.titulo.trim()) {
        alert('El título es requerido');
        return;
      }
      setUploading(true);
      setUploadProgress(0);

      if (modalMode === 'crear') {
        if (sourceType === 'archivo' && !formData.archivo) {
          alert('Debe seleccionar un archivo');
          setUploading(false);
          return;
        }
        if (sourceType === 'url' && !formData.url) {
          alert('Debe ingresar una URL');
          setUploading(false);
          return;
        }

        await MediaDisplayService.crearMediaDisplay(
          {
            titulo: formData.titulo,
            archivo: sourceType === 'archivo' ? (formData.archivo || undefined) : undefined,
            url: sourceType === 'url' ? formData.url : undefined,
            orden: formData.orden,
            activo: formData.activo,
          },
          (progress) => {
            setUploadProgress(progress);
          }
        );
        alert('Media creado exitosamente');
      } else {
        if (!selectedMedia) {
          setUploading(false);
          return;
        }
        await MediaDisplayService.actualizarMediaDisplay(
          selectedMedia.id,
          {
            titulo: formData.titulo,
            archivo: sourceType === 'archivo' ? (formData.archivo || undefined) : undefined,
            url: sourceType === 'url' ? formData.url : '',
            orden: formData.orden,
            activo: formData.activo,
          },
          (progress) => {
            setUploadProgress(progress);
          }
        );
        alert('Media actualizado exitosamente');
      }

      await cargarMedias();
      handleCloseModal();
    } catch (error: unknown) {
      console.error('Error al guardar media:', error);
      alert(getErrorMessage(error));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este elemento?')) return;

    try {
      await MediaDisplayService.eliminarMediaDisplay(id);
      alert('Media eliminado exitosamente');
      await cargarMedias();
    } catch (error: unknown) {
      console.error('Error al eliminar media:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleToggleActivo = async (media: Media) => {
    try {
      await MediaDisplayService.actualizarMediaDisplay(media.id, {
        activo: !media.activo,
      });
      await cargarMedias();
    } catch (error: unknown) {
      console.error('Error al cambiar estado:', error);
      alert(getErrorMessage(error));
    }
  };

  const columns = [
    {
      key: 'tipo',
      header: 'Tipo',
      render: (media: Media) => (
        <div className="flex items-center space-x-2">
          {media.tipo === 'video' ? (
            <Play className="w-5 h-5 text-purple-600" />
          ) : (
            <ImageIcon className="w-5 h-5 text-blue-600" />
          )}
          <span className="capitalize">{media.tipo}</span>
        </div>
      ),
    },
    {
      key: 'titulo',
      header: 'Título',
    },
    {
      key: 'orden',
      header: 'Orden',
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (media: Media) => (
        <button
          onClick={() => handleToggleActivo(media)}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${media.activo
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
        >
          {media.activo ? 'Activo' : 'Inactivo'}
        </button>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (media: Media) => (
        <div className="flex space-x-2">
          <Button
            size="xs"
            variant="outline"
            icon={Edit2}
            onClick={() => handleOpenModal('editar', media)}
          >
            Editar
          </Button>
          <Button
            size="xs"
            variant="danger"
            icon={Trash2}
            onClick={() => handleDelete(media.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Videos e Imágenes"
        subtitle="Administra el contenido multimedia que se muestra en las pantallas de display"
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Contenido Multimedia
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {medias.length} elementos | Activos: {medias.filter(m => m.activo).length}
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => handleOpenModal('crear')}
        >
          Agregar Contenido
        </Button>
      </div>

      <DataTable
        data={medias}
        columns={columns}
      />

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'crear' ? 'Agregar Contenido' : 'Editar Contenido'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Tarjeta de Especificaciones dentro del modal */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-blue-900 mb-2">Especificaciones Recomendadas</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div>
                    <p className="font-medium">📐 Dimensiones:</p>
                    <p className="ml-4">1920x1080px (16:9)</p>
                  </div>
                  <div>
                    <p className="font-medium">⏱️ Duración:</p>
                    <p className="ml-4">Videos: ilimitado</p>
                    <p className="ml-4">Imágenes: 10 seg</p>
                  </div>
                  <div>
                    <p className="font-medium">📹 Videos:</p>
                    <p className="ml-4">MP4 (H.264), 100MB</p>
                  </div>
                  <div>
                    <p className="font-medium">🖼️ Imágenes:</p>
                    <p className="ml-4">JPG/PNG/WEBP, 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ingrese el título"
              required
            />
          </div>

          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setSourceType('archivo')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${sourceType === 'archivo'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Subir Archivo
            </button>
            <button
              onClick={() => setSourceType('url')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${sourceType === 'url'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              URL de Video
            </button>
          </div>

          {sourceType === 'archivo' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo (Video o Imagen) {modalMode === 'crear' && '*'}
              </label>
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required={modalMode === 'crear'}
              />
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1">✨ Recomendaciones:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Dimensiones ideales:</strong> 1920x1080px (16:9)</li>
                  <li>• <strong>Videos:</strong> MP4 formato H.264, hasta 100MB</li>
                  <li>• <strong>Imágenes:</strong> JPG/PNG/WEBP, hasta 10MB</li>
                  <li>• Las imágenes se mostrarán durante 10 segundos</li>
                  <li>• El contenido se mostrará en pantalla completa (cover)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Video *
              </label>
              <Input
                value={formData.url}
                onChange={(e) => {
                  setFormData({ ...formData, url: e.target.value });
                  setPreviewUrl(e.target.value);
                }}
                placeholder="https://ejemplo.com/video.mp4"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Ingrese la URL directa del video (MP4, WebM, etc.) o un enlace de YouTube/Vimeo.
              </p>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="bg-gray-100 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista Previa
              </label>
              <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '300px' }}>
                {sourceType === 'archivo' ? (
                  formData.archivo?.type.startsWith('image/') || (!formData.archivo && selectedMedia?.tipo === 'imagen') ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  // Handle URL preview (simplistic for now)
                  previewUrl.includes('youtube.com') || previewUrl.includes('youtu.be') ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${previewUrl.includes('v=') ? previewUrl.split('v=')[1].split('&')[0] : previewUrl.split('/').pop()}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback for non-direct video links or error
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                      }}
                    />
                  )
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {sourceType === 'url' && !previewUrl.includes('youtube') && !previewUrl.includes('youtu.be') && !previewUrl.match(/\.(mp4|webm|ogg)$/i)
                  ? 'Nota: Si el video no carga, es posible que la URL no sea un enlace directo al archivo de video.'
                  : 'Así se verá en el display'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orden de Reproducción *
            </label>
            <Input
              type="number"
              value={formData.orden.toString()}
              onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 1 })}
              min="1"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Activar para mostrar en display
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              icon={modalMode === 'crear' ? Plus : Upload}
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? 'Subiendo...' : (modalMode === 'crear' ? 'Crear' : 'Actualizar')}
            </Button>
          </div>

          {/* Indicador de progreso */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">Subiendo archivo...</span>
                <span className="text-blue-600 font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress > 10 && (
                    <span className="text-xs text-white font-bold">{uploadProgress}%</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <Spinner size="sm" />
                <span>Por favor espera, esto puede tardar varios minutos para archivos grandes...</span>
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
