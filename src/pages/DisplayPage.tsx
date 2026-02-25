import { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import PacienteService from '../lib/services/PacienteService';
import MediaDisplayService from '../lib/services/MediaDisplayService';
import { config } from '../config/env';
import echo from '../lib/echo';

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
  // Stable key for YouTube iframe: only rebuilds when the actual video ID list changes
  const mediasRef = useRef<Media[]>(medias);
  mediasRef.current = medias;

  const estadosConfig: Record<string, { label: string; color: string; bg: string }> = {
    preparacion: { label: 'Preparación', color: 'text-blue-800', bg: 'bg-blue-100' },
    cirugia: { label: 'Cirugía', color: 'text-purple-800', bg: 'bg-purple-100' },
    recuperacion: { label: 'Recuperación', color: 'text-yellow-800', bg: 'bg-yellow-100' },
    hospitalizacion: { label: 'Hospitalización', color: 'text-orange-800', bg: 'bg-orange-100' },
    alta: { label: 'Alta', color: 'text-green-800', bg: 'bg-green-100' },
  };

  // Declaro las funciones de carga primero con useCallback
  const cargarPacientes = useCallback(async () => {
    try {
      const data = await PacienteService.obtenerPacientes();
      setPacientes(data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarMedias = useCallback(async () => {
    try {
      const data = await MediaDisplayService.obtenerMediaDisplays();
      const mediasActivos = data
        .filter((m: Media) => m.activo)
        .sort((a: Media, b: Media) => a.orden - b.orden);
      setMedias(mediasActivos);
      // Prevent currentMediaIndex from going out of bounds when the list shrinks
      setCurrentMediaIndex((prev) =>
        mediasActivos.length > 0 && prev >= mediasActivos.length ? 0 : prev
      );
    } catch (error) {
      console.error('Error al cargar medias:', error);
    }
  }, []);

  useEffect(() => {
    cargarPacientes();
    cargarMedias();
  }, [cargarPacientes, cargarMedias]);

  useEffect(() => {
    let isInitialConnect = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const refetchAll = () => {
      cargarPacientes();
      cargarMedias();
    };

    const pacientesChannel = echo
      .channel('pacientes')
      .listen('.pacientes.updated', (e: { pacientes?: Paciente[] }) => {
        if (Array.isArray(e?.pacientes)) {
          setPacientes(e.pacientes);
          setLoading(false);
        } else {
          cargarPacientes();
        }
      });

    const mediaChannel = echo
      .channel('media-display')
      .listen('.media-display.updated', (e: { media?: Media[] }) => {
        if (Array.isArray(e?.media)) {
          const activos = e.media
            .filter((m) => m.activo)
            .sort((a, b) => a.orden - b.orden);
          setMedias(activos);
          setCurrentMediaIndex((prev) =>
            activos.length > 0 && prev >= activos.length ? 0 : prev
          );
        } else {
          cargarMedias();
        }
      });

    const pusherConnection = echo.connector.pusher.connection;

    const onDisconnected = () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        refetchAll();
      }, 2000);
    };

    const onConnected = () => {
      if (isInitialConnect) {
        isInitialConnect = false;
        return;
      }
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        refetchAll();
      }, 1000);
    };

    pusherConnection.bind('disconnected', onDisconnected);
    pusherConnection.bind('connected', onConnected);

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      pacientesChannel.stopListening('.pacientes.updated');
      mediaChannel.stopListening('.media-display.updated');
      pusherConnection.unbind('disconnected', onDisconnected);
      pusherConnection.unbind('connected', onConnected);
      echo.leave('pacientes');
      echo.leave('media-display');
    };
  }, [cargarPacientes, cargarMedias]);

  useEffect(() => {
    if (pacientes.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev: number) => {
        const nextIndex = prev + 3;
        return nextIndex >= pacientes.length ? 0 : nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [pacientes.length]);

  const avanzarMedia = () => {
    setCurrentMediaIndex((prev: number) => (prev + 1) % mediasRef.current.length);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Track which video is playing to keep dot indicator in sync
        if (data.event === 'infoDelivery' && data.info?.videoData?.video_id) {
          const playingId = data.info.videoData.video_id;
          const idx = mediasRef.current.findIndex(
            (m) => m.url && getYouTubeId(m.url) === playingId
          );
          if (idx !== -1) setCurrentMediaIndex(idx);
        }

        // Fallback for non-YouTube-playlist mode (local files / single videos)
        const isEnded =
          (data.event === 'infoDelivery' && data.info?.playerState === 0) ||
          (data.event === 'onStateChange' && data.info === 0);

        if (isEnded) {
          avanzarMedia();
        }
      } catch (e) {
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (medias.length === 0) return;

    const currentMedia = medias[currentMediaIndex];

    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    if (currentMedia.tipo === 'imagen') {
      imageTimerRef.current = window.setTimeout(() => {
        avanzarMedia();
      }, 10000);
    }

    // For local video files: imperatively change src so the <video> element is never unmounted
    if (currentMedia.tipo === 'video' && currentMedia.archivo && videoRef.current) {
      const newSrc = getMediaUrl(currentMedia);
      if (videoRef.current.src !== newSrc) {
        videoRef.current.src = newSrc;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }

    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
      }
    };
  }, [currentMediaIndex, medias]);



  const toggleFullscreen = () => {
    const doc = document as any;
    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      const requestFullScreen = doc.documentElement.requestFullscreen ||
        doc.documentElement.msRequestFullscreen ||
        doc.documentElement.mozRequestFullScreen ||
        doc.documentElement.webkitRequestFullscreen;
      if (requestFullScreen) {
        requestFullScreen.call(doc.documentElement).catch((err: any) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      const exitFullScreen = doc.exitFullscreen ||
        doc.msExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.webkitExitFullscreen;
      if (exitFullScreen) {
        exitFullScreen.call(doc);
      }
    }
  };

  const getYouTubeId = (url: string) => {
    if (!url) return '';
    if (url.includes('shorts/')) {
      return url.split('shorts/')[1].split('?')[0];
    }
    if (url.includes('v=')) {
      return url.split('v=')[1].split('&')[0];
    }
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

  const currentMedia = medias.length > 0 ? medias[currentMediaIndex] : null;

  // Build YouTube playlist from all active YouTube media, in order
  const youtubeMedias = medias.filter(
    (m) => m.tipo === 'video' && m.url &&
    (m.url.includes('youtube.com') || m.url.includes('youtu.be'))
  );
  const youtubeIds = youtubeMedias.map((m) => getYouTubeId(m.url || ''));
  // Stable key: only changes when the actual set of YouTube IDs changes
  const youtubeIframeKey = youtubeIds.join(',');
  // First video to embed; playlist parameter contains all IDs for seamless auto-advance
  const firstYouTubeId = youtubeIds[0] || '';
  const youtubePlaylistParam = youtubeIds.join(',');
  const youtubeIsCurrentMedia =
    currentMedia?.tipo === 'video' &&
    currentMedia?.url &&
    (currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be'));

  return (
    <>
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
                  {!currentMedia ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-8xl mb-6">🎬</div>
                        <p className="text-gray-400 text-2xl font-semibold">Sin contenido</p>
                        <p className="text-gray-500 text-lg mt-3">No hay medias activos para mostrar</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentMedia.tipo === 'video' ? (
                        youtubeIsCurrentMedia ? (
                          // Single stable iframe using YouTube's playlist for seamless auto-advance.
                          // key only changes when the set of video IDs changes — NOT on every index change.
                          <iframe
                            key={youtubeIframeKey}
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${firstYouTubeId}?playlist=${youtubePlaylistParam}&loop=1&autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&rel=0&enablejsapi=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          // Local video: never unmounted, src changed imperatively via useEffect
                          <video
                            ref={videoRef}
                            className="absolute inset-0 w-full h-full"
                            style={{ objectFit: 'cover' }}
                            autoPlay
                            muted={isMuted}
                            onEnded={avanzarMedia}
                            src={getMediaUrl(currentMedia)}
                          >
                            Tu navegador no soporta la reproducción de video.
                          </video>
                        )
                      ) : (
                        <img
                          key={currentMedia.id}
                          src={getMediaUrl(currentMedia)}
                          alt={currentMedia.titulo}
                          className="absolute inset-0 w-full h-full"
                          style={{ objectFit: 'cover', animation: 'fadeIn 0.5s ease-in' }}
                        />
                      )}

                      {/* Indicador de título */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white px-6 py-4">
                        <p className="text-lg font-semibold">{currentMedia.titulo}</p>
                      </div>

                      {/* Indicadores de posición */}
                      {medias.length > 1 && (
                        <div className="absolute top-4 right-4 flex space-x-1.5">
                          {medias.map((_, idx: number) => (
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
                      {pacientesAMostrar.map((paciente: Paciente, idx: number) => {
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
                            {Array.from({ length: Math.ceil(pacientes.length / 3) }).map((_, idx: number) => (
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
          onClick={() => {
            setHasInteracted(true);
            toggleFullscreen();
          }}
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

      {/* Botón flotante discreto para fullscreen */}
      <button
        onClick={toggleFullscreen}
        className="fixed bottom-2 right-2 opacity-0 hover:opacity-50 transition-opacity z-50 bg-black text-white p-2 rounded-full"
        title="Toggle Fullscreen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
    </>
  );
}
