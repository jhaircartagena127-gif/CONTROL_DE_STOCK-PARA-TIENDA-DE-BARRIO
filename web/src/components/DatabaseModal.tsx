/**
 * Modal Interactivo: Guía y Configuración de Base de Datos (MongoDB Atlas & Docker)
 * Permite verificar el estado en tiempo real, probar cadenas de conexión a MongoDB Atlas
 * y consultar instrucciones paso a paso para desplegar con Docker.
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Cloud, 
  Layers, 
  X,
  Play,
  RefreshCw,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api.ts';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'estado' | 'atlas' | 'docker' | 'archivos'>('estado');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  
  // Probador de conexión
  const [testUri, setTestUri] = useState<string>('');
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; dbName?: string } | null>(null);

  // Estados de copiado
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await api.getDatabaseStatus();
      if (res.ok) {
        setDbStatus(res.status);
      }
    } catch (err) {
      console.error('Error al obtener estado de base de datos:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    if (!testUri.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.testDatabaseConnection(testUri.trim());
      setTestResult(res);
      if (res.ok) {
        fetchStatus();
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Error de conexión con el servidor backend.'
      });
    } finally {
      setTestLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (!isOpen) return null;

  const dockerComposeSnippet = `version: '3.8'

services:
  tiendita-app:
    build: .
    container_name: tiendita_app
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=development
      # Reemplaza con tu cadena de conexión de MongoDB Atlas:
      - MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/tienda_papelito?retryWrites=true&w=majority
    volumes:
      - ./.papelito_db.json:/app/.papelito_db.json
    restart: unless-stopped`;

  const dockerfileSnippet = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "run", "dev"]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">Conectar Base de Datos & Docker</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MongoDB Atlas
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Almacena tus productos en la nube de forma segura y permanente o despliega en contenedor Docker.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación Interna */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-slate-50 gap-2 overflow-x-auto no-scrollbar shrink-0 pt-2">
          <button
            onClick={() => setActiveSubTab('estado')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeSubTab === 'estado'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Estado & Probar Conexión</span>
          </button>

          <button
            onClick={() => setActiveSubTab('atlas')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeSubTab === 'atlas'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>1. MongoDB Atlas (Gratis)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('docker')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeSubTab === 'docker'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>2. Despliegue con Docker</span>
          </button>

          <button
            onClick={() => setActiveSubTab('archivos')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeSubTab === 'archivos'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-600" />
            <span>Archivos de Configuración</span>
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* SUBTAB 1: ESTADO Y PROBADOR */}
          {activeSubTab === 'estado' && (
            <div className="space-y-6">
              
              {/* Tarjeta de Estado Activo */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Motor de Almacenamiento Activo
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      {dbStatus?.isAtlas ? (
                        <div className="flex items-center gap-2">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <span className="text-lg font-black text-slate-900">
                            MongoDB Atlas (En la nube)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                          <span className="text-lg font-black text-slate-900">
                            Almacenamiento Persistente JSON (Local)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={fetchStatus}
                    disabled={loadingStatus}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-sm w-full sm:w-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
                    <span>Actualizar Estado</span>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[11px]">Base de Datos:</span>
                    <span className="font-mono font-bold text-slate-800">{dbStatus?.dbName || 'tienda_papelito'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[11px]">Productos Guardados:</span>
                    <span className="font-bold text-emerald-700 text-sm">{dbStatus?.itemCount?.productos ?? 0} ítems</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[11px]">Visitas de Proveedores:</span>
                    <span className="font-bold text-slate-800 text-sm">{dbStatus?.itemCount?.agenda ?? 0} citas</span>
                  </div>
                </div>

                {dbStatus?.uriMasked && (
                  <div className="mt-3 bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                    URI Configurada: {dbStatus.uriMasked}
                  </div>
                )}
              </div>

              {/* Probador de Conexión en Vivo */}
              <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Probar Conexión con tu Clúster de MongoDB Atlas
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Pega aquí tu cadena de conexión para comprobar al instante si tu usuario, contraseña y permisos IP (0.0.0.0/0) son correctos.
                </p>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="mongodb+srv://tu_usuario:tu_contraseña@cluster0.xxxxx.mongodb.net/tienda_papelito?retryWrites=true&w=majority"
                      value={testUri}
                      onChange={(e) => setTestUri(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 pr-12"
                    />
                    {testUri && (
                      <button
                        onClick={() => setTestUri('')}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleTestConnection}
                      disabled={testLoading || !testUri.trim()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-600/20 transition"
                    >
                      {testLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verificando Clúster...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Probar Conexión Ahora</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-slate-500 text-center sm:text-left">
                      💡 Tu clave no se guarda públicamente; la prueba se ejecuta desde el servidor Node.js.
                    </span>
                  </div>

                  {/* Resultado de la prueba */}
                  {testResult && (
                    <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                      testResult.ok 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}>
                      {testResult.ok ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-bold">{testResult.ok ? '¡Conexión Exitosa!' : 'Error al Conectar'}</strong>
                        <span>{testResult.message}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SUBTAB 2: GUÍA MONGODB ATLAS PASO A PASO */}
          {activeSubTab === 'atlas' && (
            <div className="space-y-6 text-slate-700">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-base font-extrabold text-slate-900">
                  Guía Paso a Paso: Crear tu Clúster Gratis en MongoDB Atlas
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  MongoDB Atlas ofrece 512 MB gratuitos de por vida (Plan M0 Free), suficiente para más de 100,000 productos y transacciones.
                </p>
              </div>

              {/* Paso 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1.5 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">Crear cuenta en MongoDB Atlas</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ingresa a <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">mongodb.com/atlas <ExternalLink className="w-3 h-3" /></a> y regístrate gratis (puedes usar tu cuenta de Google).
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1.5 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">Crear tu Clúster Gratuito (M0 Free)</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Al ingresar al panel, selecciona el plan <strong>"Shared / M0 (Free)"</strong>. Elige como región preferente <strong>AWS São Paulo (sa-east-1)</strong> o <strong>US East (N. Virginia)</strong> para tener la menor latencia desde Bolivia. Nombra tu clúster como <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Cluster0</code> o <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">tiendita</code>.
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1.5 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">Crear Usuario y Contraseña de Base de Datos</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    En el menú lateral izquierdo, ve a <strong>Security &rarr; Database Access</strong> &rarr; botón <strong>"Add New Database User"</strong>.
                  </p>
                  <ul className="text-xs list-disc list-inside text-slate-600 pl-2 space-y-1">
                    <li>Método: <strong>Password</strong></li>
                    <li>Usuario: ejemplo <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold font-mono">tienda_admin</code></li>
                    <li>Contraseña: genera una contraseña sin caracteres raros como <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold font-mono">MiTiendaSegura2026</code> (¡anótala bien!)</li>
                    <li>Permisos: <strong>Read and write to any database</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-1.5 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">Habilitar Acceso de Red (IP Access List)</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    En el menú lateral izquierdo, ve a <strong>Security &rarr; Network Access</strong> &rarr; botón <strong>"Add IP Address"</strong>:
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
                    <span>Selecciona <strong>"ALLOW ACCESS FROM ANYWHERE"</strong> (<code className="font-bold font-mono">0.0.0.0/0</code>).</span>
                    <button
                      onClick={() => copyToClipboard('0.0.0.0/0', 'ip')}
                      className="px-2.5 py-1 bg-white rounded-lg border border-amber-300 font-bold hover:bg-amber-100 flex items-center gap-1 shrink-0"
                    >
                      {copiedKey === 'ip' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar 0.0.0.0/0</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Esto es indispensable para que tu contenedor Docker o la nube puedan conectarse sin ser bloqueados.
                  </p>
                </div>
              </div>

              {/* Paso 5 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                  5
                </div>
                <div className="space-y-1.5 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">Obtener tu Cadena de Conexión (Connection String)</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ve a <strong>Database</strong> &rarr; botón <strong>"Connect"</strong> &rarr; selecciona <strong>"Drivers" (Node.js)</strong>.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Copia la URI que se parece a:
                  </p>
                  <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto flex items-center justify-between">
                    <span>mongodb+srv://tienda_admin:&lt;password&gt;@cluster0.abcde.mongodb.net/tienda_papelito?retryWrites=true&w=majority</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Reemplaza <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">&lt;password&gt;</code> por la contraseña que creaste en el paso 3.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: DESPLIEGUE CON DOCKER */}
          {activeSubTab === 'docker' && (
            <div className="space-y-6 text-slate-700">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-base font-extrabold text-slate-900">
                  Cómo ejecutar tu aplicación con Docker en 1 solo comando
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  El proyecto ya incluye un <code className="font-mono font-bold">Dockerfile</code> y <code className="font-mono font-bold">docker-compose.yml</code> listos para producción.
                </p>
              </div>

              {/* Método 1: Docker Compose */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 text-white">
                      Método 1 (Recomendado)
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-sm">Con Docker Compose</h5>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  1. Crea un archivo <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">.env</code> en la carpeta de tu proyecto con tu URI de MongoDB Atlas:
                </p>

                <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs relative">
                  <code>MONGODB_URI="mongodb+srv://tu_usuario:tu_clave@cluster0.mongodb.net/tienda_papelito?retryWrites=true&w=majority"</code>
                </div>

                <p className="text-xs text-slate-600">
                  2. Ejecuta en tu terminal (CMD, PowerShell o Bash):
                </p>

                <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                  <code>docker compose up -d --build</code>
                  <button
                    onClick={() => copyToClipboard('docker compose up -d --build', 'cmd1')}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                    title="Copiar comando"
                  >
                    {copiedKey === 'cmd1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  ¡Listo! Abre en tu navegador <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 underline">http://localhost:3000</a>.
                </p>
              </div>

              {/* Comandos útiles de Docker */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Comandos de Mantenimiento y Logs
                </h5>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">Ver registros del servidor en tiempo real:</span>
                      <span className="text-slate-900 font-bold">docker compose logs -f</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('docker compose logs -f', 'log')}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      {copiedKey === 'log' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-400 font-sans block text-[10px]">Detener el contenedor:</span>
                      <span className="text-slate-900 font-bold">docker compose down</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('docker compose down', 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      {copiedKey === 'down' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: ARCHIVOS DE CONFIGURACIÓN */}
          {activeSubTab === 'archivos' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-base font-extrabold text-slate-900">
                  Archivos de Configuración Incluidos en el Proyecto
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Estos archivos ya están creados en la raíz de tu proyecto. Puedes copiarlos o consultarlos aquí:
                </p>
              </div>

              {/* docker-compose.yml */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 font-mono">docker-compose.yml</span>
                  <button
                    onClick={() => copyToClipboard(dockerComposeSnippet, 'dcompose')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    {copiedKey === 'dcompose' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar docker-compose.yml</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
                  {dockerComposeSnippet}
                </pre>
              </div>

              {/* Dockerfile */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 font-mono">Dockerfile</span>
                  <button
                    onClick={() => copyToClipboard(dockerfileSnippet, 'dfile')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    {copiedKey === 'dfile' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Dockerfile</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
                  {dockerfileSnippet}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Pie del modal */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tus datos se guardan en Bolivia y la nube de forma segura</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
          >
            Entendido, Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
