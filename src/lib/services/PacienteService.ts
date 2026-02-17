import api from "../axios";

export interface PacientePayload {
  numeroDocumento: string;
  nombrePaciente: string;
  procedimiento: string;
  estadoPaciente: string;
}

class PacienteService {
  static async crearPaciente(data: PacientePayload): Promise<any> {
    if (!data) throw new Error("Payload vacío");
    if (!data.numeroDocumento)
      throw new Error("El número de documento es requerido");
    if (!data.nombrePaciente)
      throw new Error("El nombre del paciente es requerido");
    if (!data.procedimiento) throw new Error("El procedimiento es requerido");
    if (!data.estadoPaciente)
      throw new Error("El estado del paciente es requerido");

    try {
      const response = await api.post("/pacientes/crear", data);
      return response.data;
    } catch (error) {
      console.error("Error al crear el paciente:", error);
      throw error;
    }
  }

  static async obtenerPacientes(): Promise<any[]> {
    try {
      const response = await api.get("/pacientes/obtener");
      return response.data;
    } catch (error) {
      console.error("Error al obtener los pacientes:", error);
      throw error;
    }
  }

  static async obtenerPacientePorId(id: number): Promise<any> {
    try {
      const response = await api.get(`/pacientes/obtener/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener el paciente:", error);
      throw error;
    }
  }

  static async actualizarPaciente(
    id: number,
    data: Partial<PacientePayload>
  ): Promise<any> {
    try {
      const response = await api.put(`/pacientes/actualizar/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el paciente:", error);
      throw error;
    }
  }

  static async eliminarPaciente(id: number): Promise<any> {
    try {
      const response = await api.delete(`/pacientes/eliminar/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar el paciente:", error);
      throw error;
    }
  }

  static async buscarAfiliado(documento: string): Promise<any> {
    if (!documento) throw new Error("El número de documento es requerido");

    try {
      const response = await api.get(`/cadena-custodia/afiliados/${documento}`);
      return response.data;
    } catch (error) {
      console.error("Error al buscar el afiliado:", error);
      throw error;
    }
  }
}

export default PacienteService;
