import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../config/db.ts';

// Cliente Gemini según especificación oficial de AI Studio
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const papelitoController = {
  async chat(req: Request, res: Response) {
    try {
      const { mensaje, historial = [] } = req.body;

      if (!mensaje || typeof mensaje !== 'string') {
        return res.status(400).json({ ok: false, error: 'El mensaje es obligatorio' });
      }

      // 1. Obtener estado actual en vivo de la tienda
      const metricas = db.getMetricas();
      const alertas = db.getAlertas();
      const productos = db.getProductos();
      const proveedores = db.getProveedores();
      const agenda = db.getAgenda();

      // Fecha contextual del sistema
      const fechaActualIso = '2026-10-14'; // Miércoles 14 de Octubre de 2026

      // Preparar resumen para el prompt
      const articulosAgotados = alertas.alertasStock.map(a =>
        `- ${a.producto.nombre}: Stock actual ${a.producto.stock_actual} (Mínimo: ${a.producto.stock_minimo}, Falta pedir: ${a.deficiencia} ${a.producto.unidad_medida}) | Proveedor: ${a.producto.proveedor} | Costo unit: Bs. ${a.producto.precio_compra}`
      ).join('\n');

      const articulosPorVencer = alertas.alertasVencimiento.map(a =>
        `- ${a.producto.nombre}: Vence el ${a.producto.fecha_vencimiento} (${a.motivo}) | Stock actual: ${a.producto.stock_actual} ${a.producto.unidad_medida}`
      ).join('\n');

      const listaProveedores = proveedores.map(p =>
        `- ${p.nombre} (Rubro: ${p.categoria}) | Contacto: ${p.contacto} | Teléfono: ${p.telefono} | Días de visita habitual: ${p.dias_visita}`
      ).join('\n');

      const listaAgenda = agenda.map(ag =>
        `- ${ag.fecha} a las ${ag.hora} | ${ag.proveedor} | Nota: ${ag.nota} [Estado: ${ag.estado}]`
      ).join('\n');

      let respuestaTexto = '';
      let accionEjecutada: any = null;

      // Si existe clave de Gemini, consultar modelo gemini-3.8-flash con system instruction
      if (process.env.GEMINI_API_KEY) {
        try {
          const systemInstruction = `
Eres "Papelito", el ayudante de confianza, amable y cercano de una tienda de barrio / almacén en Bolivia (hablas como un casero cordial, claro, respetuoso y servicial, en español boliviano/latinoamericano).
Tu labor es ayudar al dueño de la tienda a no enredarse y llevar sus cuentas claras.
Siempre que te hagan una pregunta, usa los datos reales del negocio que te proporciono a continuación.

FECHA ACTUAL: Jueves 15 de Octubre de 2026.

REGLAS DE ACTUACIÓN:
1. SI LA TIENDA TIENE 0 PRODUCTOS:
   - Explica con cariño y sencillez que aún no hay productos registrados, y que puede presionar el botón verde "+ Registrar Producto" para empezar a anotar lo que tiene en sus estantes.

2. SI TE PREGUNTAN "¿Qué falta comprar hoy?" o similar:
   - Si no hay alertas o no hay productos, dilo claramente.
   - Si hay artículos con stock bajo, lístalos de forma resumida, clara y dile a qué distribuidor llamar.

3. SI EL USUARIO PIDE AGENDAR UNA VISITA O REUNIÓN (Ej: "Agenda que el distribuidor de lácteos viene el viernes a las 10 AM"):
   - Incluye en una línea final EXACTAMENTE el formato JSON:
     <<ACCION_AGENDAR:{"proveedor":"NOMBRE_PROVEEDOR","fecha":"YYYY-MM-DD","hora":"HH:mm","nota":"..."}>>

4. CONSULTAS DE DINERO O EXISTENCIAS:
   - Responde con números claros y en bolivianos (Bs.).

ESTADO EN VIVO DE LA TIENDA:
- Total productos en catálogo: ${productos.length}
- Inversión en mercadería: Bs. ${metricas.valorInvertidoTotal}
- Venta estimada: Bs. ${metricas.valorVentaTotal}
- Artículos con stock bajo:
${articulosAgotados || 'Ninguno por ahora.'}
- Artículos por vencer:
${articulosPorVencer || 'Ninguno por vencer en los próximos 15 días.'}
- Directorio de proveedores:
${listaProveedores}
- Visitas de proveedores agendadas:
${listaAgenda || 'No hay visitas programadas por el momento.'}
`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: mensaje,
            config: {
              systemInstruction,
              temperature: 0.6,
            }
          });

          respuestaTexto = response.text || '';
        } catch (apiError: any) {
          console.warn('Error en llamada a Gemini API, usando motor heurístico:', apiError.message);
          respuestaTexto = '';
        }
      }

      // Si no hay respuesta de Gemini (o falló / falta key), procesamiento heurístico de respaldo de alta fidelidad
      if (!respuestaTexto) {
        const queryLower = mensaje.toLowerCase().trim();

        if (productos.length === 0 && (queryLower.includes('falta comprar') || queryLower.includes('comprar') || queryLower.includes('dinero') || queryLower.includes('invertido') || queryLower.includes('vence') || queryLower.includes('stock'))) {
          respuestaTexto = '¡Hola casero! Actualmente aún no has registrado productos en tu tienda. Puedes comenzar agregando tus primeros artículos con el botón verde **"+ Registrar Producto"**. Una vez registrados, te diré qué te falta comprar y cuánto dinero tienes invertido.';
        } else if (queryLower.includes('falta comprar') || queryLower.includes('artículos agotados') || queryLower.includes('articulos agotados') || queryLower.includes('reponer') || queryLower.includes('comprar hoy')) {
          if (alertas.alertasStock.length === 0) {
            respuestaTexto = '¡Buenas noticias casero! Todo tu inventario está abastecido y sobre el stock mínimo. No tienes artículos urgentes por comprar hoy.';
          } else {
            const items = alertas.alertasStock.map(a =>
              `• ${a.producto.nombre}: te quedan solo ${a.producto.stock_actual} (Mínimo: ${a.producto.stock_minimo}). Falta pedir al menos ${a.deficiencia} ${a.producto.unidad_medida} a ${a.producto.proveedor}.`
            ).join('\n');
            respuestaTexto = `Hola casero, revisé tu tienda. Hoy te falta comprar estos ${alertas.alertasStock.length} artículos:\n\n${items}\n\n¿Quieres que te ayude a agendar la visita de alguno de los repartidores?`;
          }
        } else if (queryLower.includes('agenda') || queryLower.includes('cita') || queryLower.includes('visita')) {
          // Detectar proveedor
          let prov = 'Distribuidor General';
          let fecha = '2026-10-16';
          let hora = '10:00';

          if (queryLower.includes('lacteo') || queryLower.includes('lácteo') || queryLower.includes('leche')) {
            prov = 'Lácteos del Valle';
          } else if (queryLower.includes('coca') || queryLower.includes('gaseosa') || queryLower.includes('bebida')) {
            prov = 'Coca-Cola FEMSA / Embotelladora';
          } else if (queryLower.includes('san mart') || queryLower.includes('abarrote')) {
            prov = 'Distribuidora San Martín (Abarrotes)';
          } else if (queryLower.includes('pan')) {
            prov = 'Panadería Tradición & Masa';
          } else if (queryLower.includes('limpieza') || queryLower.includes('quimic')) {
            prov = 'Química Limpia Perú';
          }

          if (queryLower.includes('viernes')) fecha = '2026-10-16';
          else if (queryLower.includes('lunes')) fecha = '2026-10-19';
          else if (queryLower.includes('martes')) fecha = '2026-10-20';
          else if (queryLower.includes('miércoles') || queryLower.includes('miercoles')) fecha = '2026-10-21';
          else if (queryLower.includes('jueves')) fecha = '2026-10-22';
          else if (queryLower.includes('mañana')) fecha = '2026-10-15';
          else if (queryLower.includes('hoy')) fecha = '2026-10-14';

          const matchHora = queryLower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i) || queryLower.match(/a las\s*(\d{1,2})/i);
          if (matchHora) {
            let h = parseInt(matchHora[1], 10);
            if (matchHora[3] && matchHora[3].toLowerCase() === 'pm' && h < 12) h += 12;
            if (matchHora[3] && matchHora[3].toLowerCase() === 'am' && h === 12) h = 0;
            hora = `${h.toString().padStart(2, '0')}:${matchHora[2] || '00'}`;
          }

          const nuevaCita = db.addAgenda({
            proveedor: prov,
            fecha,
            hora,
            nota: `Visita de abastecimiento coordinada con Papelito (${mensaje})`,
            productos_esperados: 'Reposición de stock crítico',
            estado: 'programado'
          });

          accionEjecutada = { tipo: 'cita_agendada', cita: nuevaCita };
          respuestaTexto = `¡Listo! Acabo de registrar la visita de **${prov}** para el **${fecha}** a las **${hora}**. Ya se ejecutó el Webhook y quedó guardada en la tabla de agenda y lista para tu Google Calendar.`;
        } else if (queryLower.includes('vence') || queryLower.includes('vencimiento') || queryLower.includes('caduc')) {
          const v = alertas.alertasVencimiento;
          if (v.length === 0) {
            respuestaTexto = 'No tienes productos por vencer en los próximos 15 días. Todo tu inventario está en fechas seguras.';
          } else {
            const listado = v.map(a => `• ${a.producto.nombre}: ${a.motivo} (Stock: ${a.producto.stock_actual} ${a.producto.unidad_medida})`).join('\n');
            respuestaTexto = `¡Atención! Hay ${v.length} producto(s) con vencimiento cercano:\n\n${listado}\n\nTe sugiero colocarlos en oferta o exhibición prioritaria en el mostrador.`;
          }
        } else if (queryLower.includes('dinero') || queryLower.includes('invertido') || queryLower.includes('capital') || queryLower.includes('cuanto vale')) {
          respuestaTexto = `Actualmente tienes un valor total invertido en inventario de **Bs. ${metricas.valorInvertidoTotal.toFixed(2)}**, distribuido en **${metricas.cantidadProductos} productos** (${metricas.unidadesTotales} unidades en tienda). Si se vende todo el stock actual, el ingreso bruto estimado es de **Bs. ${metricas.valorVentaTotal.toFixed(2)}** (ganancia proyectada de Bs. ${metricas.gananciaProyectada.toFixed(2)}).`;
        } else if (queryLower.includes('telefono') || queryLower.includes('teléfono') || queryLower.includes('contacto') || queryLower.includes('proveedor')) {
          const provs = proveedores.map(p => `• **${p.nombre}**: ${p.contacto} - 📞 ${p.telefono} (${p.dias_visita})`).join('\n');
          respuestaTexto = `Aquí tienes el directorio de tus proveedores principales:\n\n${provs}`;
        } else {
          respuestaTexto = `Hola, soy Papelito, tu asistente de la tienda. Puedo decirte qué falta comprar hoy, cuánto dinero tenemos en stock, qué productos vencen pronto, darte teléfonos de distribuidores o agendar directamente sus visitas a tu Google Calendar. ¿Qué necesitas revisar?`;
        }
      }

      // Procesar etiquetas de acción si Gemini las devolvió en el texto
      if (respuestaTexto.includes('<<ACCION_AGENDAR:')) {
        try {
          const match = respuestaTexto.match(/<<ACCION_AGENDAR:(.*?)>>/s);
          if (match && match[1]) {
            const data = JSON.parse(match[1]);
            const provInfo = db.getProveedorByName(data.proveedor) || { nombre: data.proveedor, contacto: 'Coordinado por IA', telefono: '' };
            const cita = db.addAgenda({
              proveedor: provInfo.nombre,
              fecha: data.fecha || '2026-10-16',
              hora: data.hora || '10:00',
              nota: data.nota || 'Visita agendada automáticamente por Papelito',
              contacto: `${provInfo.contacto} ${provInfo.telefono}`.trim(),
              productos_esperados: 'Pedido de reposición',
              estado: 'programado'
            });
            accionEjecutada = { tipo: 'cita_agendada', cita };
            respuestaTexto = respuestaTexto.replace(/<<ACCION_AGENDAR:.*?>>/s, '').trim();
          }
        } catch (e) {
          console.error('Error al procesar ACCION_AGENDAR:', e);
        }
      }

      if (respuestaTexto.includes('<<ACCION_STOCK:')) {
        try {
          const match = respuestaTexto.match(/<<ACCION_STOCK:(.*?)>>/s);
          if (match && match[1]) {
            const data = JSON.parse(match[1]);
            const prod = productos.find(p => p.nombre.toLowerCase().includes(data.productoNombre.toLowerCase()));
            if (prod) {
              const nuevoStock = Math.max(0, prod.stock_actual + Number(data.cambio));
              const prodAct = db.updateProducto(prod.id, { stock_actual: nuevoStock }, data.motivo || 'Modificación por comando de Papelito');
              accionEjecutada = { tipo: 'stock_modificado', producto: prodAct, cambio: data.cambio };
            }
            respuestaTexto = respuestaTexto.replace(/<<ACCION_STOCK:.*?>>/s, '').trim();
          }
        } catch (e) {
          console.error('Error al procesar ACCION_STOCK:', e);
        }
      }

      res.json({
        ok: true,
        respuesta: respuestaTexto,
        accion: accionEjecutada,
        metricas: db.getMetricas()
      });
    } catch (error: any) {
      console.error('Error en papelito chat:', error);
      res.status(500).json({ ok: false, error: error.message });
    }
  }
};
