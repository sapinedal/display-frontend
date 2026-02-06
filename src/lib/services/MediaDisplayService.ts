import api from "../axios";

export interface MediaDisplayPayload {
  titulo: string;
  tipo?: 'video' | 'imagen';
  archivo?: File;
  url?: string;
  orden: number;
  activo: boolean;
}

export interface MediaDisplay {
  id: number;
  titulo: string;
  tipo: 'video' | 'imagen';
  archivo: string | null;
  url: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

class MediaDisplayService {
  static async crearMediaDisplay(
    data: MediaDisplayPayload,
    onProgress?: (progress: number) => void
  ): Promise<MediaDisplay> {
    if (!data) throw new Error("Payload vacío");
    if (!data.titulo) throw new Error("El título es requerido");
    if (!data.archivo && !data.url) throw new Error("El archivo o la URL son requeridos");

    try {
      const formData = new FormData();
      formData.append('titulo', data.titulo);
      if (data.archivo) formData.append('archivo', data.archivo);
      if (data.url) formData.append('url', data.url);
      formData.append('orden', data.orden.toString());
      formData.append('activo', data.activo ? '1' : '0');

      const response = await api.post("/media-display/crear", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutos
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al crear el media display:", error);
      throw error;
    }
  }

  static async obtenerMediaDisplays(): Promise<MediaDisplay[]> {
    try {
      const response = await api.get("/media-display/obtener");
      return response.data;
    } catch (error) {
      console.error("Error al obtener los media displays:", error);
      throw error;
    }
  }

  static async obtenerMediaDisplayPorId(id: number): Promise<MediaDisplay> {
    try {
      const response = await api.get(`/media-display/obtener/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener el media display:", error);
      throw error;
    }
  }

  static async actualizarMediaDisplay(
    id: number,
    data: Partial<MediaDisplayPayload>,
    onProgress?: (progress: number) => void
  ): Promise<MediaDisplay> {
    try {
      const formData = new FormData();

      if (data.titulo) formData.append('titulo', data.titulo);
      if (data.archivo) formData.append('archivo', data.archivo);
      if (data.url !== undefined) formData.append('url', data.url || '');
      if (data.orden !== undefined) formData.append('orden', data.orden.toString());
      if (data.activo !== undefined) formData.append('activo', data.activo ? '1' : '0');

      const response = await api.post(`/media-display/actualizar/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutos
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el media display:", error);
      throw error;
    }
  }

  static async eliminarMediaDisplay(id: number): Promise<void> {
    try {
      const response = await api.delete(`/media-display/eliminar/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar el media display:", error);
      throw error;
    }
  }
}

export default MediaDisplayService;
