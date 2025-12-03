import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import logoClinicaVictoriana from "/logo_clinica_victoriana.png"
import { IdCard, ScanFaceIcon } from "lucide-react";
import Spinner from "../components/ui/Spinner";

const AuthPage: React.FC = () => {
  const { isLoading, isPostLoginLoading, login } = useAuth();
  const [documento, setDocumento] = useState("");
  const [campoSeguridad, setCampoSeguridad] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const response = await api.post("/auth/login", {
        documento,
        campo_seguridad: campoSeguridad,
      });

      await login(response.data);
    } catch (err: any) {
      setError("Los datos ingresados son incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans bg-gray-50">
      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  w-[800px] h-[700px] rounded-full 
                  bg-gradient-to-r from-indigo-900 via-blue-900 to-cyan-400 
                  blur-3xl opacity-80"
        />
      </div>
      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg px-8 py-10 min-w-[340px] max-w-sm w-full flex flex-col gap-6 relative z-10"
      >
        <div className="text-center flex flex-col">
          <img src={logoClinicaVictoriana} alt="Logo" className="w-28 mx-auto mb-3" />
          <h2 className="font-bold text-2xl text-gray-900 m-0">Bienvenido</h2>
          <p className="text-center text-gray-500 mt-2 text-base">
            Ingresa tu correo y contraseña para ingresar
          </p>
        </div>

        <div>
          <label className="block font-medium text-gray-900 mb-1 text-base">
            Correo
          </label>
          <div className="relative">
            <span className="absolute left-2 my-1 text-gray-500">
              <IdCard className="w-5 h-7" />
            </span>
            <input
              type="number"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              required
              placeholder="Ingrese su email"
              autoComplete="username"
              className="w-full pl-10 pr-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-base outline-none focus:border-gray-400 transition mb-2"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-900 mb-1 text-base">
            Contraseña
          </label>
          <div className="relative">
            <span className="absolute left-2 my-1 text-gray-500">
              <ScanFaceIcon className="w-5 h-7" />
            </span>
            <input
              type="password"
              value={campoSeguridad}
              onChange={(e) => setCampoSeguridad(e.target.value)}
              required
              autoComplete="bday"
              placeholder="Ingresa tu contraseña"
              className="w-full pl-10 pr-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-base outline-none focus:border-gray-400 transition"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-700 bg-red-50 rounded-md py-2 px-4 text-center text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isLoading || isPostLoginLoading}
          className={`flex items-center justify-center bg-black text-white font-semibold text-base rounded-lg py-2 transition-opacity ${loading || isLoading || isPostLoginLoading
            ? "opacity-70 cursor-not-allowed"
            : "hover:opacity-90"
            }`}
        >
          {loading || isLoading || isPostLoginLoading ? (
            <Spinner />
          ) : (
            "Ingresar"
          )}
        </button>

        <a href="/register" className="text-sm underline hover:text-blue-400 text-center">Ingresa aquí para registrarte</a>

      </form>
    </div>
  );
};

export default AuthPage;
