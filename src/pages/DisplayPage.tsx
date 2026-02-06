import { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import PacienteService from '../lib/services/PacienteService';
import MediaDisplayService from '../lib/services/MediaDisplayService';
import { config } from '../config/env';

interface Paciente {
  id: number;
  numeroDocumento: string;
  nombrePaciente: string;
  procedimiento: string;
  estadoPaciente: string;
  horaIngreso?: string;
  createdAt?: string;
  created_at?: string;
}

interface Media {
  id: number;
  titulo: string;
  tipo: 'video' | 'imagen';
  archivo: string | null;
  url: string | null;
  orden: number;
  activo: boolean;
}

export default function DisplayPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageTimerRef = useRef<number | null>(null);

  const estadosConfig: Record<string, { label: string; color: string; bg: string }> = {
    preparacion: { label: 'Preparación', color: 'text-blue-800', bg: 'bg-blue-100' },
    cirugia: { label: 'Cirugía', color: 'text-purple-800', bg: 'bg-purple-100' },
    recuperacion: { label: 'Recuperación', color: 'text-yellow-800', bg: 'bg-yellow-100' },
    hospitalizacion: { label: 'Hospitalización', color: 'text-orange-800', bg: 'bg-orange-100' },
    alta: { label: 'Alta', color: 'text-green-800', bg: 'bg-green-100' },
  };

  useEffect(() => {
    cargarPacientes();
    cargarMedias();
    const interval = setInterval(() => {
      cargarPacientes();
      cargarMedias();
    }, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pacientes.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 3;
        return nextIndex >= pacientes.length ? 0 : nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [pacientes.length]);

  const avanzarMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % medias.length);
  };

  // Manejo de cambio de media y reproducción
  useEffect(() => {
    if (medias.length === 0) return;

    const currentMedia = medias[currentMediaIndex];

    // Limpiar timer anterior si existe
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    // Si es imagen o es un video externo (YouTube/URL), programar cambio automático
    if (currentMedia.tipo === 'imagen' || (currentMedia.url && !currentMedia.archivo)) {
      const timer = currentMedia.tipo === 'imagen' ? 10000 : 30000; // 30 seg para videos externos como default
      imageTimerRef.current = window.setTimeout(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % medias.length);
      }, timer);
    }

    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMediaIndex, medias.length]);

  const handleVideoEnd = () => {
    avanzarMedia();
  };

  const cargarPacientes = async () => {
    try {
      const data = await PacienteService.obtenerPacientes();
      setPacientes(data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMedias = async () => {
    try {
      const data = await MediaDisplayService.obtenerMediaDisplays();
      // Filtrar solo medias activos y ordenar
      const mediasActivos = data
        .filter(m => m.activo)
        .sort((a, b) => a.orden - b.orden);
      setMedias(mediasActivos);
    } catch (error) {
      console.error('Error al cargar medias:', error);
    }
  };

  const getYouTubeId = (url: string) => {
    if (!url) return '';
    // Handle shorts/
    if (url.includes('shorts/')) {
      return url.split('shorts/')[1].split('?')[0];
    }
    // Handle v=
    if (url.includes('v=')) {
      return url.split('v=')[1].split('&')[0];
    }
    // Handle youtu.be/ or other formats
    return url.split('/').pop()?.split('?')[0] || '';
  };

  const getMediaUrl = (media: Media) => {
    if (media.archivo) {
      const baseUrl = config.API_URL.replace('/api', '');
      return `${baseUrl}/storage/${media.archivo}`;
    }
    return media.url || '';
  };

  const formatearHora = (fecha?: string) => {
    if (!fecha) return '--:--';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const getEstadoConfig = (estado: string) => {
    const config = estadosConfig[estado.toLowerCase()];
    return config || { label: estado, color: 'text-gray-800', bg: 'bg-gray-100' };
  };

  const pacientesVisibles = pacientes.slice(currentIndex, currentIndex + 3);

  const pacientesAMostrar = pacientesVisibles.length < 3 && pacientes.length > pacientesVisibles.length
    ? [...pacientesVisibles, ...pacientes.slice(0, 3 - pacientesVisibles.length)]
    : pacientesVisibles;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Logo */}
          <div className="flex justify-start mb-6">
            <div className="bg-white border-2 border-blue-900 rounded-lg px-8 py-4 shadow-md">
              <img
                src="/logo_clinica_victoriana.png"
                alt="Clínica Victoriana"
                className="h-20 object-contain"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Sección de Videos del Sistema */}
            <div>
              <Card className="h-full flex items-center justify-center overflow-hidden p-0">
                <div className="bg-black rounded-lg w-full relative" style={{ height: '600px' }}>
                  {medias.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-8xl mb-6">🎬</div>
                        <p className="text-gray-400 text-2xl font-semibold">Sin contenido</p>
                        <p className="text-gray-500 text-lg mt-3">No hay medias activos para mostrar</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {medias[currentMediaIndex].tipo === 'video' ? (
                        medias[currentMediaIndex].url && (medias[currentMediaIndex].url.includes('youtube.com') || medias[currentMediaIndex].url.includes('youtu.be')) ? (
                          <iframe
                            key={medias[currentMediaIndex].id}
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${getYouTubeId(medias[currentMediaIndex].url)}?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playlist=${getYouTubeId(medias[currentMediaIndex].url)}&rel=0`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <video
                            ref={videoRef}
                            key={medias[currentMediaIndex].id}
                            className="absolute inset-0 w-full h-full"
                            style={{ objectFit: 'cover' }}
                            autoPlay
                            muted={isMuted}
                            onEnded={handleVideoEnd}
                            src={getMediaUrl(medias[currentMediaIndex])}
                          >
                            Tu navegador no soporta la reproducción de video.
                          </video>
                        )
                      ) : (
                        <img
                          key={medias[currentMediaIndex].id}
                          src={getMediaUrl(medias[currentMediaIndex])}
                          alt={medias[currentMediaIndex].titulo}
                          className="absolute inset-0 w-full h-full"
                          style={{ objectFit: 'cover', animation: 'fadeIn 0.5s ease-in' }}
                        />
                      )}

                      {/* Indicador de título */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white px-6 py-4">
                        <p className="text-lg font-semibold">{medias[currentMediaIndex].titulo}</p>
                      </div>

                      {/* Indicadores de posición */}
                      {medias.length > 1 && (
                        <div className="absolute top-4 right-4 flex space-x-1.5">
                          {medias.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${currentMediaIndex === idx ? 'bg-blue-500 w-8' : 'bg-white bg-opacity-50 w-6'
                                }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>

            <div>
              <Card className="h-full">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-lg mb-6 shadow-md">
                  <div className="text-center">
                    <p className="text-sm font-medium uppercase tracking-wide">
                      {new Date().toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {new Date().toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Pacientes en Atención
                </h2>

                <div className="space-y-6">
                  {pacientes.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg">No hay pacientes registrados</p>
                    </div>
                  ) : (
                    <>
                      {pacientesAMostrar.map((paciente, idx) => {
                        const estadoConfig = getEstadoConfig(paciente.estadoPaciente);

                        return (
                          <div key={`${paciente.id}-${idx}`} style={{ animation: `fadeIn 0.5s ease-in ${idx * 0.1}s both` }}>
                            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white text-center py-3 rounded-t-lg shadow-sm">
                              <h3 className="text-xl font-bold">{estadoConfig.label}</h3>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-b-lg shadow-md">
                              <p className="text-white font-bold text-lg">
                                {paciente.numeroDocumento} - {paciente.nombrePaciente}
                              </p>
                              <p className="text-white mt-1">
                                {formatearHora(paciente.created_at || paciente.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {pacientes.length > 3 && (
                        <div className="flex justify-center items-center space-x-2 pt-4">
                          <span className="text-sm text-gray-500">
                            Paciente {currentIndex + 1} - {Math.min(currentIndex + 3, pacientes.length)} de {pacientes.length}
                          </span>
                          <div className="flex space-x-1 ml-4">
                            {Array.from({ length: Math.ceil(pacientes.length / 3) }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${Math.floor(currentIndex / 3) === idx ? 'bg-blue-600 w-8' : 'bg-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de Interacción Inicial - Requerido por navegadores para audio */}
      {!hasInteracted && (
        <div
          className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center cursor-pointer backdrop-blur-sm"
          onClick={() => setHasInteracted(true)}
        >
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform transition-all hover:scale-105">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pantalla de Visualización</h2>
            <p className="text-gray-600">Haz clic en cualquier lugar para activar el audio y el contenido.</p>
          </div>
        </div>
      )}
    </>
  );
}
