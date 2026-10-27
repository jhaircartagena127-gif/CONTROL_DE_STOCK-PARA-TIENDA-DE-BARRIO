import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  CornerDownLeft, 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  Trash2,
  Printer,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Producto, Proveedor, AgendaPedido, MetricasResponse } from '../types/inventory.ts';
import { api } from '../services/api.ts';

interface AdminTerminalProps {
  productos: Producto[];
  proveedores: Proveedor[];
  agenda: AgendaPedido[];
  metricas: MetricasResponse | null;
  onPrintPdf: () => void;
  onRefreshData: () => void;
  onStockUpdated: (id: string, cambio: number) => void;
}

interface CommandLog {
  id: string;
  command: string;
  output: React.ReactNode;
  time: string;
}

export const AdminTerminal: React.FC<AdminTerminalProps> = ({
  productos,
  proveedores,
  agenda,
  metricas,
  onPrintPdf,
  onRefreshData,
  onStockUpdated
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'init-1',
      command: 'system --status',
      output: (
        <div className="space-y-1 text-slate-300">
          <p className="text-emerald-400 font-bold">
            [OK] Consola de Administración Papelito v2.4 (CLI Linux Bash Emulation)
          </p>
          <p className="text-slate-400">
            Conectado al motor PostgreSQL / Almacén Persistente. Escribe <span className="text-amber-400 font-bold">help</span> para ver la lista de comandos disponibles.
          </p>
          <p className="text-slate-500 text-[11px]">
            Comandos rápidos sugeridos: <span className="text-teal-400">inventario --pdf</span>, <span className="text-teal-400">proveedor --contacto coca-cola</span>, <span className="text-teal-400">alertas</span>
          </p>
        </div>
      ),
      time: '12:00:00'
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const executeCommand = async (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    // Guardar en historial
    setHistory(prev => [...prev, raw]);
    setHistoryIndex(-1);

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg1 = parts[1]?.toLowerCase();
    const arg2 = parts[2]?.toLowerCase();
    const fullRest = parts.slice(2).join(' ');

    let outputNode: React.ReactNode = null;

    if (cmd === 'clear' || cmd === 'cls') {
      setLogs([]);
      setInput('');
      return;
    }

    if (cmd === 'help') {
      outputNode = (
        <div className="space-y-1.5 text-slate-300">
          <p className="text-amber-400 font-bold">--- COMANDOS DISPONIBLES EN TERMINAL PAPELITO ---</p>
          <p><strong className="text-emerald-400">inventario --pdf</strong> : Genera y abre de inmediato la hoja limpia de stock lista para imprimir en PDF.</p>
          <p><strong className="text-emerald-400">proveedor --contacto &lt;nombre&gt;</strong> : Extrae el teléfono, contacto y días de visita del proveedor al instante.</p>
          <p><strong className="text-emerald-400">alertas</strong> o <strong className="text-emerald-400">stock --alerta</strong> : Muestra la lista de productos en alerta roja (stock bajo) y amarilla (por vencer).</p>
          <p><strong className="text-emerald-400">stock --add &lt;sku|nombre&gt; &lt;cant&gt;</strong> : Suma unidades de stock al producto especificado.</p>
          <p><strong className="text-emerald-400">stock --sub &lt;sku|nombre&gt; &lt;cant&gt;</strong> : Resta unidades de stock al producto especificado.</p>
          <p><strong className="text-emerald-400">agenda</strong> : Muestra en formato tabla las citas de proveedores programadas.</p>
          <p><strong className="text-emerald-400">metricas</strong> : Resumen financiero del valor invertido y ganancias estimadas.</p>
          <p><strong className="text-emerald-400">webhook --test</strong> : Dispara una prueba hacia el webhook de Google Calendar.</p>
          <p><strong className="text-emerald-400">clear</strong> : Limpia el buffer de la terminal.</p>
        </div>
      );
    } 
    // inventario --pdf
    else if (cmd === 'inventario' && (arg1 === '--pdf' || arg1 === '-p')) {
      outputNode = (
        <div className="space-y-1 text-emerald-400">
          <p className="font-bold">📄 [GENERANDO HOJA DE STOCK EN PDF...]</p>
          <p className="text-slate-300">Se ha compilado el inventario maestro con {productos.length} ítems y valor total de Bs. {metricas?.valorInvertidoTotal.toFixed(2)}.</p>
          <p className="text-amber-300">Abriendo cuadro de diálogo de impresión para guardar en PDF...</p>
        </div>
      );
      // Disparar acción
      setTimeout(() => {
        onPrintPdf();
      }, 500);
    }
    // proveedor --contacto <nombre>
    else if (cmd === 'proveedor') {
      if (arg1 === '--contacto' || arg1 === '-c' || arg1 === 'contacto') {
        const queryProv = fullRest || arg2 || '';
        if (!queryProv) {
          outputNode = <p className="text-rose-400">Error de sintaxis: Especifica el proveedor. Ej: proveedor --contacto coca-cola</p>;
        } else {
          const match = proveedores.find(p =>
            p.nombre.toLowerCase().includes(queryProv) ||
            p.categoria.toLowerCase().includes(queryProv) ||
            p.contacto.toLowerCase().includes(queryProv)
          );

          if (match) {
            outputNode = (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-slate-200">
                <p className="text-amber-400 font-bold">🏢 PROVEEDOR ENCONTRADO: {match.nombre}</p>
                <p>👤 Contacto Principal: <strong className="text-white">{match.contacto}</strong></p>
                <p>📞 Teléfono Directo: <strong className="text-emerald-400">{match.telefono}</strong></p>
                <p>✉️ Correo Electrónico: <span className="text-cyan-400">{match.email}</span></p>
                <p>🚚 Días de Visita: <span className="text-amber-300">{match.dias_visita}</span></p>
                <p>📍 Dirección: {match.direccion || 'Sin dirección registrada'}</p>
              </div>
            );
          } else {
            outputNode = <p className="text-rose-400">No se encontró ningún proveedor que coincida con "{queryProv}". Escribe "proveedores" para ver la lista completa.</p>;
          }
        }
      } else {
        // Listar todos los proveedores
        outputNode = (
          <div className="space-y-2">
            <p className="text-amber-400 font-bold">DIRECTORIO DE PROVEEDORES REGISTRADOS:</p>
            {proveedores.map(p => (
              <p key={p.id} className="text-slate-300 text-xs">
                • <strong className="text-white">{p.nombre}</strong> | {p.contacto} | Tel: <span className="text-emerald-400">{p.telefono}</span> | Días: {p.dias_visita}
              </p>
            ))}
          </div>
        );
      }
    }
    // alertas o stock --alerta
    else if (cmd === 'alertas' || (cmd === 'stock' && arg1 === '--alerta')) {
      const hoy = new Date('2026-10-14T12:00:00Z').getTime();
      const ms15Dias = 15 * 24 * 60 * 60 * 1000;

      const rojas = productos.filter(p => p.stock_actual <= p.stock_minimo);
      const amarillas = productos.filter(p => {
        if (!p.fecha_vencimiento) return false;
        const diff = new Date(p.fecha_vencimiento + 'T00:00:00Z').getTime() - hoy;
        return diff <= ms15Dias;
      });

      outputNode = (
        <div className="space-y-2">
          <p className="text-rose-400 font-bold">🚨 [ALERTAS ROJAS - STOCK CRÍTICO: {rojas.length}]</p>
          {rojas.map(p => (
            <p key={p.id} className="text-xs text-rose-200">
              • [{p.sku}] <strong>{p.nombre}</strong>: Quedan {p.stock_actual} (Mín: {p.stock_minimo}). Falta pedir +{p.stock_minimo - p.stock_actual} a {p.proveedor}
            </p>
          ))}

          <p className="text-amber-400 font-bold mt-2">⚠️ [ALERTAS AMARILLAS - VENCIMIENTO &lt;15 DÍAS: {amarillas.length}]</p>
          {amarillas.map(p => (
            <p key={p.id} className="text-xs text-amber-200">
              • [{p.sku}] <strong>{p.nombre}</strong>: Vence el {p.fecha_vencimiento} (Stock: {p.stock_actual} {p.unidad_medida})
            </p>
          ))}
        </div>
      );
    }
    // stock --add o stock --sub
    else if (cmd === 'stock' && (arg1 === '--add' || arg1 === '--sub')) {
      const targetQuery = parts[2];
      const cantidad = parseInt(parts[3], 10);

      if (!targetQuery || isNaN(cantidad)) {
        outputNode = <p className="text-rose-400">Sintaxis: stock --add &lt;SKU|Nombre&gt; &lt;cantidad&gt;. Ej: stock --add LAC-001 10</p>;
      } else {
        const prod = productos.find(p =>
          p.sku.toLowerCase() === targetQuery.toLowerCase() ||
          p.nombre.toLowerCase().includes(targetQuery.toLowerCase())
        );

        if (!prod) {
          outputNode = <p className="text-rose-400">Producto no encontrado con criterio: {targetQuery}</p>;
        } else {
          const delta = arg1 === '--add' ? cantidad : -cantidad;
          onStockUpdated(prod.id, delta);
          outputNode = (
            <p className="text-emerald-400 font-semibold">
              ✅ Stock actualizado para [{prod.sku}] {prod.nombre}: {prod.stock_actual} &rarr; {Math.max(0, prod.stock_actual + delta)} {prod.unidad_medida}.
            </p>
          );
        }
      }
    }
    // agenda
    else if (cmd === 'agenda') {
      outputNode = (
        <div className="space-y-1">
          <p className="text-amber-400 font-bold">📅 AGENDA DE VISITAS Y PEDIDOS (PostgreSQL):</p>
          {agenda.length === 0 ? (
            <p className="text-slate-400">No hay citas registradas en la agenda.</p>
          ) : (
            agenda.map(a => (
              <p key={a.id} className="text-xs text-slate-300">
                • <strong className="text-white">{a.fecha} {a.hora}</strong> | {a.proveedor} | Nota: {a.nota} [{a.estado}]
              </p>
            ))
          )}
        </div>
      );
    }
    // metricas
    else if (cmd === 'metricas' || cmd === 'stats') {
      outputNode = (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-slate-200">
          <p className="text-amber-400 font-bold">📊 BALANCE FINANCIERO Y DE STOCK TIENDA:</p>
          <p>• Valor total invertido: <strong className="text-white">Bs. {metricas?.valorInvertidoTotal.toFixed(2)}</strong></p>
          <p>• Venta bruta estimada: <strong className="text-emerald-400">Bs. {metricas?.valorVentaTotal.toFixed(2)}</strong></p>
          <p>• Ganancia proyectada: <strong className="text-cyan-400">Bs. {metricas?.gananciaProyectada.toFixed(2)}</strong></p>
          <p>• Total productos registrados: <strong className="text-white">{metricas?.cantidadProductos}</strong> ({metricas?.unidadesTotales} unidades físicas)</p>
          <p>• Alertas activas: <strong className="text-rose-400">{metricas?.alertasActivas}</strong></p>
        </div>
      );
    }
    // webhook --test
    else if (cmd === 'webhook' && arg1 === '--test') {
      try {
        const res = await api.triggerWebhookTest({
          evento: 'PRUEBA_TERMINAL_ADMIN',
          origen: 'CLI_PAPELITO',
          hora: new Date().toISOString()
        });
        outputNode = (
          <p className="text-emerald-400">
            📡 [WEBHOOK EXITOSO]: {res.mensaje} (Status 200 OK)
          </p>
        );
      } catch (err: any) {
        outputNode = <p className="text-rose-400">Error en el webhook: {err.message}</p>;
      }
    } else {
      outputNode = (
        <p className="text-rose-400">
          Comando no reconocido: "{raw}". Escribe <span className="text-amber-400 font-bold">help</span> para ver la lista de comandos.
        </p>
      );
    }

    setLogs(prev => [
      ...prev,
      {
        id: 'log-' + Date.now(),
        command: raw,
        output: outputNode,
        time: new Date().toLocaleTimeString()
      }
    ]);

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < history.length) {
          setHistoryIndex(nextIdx);
          setInput(history[history.length - 1 - nextIdx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const quickCommands = [
    'inventario --pdf',
    'proveedor --contacto coca-cola',
    'alertas',
    'agenda',
    'metricas',
    'webhook --test',
    'help'
  ];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-terminal flex flex-col h-[580px]">
      
      {/* Barra de título estilo Terminal Hacker */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-400 ml-2 font-mono flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            admin@tienda-papelito: /opt/stock-control
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            title="Limpiar pantalla"
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Botones de comandos rápidos tipo chip */}
      <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">
          Comandos Rápidos:
        </span>
        {quickCommands.map((c) => (
          <button
            key={c}
            onClick={() => executeCommand(c)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 text-[11px] font-mono shrink-0 transition"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Salida del Terminal */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs text-slate-200 select-text"
      >
        {logs.map((log) => (
          <div key={log.id} className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-emerald-400 font-bold">tienda@papelito:~$</span>
              <span className="text-white font-semibold">{log.command}</span>
              <span className="text-[10px] text-slate-600 ml-auto">{log.time}</span>
            </div>
            <div className="pl-4 py-1 text-slate-300">
              {log.output}
            </div>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Línea de entrada del prompt interactivo */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 font-mono text-xs">
        <span className="text-emerald-400 font-bold select-none">
          tienda@papelito:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un comando (ej: inventario --pdf o help)..."
          className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-600 font-mono"
          autoFocus
        />
        <button
          onClick={() => executeCommand(input)}
          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
