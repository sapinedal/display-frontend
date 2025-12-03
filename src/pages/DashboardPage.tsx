import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import PacienteService from "../lib/services/PacienteService";
import type { PacientePayload } from "../lib/services/PacienteService";
import { Plus } from "lucide-react";

interface Paciente {
  id: number;
  numeroDocumento: string;
  nombrePaciente: string;
  procedimiento: string;
  estadoPaciente: string;
  created_at: string;
}

export default function DashboardPage() {
  const [formData, setFormData] = useState<PacientePayload>({
    numeroDocumento: "",
    nombrePaciente: "",
    procedimiento: "",
    estadoPaciente: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [editingEstadoId, setEditingEstadoId] = useState<number | null>(null);
  const [updatingEstadoId, setUpdatingEstadoId] = useState<number | null>(null);

  const estadosOptions = [
    { value: "preparacion", label: "Preparación" },
    { value: "cirugia", label: "Cirugía" },
    { value: "recuperacion", label: "Recuperación" },
    { value: "hospitalizacion", label: "Hospitalización" },
    { value: "alta", label: "Alta" },
  ];

  // Cargar pacientes al montar el componente
  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    setLoadingPacientes(true);
    try {
      const data = await PacienteService.obtenerPacientes();
      setPacientes(data);
    } catch (err: any) {
      console.error("Error al cargar pacientes:", err);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const handleInputChange = (field: keyof PacientePayload, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar mensajes al cambiar campos
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await PacienteService.crearPaciente(formData);
      setSuccess("Paciente creado exitosamente");

      // Limpiar formulario
      setFormData({
        numeroDocumento: "",
        nombrePaciente: "",
        procedimiento: "",
        estadoPaciente: "",
      });

      // Recargar la lista de pacientes
      await cargarPacientes();
    } catch (err: any) {
      setError(err.message || "Error al crear el paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (pacienteId: number, nuevoEstado: string) => {
    setUpdatingEstadoId(pacienteId);
    setEditingEstadoId(null);
    try {
      await PacienteService.actualizarPaciente(pacienteId, {
        estadoPaciente: nuevoEstado,
      });
      // Actualizar la lista local
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteId ? { ...p, estadoPaciente: nuevoEstado } : p
        )
      );
    } catch (err: any) {
      console.error("Error al actualizar estado:", err);
      alert("Error al actualizar el estado del paciente");
    } finally {
      setUpdatingEstadoId(null);
    }
  };

  const handleEliminarPaciente = async (pacienteId: number) => {
    if (!confirm("¿Está seguro de eliminar este paciente?")) return;

    try {
      await PacienteService.eliminarPaciente(pacienteId);
      // Actualizar la lista local
      setPacientes((prev) => prev.filter((p) => p.id !== pacienteId));
    } catch (err: any) {
      console.error("Error al eliminar paciente:", err);
      alert("Error al eliminar el paciente");
    }
  };

  const getEstadoLabel = (estado: string) => {
    const option = estadosOptions.find((opt) => opt.value === estado);
    return option ? option.label : estado;
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      preparacion: "bg-blue-100 text-blue-700 border-blue-200",
      cirugia: "bg-purple-100 text-purple-700 border-purple-200",
      recuperacion: "bg-yellow-100 text-yellow-700 border-yellow-200",
      hospitalizacion: "bg-orange-100 text-orange-700 border-orange-200",
      alta: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[estado] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatHora = (fecha: string) => {
    if (!fecha) return "—";
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const columns: Column<Paciente>[] = [
    {
      key: "numeroDocumento",
      header: "Documento",
      width: "15%",
    },
    {
      key: "nombrePaciente",
      header: "Nombre",
      width: "25%",
    },
    {
      key: "estadoPaciente",
      header: "Estado",
      width: "20%",
      render: (row) => {
        // Mostrar spinner si se está actualizando este paciente
        if (updatingEstadoId === row.id) {
          return (
            <div className="flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-600">Actualizando...</span>
            </div>
          );
        }

        if (editingEstadoId === row.id) {
          return (
            <div className="flex items-center gap-2">
              <select
                value={row.estadoPaciente}
                onChange={(e) => handleEstadoChange(row.id, e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              >
                <option value="">Seleccione...</option>
                {estadosOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setEditingEstadoId(null)}
                className="text-gray-400 hover:text-gray-600 text-xs px-1"
                title="Cancelar"
              >
                ✕
              </button>
            </div>
          );
        }
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${getEstadoColor(row.estadoPaciente)
              }`}
            onClick={() => setEditingEstadoId(row.id)}
            title="Click para editar"
          >
            {getEstadoLabel(row.estadoPaciente)}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Hora",
      width: "15%",
      render: (row) => formatHora(row.created_at),
    },
    {
      key: "procedimiento",
      header: "Procedimiento",
      width: "25%",
    },
  ];

  return (
    <div>
      <PageHeader title="Nuevo Paciente" />
      <Card className="p-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Número de Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ingrese Número de Documento"
              value={formData.numeroDocumento}
              onChange={(e) => handleInputChange("numeroDocumento", e.target.value)}
              required
            />
          </div>

          {/* Nombre del Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Paciente <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ingrese Nombre del Paciente"
              value={formData.nombrePaciente}
              onChange={(e) => handleInputChange("nombrePaciente", e.target.value)}
              required
            />
          </div>

          {/* Procedimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procedimiento <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ingrese Procedimiento"
              value={formData.procedimiento}
              onChange={(e) => handleInputChange("procedimiento", e.target.value)}
              required
            />
          </div>

          {/* Estado del Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Paciente <span className="text-red-500">*</span>
            </label>
            <Select
              options={estadosOptions}
              value={formData.estadoPaciente}
              onChange={(value) => handleInputChange("estadoPaciente", value)}
              placeholder="Seleccione estado del Paciente"
            />
          </div>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Botón Nuevo Paciente */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleSubmit}
            disabled={loading}
            className="px-12"
          >
            {loading ? "Guardando..." : "Nuevo Paciente"}
          </Button>
        </div>
      </Card>

      {/* Tabla de Pacientes */}
      <h2 className="text-center pt-4 text-3xl font-bold text-gray-900 mb-4">
        Lista de Pacientes
      </h2>
      <DataTable
        data={pacientes}
        columns={columns}
        loading={loadingPacientes}
        emptyText="No hay pacientes registrados"
        getRowActions={(row) => (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleEliminarPaciente(row.id)}
          >
            Eliminar
          </Button>
        )}
      />
    </div>
  );
}
