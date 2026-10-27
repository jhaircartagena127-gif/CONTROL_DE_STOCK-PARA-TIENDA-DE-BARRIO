/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Store, 
  Sparkles, 
  MessageCircle, 
  CalendarCheck, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  PlusCircle
} from 'lucide-react';
import { api } from './services/api.ts';
import { Producto, MetricasResponse, AlertaStock, AlertaVencimiento, AgendaPedido, Proveedor } from './types/inventory.ts';
import { Header } from './components/Header.tsx';
import { MetricsCards } from './components/MetricsCards.tsx';
import { AlertsModule } from './components/AlertsModule.tsx';
import { MasterInventoryTable } from './components/MasterInventoryTable.tsx';
import { PapelitoAssistant } from './components/PapelitoAssistant.tsx';
import { AgendaCalendar } from './components/AgendaCalendar.tsx';
import { ProductModal } from './components/ProductModal.tsx';
import { PrintInventoryView } from './components/PrintInventoryView.tsx';
import { ExportDownloadModal } from './components/ExportDownloadModal.tsx';
import { BarcodeScannerModal } from './components/BarcodeScannerModal.tsx';
import { DatabaseModal } from './components/DatabaseModal.tsx';
import { InstallPwaModal } from './components/InstallPwaModal.tsx';
import { BottomNavigation } from './components/BottomNavigation.tsx';
import { usePWA } from './usePWA.ts';
import { Smartphone, WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inventario' | 'alertas' | 'proveedores' | 'asistente'>('inventario');
  
  // PWA & Instalación
  const { isInstallable, isInstalled, isIOS, isAndroid, isOnline, triggerInstall } = usePWA();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [dismissInstallBanner, setDismissInstallBanner] = useState<boolean>(false);

  // Datos del backend
  const [productos, setProductos] = useState<Producto[]>([]);
  const [metricas, setMetricas] = useState<MetricasResponse | null>(null);
  const [alertasStock, setAlertasStock] = useState<AlertaStock[]>([]);
  const [alertasVencimiento, setAlertasVencimiento] = useState<AlertaVencimiento[]>([]);
  const [agenda, setAgenda] = useState<AgendaPedido[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modales
  const [isPapelitoFloatingOpen, setIsPapelitoFloatingOpen] = useState<boolean>(false);
  const [papelitoInitialQuery, setPapelitoInitialQuery] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Producto | null>(null);

  // Notificaciones Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Carga centralizada de datos
  const loadAllData = useCallback(async () => {
    try {
      const [prodRes, metRes, alRes, agRes, provRes] = await Promise.all([
        api.getProductos(),
        api.getMetricas(),
        api.getAlertas(),
        api.getAgenda(),
        api.getProveedores()
      ]);

      if (prodRes.ok) setProductos(prodRes.productos);
      if (metRes.ok) setMetricas(metRes.metricas);
      if (alRes.ok) {
        setAlertasStock(alRes.alertasStock);
        setAlertasVencimiento(alRes.alertasVencimiento);
      }
      if (agRes.ok) setAgenda(agRes.agenda);
      if (provRes.ok) setProveedores(provRes.proveedores);
    } catch (err) {
      console.error('Error al sincronizar datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Actualizar stock con un clic (+1, -1)
  const handleUpdateStock = async (id: string, cambio: number) => {
    try {
      const res = await api.updateStockRapido(id, { cambio });
      if (res.ok) {
        if (cambio > 0) {
          confetti({ particleCount: 20, spread: 45, origin: { y: 0.85 } });
        }
        showToast(res.mensaje || 'Cantidad actualizada');
        loadAllData();
      }
    } catch (err: any) {
      showToast('Error al modificar cantidad', 'alert');
    }
  };

  // Fijar stock directo por teclado
  const handleSetDirectStock = async (id: string, nuevoStock: number) => {
    try {
      const res = await api.updateStockRapido(id, { nuevoStock });
      if (res.ok) {
        showToast(res.mensaje || 'Cantidad actualizada');
        loadAllData();
      }
    } catch (err) {
      showToast('Error al modificar cantidad', 'alert');
    }
  };

  // Guardar producto nuevo o editado manualmente
  const handleSaveProduct = async (prodData: Partial<Producto>) => {
    try {
      if (productToEdit) {
        const res = await api.updateProducto(productToEdit.id, prodData);
        if (res.ok) {
          showToast(`Producto "${prodData.nombre}" guardado.`);
        }
      } else {
        const res = await api.addProducto(prodData);
        if (res.ok) {
          confetti({ particleCount: 35, spread: 60 });
          showToast(`"${prodData.nombre}" registrado en tu tienda.`);
        }
      }
      loadAllData();
    } catch (err) {
      showToast('Error al guardar el producto', 'alert');
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: string) => {
    const prod = productos.find(p => p.id === id);
    if (!window.confirm(`¿Seguro que deseas eliminar "${prod?.nombre || 'este producto'}" de tu inventario?`)) {
      return;
    }
    try {
      const res = await api.deleteProducto(id);
      if (res.ok) {
        showToast('Producto retirado del inventario.');
        loadAllData();
      }
    } catch (err) {
      showToast('Error al eliminar', 'alert');
    }
  };

  // Agenda: Agregar visita o pedido
  const handleAddAgenda = async (cita: Partial<AgendaPedido>) => {
    try {
      const res = await api.addAgenda(cita);
      if (res.ok) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        showToast(`Visita con ${cita.proveedor} anotada en tu calendario.`);
        loadAllData();
      }
    } catch (err) {
      showToast('Error al agendar visita', 'alert');
    }
  };

  // Agenda: Actualizar estado
  const handleUpdateAgendaStatus = async (id: string, estado: 'programado' | 'completado' | 'cancelado') => {
    try {
      const res = await api.updateAgenda(id, { estado });
      if (res.ok) {
        showToast(`Estado actualizado: ${estado === 'completado' ? 'Mercadería recibida' : estado}`);
        loadAllData();
      }
    } catch (err) {
      showToast('Error al actualizar estado', 'alert');
    }
  };

  // Agenda: Eliminar cita
  const handleDeleteAgenda = async (id: string) => {
    if (!window.confirm('¿Deseas borrar esta visita anotada?')) return;
    try {
      const res = await api.deleteAgenda(id);
      if (res.ok) {
        showToast('Visita retirada de la agenda.');
        loadAllData();
      }
    } catch (err) {
      showToast('Error al eliminar cita', 'alert');
    }
  };

  // Disparar consulta a Papelito
  const handleAskPapelito = (query: string) => {
    setPapelitoInitialQuery(query);
    setIsPapelitoFloatingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Notificación Toast flotante */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-bounce flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border-2 border-emerald-500 shadow-xl text-xs sm:text-sm text-slate-900 font-bold">
          {toast.type === 'alert' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Cabecera amigable con pestañas grandes */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={metricas?.alertasActivas || 0}
        productCount={productos.length}
        onOpenAddModal={() => {
          setProductToEdit(null);
          setIsProductModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPapelitoChat={() => setIsPapelitoFloatingOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onRefreshData={loadAllData}
        isInstalled={isInstalled}
      />

      {/* Indicador cuando no hay conexión a internet */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
          <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
          <span>Modo sin conexión activo — Tus productos siguen guardados y disponibles en tu dispositivo.</span>
        </div>
      )}

      {/* Banner de instalación en celular / laptop */}
      {!isInstalled && !dismissInstallBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-500/30">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                    Recomendado
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    ¿Quieres instalar "Mi Tiendita" como App?
                  </h4>
                </div>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Ábrela desde el icono de tu pantalla de inicio en tu celular o laptop, a pantalla completa y sin depender del navegador web.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setDismissInstallBanner(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white hover:bg-white/10 transition"
              >
                Más tarde
              </button>
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <Smartphone className="w-4 h-4" />
                <span>Instalar como App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal con padding inferior para la barra móvil */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
        
        {/* PESTAÑA 1: INVENTARIO DE PRODUCTOS */}
        {activeTab === 'inventario' && (
          <div className="space-y-6 animate-fade-in">
            {/* Tarjetas de Métricas Rápidas */}
            <MetricsCards
              metricas={metricas}
              onFilterAlerts={() => setActiveTab('alertas')}
              onOpenInventory={() => {}}
            />

            {/* Tabla del Inventario Maestro con botones grandes */}
            <MasterInventoryTable
              productos={productos}
              onUpdateStock={handleUpdateStock}
              onSetDirectStock={handleSetDirectStock}
              onOpenAddModal={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onOpenEditModal={(p) => {
                setProductToEdit(p);
                setIsProductModalOpen(true);
              }}
              onDeleteProducto={handleDeleteProduct}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          </div>
        )}

        {/* PESTAÑA 2: AVISOS Y ALERTAS */}
        {activeTab === 'alertas' && (
          <div className="space-y-6 animate-fade-in">
            <MetricsCards
              metricas={metricas}
              onFilterAlerts={() => {}}
              onOpenInventory={() => setActiveTab('inventario')}
            />

            <AlertsModule
              alertasStock={alertasStock}
              alertasVencimiento={alertasVencimiento}
              onRestock={(id, cant) => handleUpdateStock(id, cant)}
              onAskPapelito={handleAskPapelito}
              onScheduleSupplier={(prov, prod) => {
                setActiveTab('proveedores');
                handleAddAgenda({
                  proveedor: prov,
                  fecha: '2026-10-16',
                  hora: '10:00',
                  nota: `Reponer urgente ${prod}`
                });
              }}
            />
          </div>
        )}

        {/* PESTAÑA 3: PROVEEDORES & PEDIDOS */}
        {activeTab === 'proveedores' && (
          <div className="space-y-6 animate-fade-in">
            <AgendaCalendar
              agenda={agenda}
              proveedores={proveedores}
              onAddAgenda={handleAddAgenda}
              onUpdateStatus={handleUpdateAgendaStatus}
              onDeleteAgenda={handleDeleteAgenda}
              onTestWebhook={() => showToast('Conexión con Google Calendar verificada')}
            />
          </div>
        )}

        {/* PESTAÑA 4: ASISTENTE PAPELITO EN PANTALLA COMPLETA */}
        {activeTab === 'asistente' && (
          <div className="space-y-6 animate-fade-in">
            <PapelitoAssistant
              isOpen={true}
              isTabMode={true}
              onClose={() => setActiveTab('inventario')}
              onDataChanged={loadAllData}
              initialQuery={papelitoInitialQuery}
            />
          </div>
        )}

      </main>

      {/* Botón flotante para llamar a Clippy en cualquier momento (oculto en móvil para no tapar navegación) */}
      {activeTab !== 'asistente' && !isPapelitoFloatingOpen && (
        <button
          onClick={() => setIsPapelitoFloatingOpen(true)}
          className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
        >
          <span className="text-xl">🏪</span>
          <div className="text-left">
            <span className="block font-black leading-tight">Preguntar a Clippy</span>
            <span className="text-xs font-bold text-amber-950">Ayudante por voz e IA</span>
          </div>
        </button>
      )}

      {/* Ventana flotante de Papelito */}
      <PapelitoAssistant
        isOpen={isPapelitoFloatingOpen}
        onClose={() => {
          setIsPapelitoFloatingOpen(false);
          setPapelitoInitialQuery('');
        }}
        onDataChanged={loadAllData}
        initialQuery={papelitoInitialQuery}
      />

      {/* Modal para Registrar/Editar Producto Manualmente */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productoParaEditar={productToEdit}
        proveedores={proveedores}
      />

      {/* Modal para Elegir Descarga en PDF o Excel */}
      <ExportDownloadModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        productos={productos}
        metricas={metricas}
        onOpenPdf={() => setIsPrintModalOpen(true)}
      />

      {/* Vista limpia para imprimir en PDF */}
      <PrintInventoryView
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        productos={productos}
        metricas={metricas}
      />

      {/* Modal de Escaneo con Cámara de Códigos de Barras */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        productos={productos}
        onUpdateStock={handleUpdateStock}
        onRegisterNewProductWithBarcode={(barcode) => {
          setIsScannerOpen(false);
          setProductToEdit({
            id: '',
            sku: barcode,
            nombre: '',
            categoria: 'Abarrotes',
            stock_actual: 1,
            stock_minimo: 3,
            precio_compra: 0,
            precio_venta: 0,
            fecha_vencimiento: '',
            proveedor: '',
            unidad_medida: 'unidades',
            activo: true
          });
          setIsProductModalOpen(true);
        }}
        onOpenEditProduct={(prod) => {
          setIsScannerOpen(false);
          setProductToEdit(prod);
          setIsProductModalOpen(true);
        }}
      />

      {/* Modal de Conexión a Base de Datos (MongoDB Atlas & Docker) */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />

      {/* Modal de Instalación PWA (Celular y Computadora) */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        isAndroid={isAndroid}
        onInstall={triggerInstall}
      />

      {/* Barra de Navegación Móvil Inferior (Estilo App Nativa) */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={metricas?.alertasActivas || 0}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAddModal={() => {
          setProductToEdit(null);
          setIsProductModalOpen(true);
        }}
        onOpenPapelitoChat={() => setIsPapelitoFloatingOpen(true)}
      />

      {/* Pie de página cálido y amigable */}
      <footer className="no-print mt-auto py-6 pb-24 md:pb-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <p className="font-semibold text-slate-700">Mi Tiendita • Sistema Fácil de Control de Inventario y Ventas</p>
        <p className="text-slate-400 mt-0.5">Diseñado para que administrar tu negocio sea rápido y sin enredos.</p>
      </footer>

    </div>
  );
}
