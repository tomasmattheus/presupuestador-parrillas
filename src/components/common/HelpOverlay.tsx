interface HelpOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-[90vw] max-w-[750px] h-[90vh] rounded-xl overflow-y-auto py-8 px-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky top-0 float-right bg-[#f0f0f0] border-none w-8 h-8 rounded-full text-lg cursor-pointer z-[1] hover:bg-[#ddd]"
        >
          &times;
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[28px] font-extrabold text-brand tracking-[2px]">QUALITY DECO</div>
          <div className="text-[11px] text-[#888] uppercase tracking-[3px]">Frentes de parrillas</div>
          <div className="text-lg font-bold text-[#2a2a2a] mt-4">Manual de Uso del Sistema</div>
          <div className="text-xs text-[#666] mt-1">Guia completa para gestionar leads, presupuestos y ventas</div>
        </div>

        {/* Acceso al sistema */}
        <SectionTitle>Acceso al sistema</SectionTitle>
        <div className="bg-[#f0f8ff] border-2 border-brand rounded-xl p-5 my-4 text-center">
          <div className="text-[15px] font-bold text-brand">presupuestosqd.vercel.app</div>
          <div className="mt-2 text-xs">Usuario: <strong>gaston</strong> &nbsp;|&nbsp; Contrasena: <strong>gaston</strong></div>
        </div>
        <P>Abri el link en tu navegador (Chrome recomendado) desde la computadora o el celular. Vas a ver una pantalla de login. Ingresa tu usuario y contrasena.</P>
        <Tip>Te recomendamos usar la computadora para generar presupuestos (el PDF sale mejor). Desde el celular podes ver el pipeline y contactos sin problema.</Tip>

        {/* Pantalla principal */}
        <SectionTitle>Pantalla principal (Home)</SectionTitle>
        <P>Cuando entras, ves 6 botones que te llevan a cada seccion del sistema:</P>
        <div className="grid grid-cols-2 gap-2.5 my-3">
          <InfoCard title="Pipeline">Tu tablero de ventas. Ves en que etapa esta cada persona que te consulto.</InfoCard>
          <InfoCard title="Presupuestos">Generas presupuestos profesionales en PDF en 2 minutos.</InfoCard>
          <InfoCard title="Contactos">La lista completa de todos los clientes.</InfoCard>
          <InfoCard title="Ventas">Las ventas que cerraste, con montos y estados.</InfoCard>
          <InfoCard title="Estadisticas">Numeros y graficos de como va el negocio.</InfoCard>
          <InfoCard title="Ajustes">Configuracion del sistema, usuarios, textos.</InfoCard>
        </div>
        <P>Debajo de los botones tenes una <strong>lista de tareas del dia</strong> donde podes anotar cosas para no olvidarte (ej: &quot;Llamar a Juan&quot;, &quot;Medir parrilla de Atilio&quot;).</P>

        {/* Pipeline */}
        <SectionTitle>Pipeline — Tu tablero de ventas</SectionTitle>
        <P>El pipeline es un tablero donde ves en que etapa esta cada persona. Las personas llegan automaticamente cuando consultan por WhatsApp.</P>

        <SubTitle>Las 3 etapas</SubTitle>
        <StageCard color="border-brand" title="Nuevo Lead">
          La persona recien consulto por WhatsApp. Todavia no le mandaste presupuesto. Estos son los que tenes que atender primero.
        </StageCard>
        <StageCard color="border-[#f59e0b]" title="Presupuesto Enviado">
          Ya le mandaste el presupuesto. Se mueve solo cuando generas el PDF desde el sistema. Aca ves cuantos dias lleva sin responder.
        </StageCard>
        <StageCard color="border-[#8b5cf6]" title="En Seguimiento">
          Estas en conversacion activa con la persona. Arrastra la tarjeta aca cuando estes hablando.
        </StageCard>

        <SubTitle>Como mover un lead</SubTitle>
        <ol className="text-xs text-[#444] pl-5 leading-[1.8]">
          <li><strong>Arrastrar:</strong> Agarra la tarjeta con el mouse y soltala en otra columna.</li>
          <li><strong>Cerrar como ganado:</strong> Aprета el boton verde (tilde) en la tarjeta. Desaparece del tablero y va a Ventas.</li>
          <li><strong>Cerrar como perdido:</strong> Apreta el boton rojo (X). Desaparece del tablero.</li>
          <li><strong>Escribirle por WhatsApp:</strong> Apreta el boton verde &quot;WA&quot; en la tarjeta. Se abre WhatsApp directo.</li>
          <li><strong>Ver toda la info:</strong> Hace click en la tarjeta. Se abre la ficha completa con todos los datos.</li>
        </ol>
        <Tip>Si un lead lleva mas de 3 dias en &quot;Presupuesto Enviado&quot;, mandale un mensaje de seguimiento. El sistema te muestra los dias al lado de la fecha.</Tip>
        <P><strong>Seccion &quot;Cerrados&quot;:</strong> Abajo del tablero hay una seccion que se expande y muestra los leads que cerraste (ganados y perdidos). Si te equivocaste, apretas &quot;Deshacer&quot; y vuelve al tablero.</P>

        {/* Presupuestos */}
        <SectionTitle>Presupuestos — Generar PDF profesional</SectionTitle>
        <SubTitle>Ver presupuestos anteriores</SubTitle>
        <P>Al entrar ves una lista de todos los presupuestos que generaste, con fecha, cliente, monto y acciones. Podes ver el detalle, editar o duplicar uno existente.</P>

        <SubTitle>Crear un presupuesto nuevo</SubTitle>
        <ol className="text-xs text-[#444] pl-5 leading-[1.8]">
          <li><strong>Apreta &quot;Crear nuevo presupuesto&quot;.</strong> El numero de presupuesto se asigna automaticamente.</li>
          <li><strong>Selecciona el lead del bot.</strong> Arriba hay un desplegable &quot;Cargar lead del bot&quot;. Si la persona consulto por WhatsApp, seleccionala y se cargan los datos automaticamente (nombre, telefono, ciudad, medidas, material).</li>
          <li><strong>Si no es del bot:</strong> Apretas &quot;Nuevo en blanco&quot; y completas los datos a mano.</li>
          <li><strong>Completa los precios</strong> de cada producto en la tabla. Podes agregar productos con &quot;+ Agregar producto&quot;.</li>
          <li><strong>Subi una foto</strong> del tipo de trabajo similar (la foto aparece grande en la portada del presupuesto).</li>
          <li><strong>Apretas &quot;Generar PDF&quot;.</strong> Se abre la ventana de impresion del navegador.</li>
          <li><strong>En la ventana de impresion:</strong> Activa &quot;Graficos en segundo plano&quot; y pone margenes en &quot;Ninguno&quot;. Despues selecciona &quot;Guardar como PDF&quot;.</li>
        </ol>
        <Warning>Siempre activa &quot;Graficos en segundo plano&quot; al imprimir. Si no, el PDF sale sin colores.</Warning>

        <SubTitle>El presupuesto tiene 3 paginas</SubTitle>
        <table className="w-full border-collapse my-2.5 text-[11px]">
          <thead>
            <tr>
              <Th>Pagina</Th>
              <Th>Contenido</Th>
            </tr>
          </thead>
          <tbody>
            <Tr><Td><strong>1 — Portada</strong></Td><Td>Foto del trabajo, datos del cliente, saludo personalizado, resumen de especificaciones y precio total</Td></Tr>
            <Tr even><Td><strong>2 — Detalle</strong></Td><Td>Tabla con cada producto, codigo, medida, precio. Subtotal, IVA y total.</Td></Tr>
            <Tr><Td><strong>3 — Pago e info</strong></Td><Td>3 formas de pago (anticipado con descuento, 50/50, cuotas), informacion del servicio, garantia y condiciones.</Td></Tr>
          </tbody>
        </table>

        <SubTitle>Que pasa automaticamente al generar</SubTitle>
        <ul className="text-xs text-[#444] pl-5 leading-[1.8]">
          <li>El lead se mueve a &quot;Presupuesto Enviado&quot; en el pipeline</li>
          <li>Si el cliente no existia en la base, se crea automaticamente</li>
          <li>El presupuesto queda guardado en el historial</li>
          <li>El archivo se guarda como &quot;Presupuesto_0001_NombreCliente.pdf&quot;</li>
        </ul>

        {/* Contactos */}
        <SectionTitle>Contactos — Tu base de clientes</SectionTitle>
        <P>Aca ves TODOS los clientes, los que vinieron por WhatsApp y los que cargaste a mano.</P>

        <SubTitle>Buscar y filtrar</SubTitle>
        <table className="w-full border-collapse my-2.5 text-[11px]">
          <thead>
            <tr><Th>Filtro</Th><Th>Que hace</Th></tr>
          </thead>
          <tbody>
            <Tr><Td><strong>Buscador</strong></Td><Td>Escribi el nombre y se filtra al instante</Td></Tr>
            <Tr even><Td><strong>Por estado</strong></Td><Td>Nuevo Lead, Presupuesto Enviado, En Seguimiento, Cerrado Ganado, Cerrado Perdido</Td></Tr>
            <Tr><Td><strong>Por material</strong></Td><Td>Epoxi o Acero Inoxidable</Td></Tr>
            <Tr even><Td><strong>Por ciudad</strong></Td><Td>Se agrupan automaticamente (todos los &quot;Rosario&quot; juntos)</Td></Tr>
          </tbody>
        </table>
        <P>Podes <strong>ordenar</strong> haciendo click en el titulo de la columna (Nombre, Ciudad, Fecha, Estado). Click de nuevo para invertir el orden.</P>

        <SubTitle>Ficha del contacto</SubTitle>
        <P>Al hacer click en un contacto se abre su ficha con:</P>
        <ul className="text-xs text-[#444] pl-5 leading-[1.8]">
          <li>Todos sus datos (nombre, telefono, ciudad, medidas, material, sistema)</li>
          <li>Link directo a <strong>WhatsApp</strong> para escribirle</li>
          <li><strong>Mensajes rapidos:</strong> 4 mensajes pre-armados que podes copiar y pegar en WhatsApp</li>
          <li><strong>Presupuestos enviados:</strong> Historial de todos los presupuestos que le generaste</li>
          <li><strong>Notas:</strong> Podes anotar cosas como &quot;Lo llame, dice que lo llame el lunes&quot;</li>
          <li>Boton <strong>&quot;Generar presupuesto&quot;</strong> que te lleva directo al formulario con los datos cargados</li>
        </ul>

        {/* Ventas */}
        <SectionTitle>Ventas — Tus cierres</SectionTitle>
        <P>Aca aparecen todos los clientes que marcaste como &quot;Cerrado Ganado&quot; en el pipeline.</P>

        <SubTitle>Filtrar por fecha</SubTitle>
        <P>Arriba tenes botones rapidos: <strong>Todo, Hoy, 7 dias, 15 dias, 30 dias</strong>. Tambien podes elegir un rango de fechas personalizado con &quot;Desde&quot; y &quot;Hasta&quot;.</P>

        <SubTitle>Datos de cada venta</SubTitle>
        <table className="w-full border-collapse my-2.5 text-[11px]">
          <thead>
            <tr><Th>Campo</Th><Th>Que poner</Th></tr>
          </thead>
          <tbody>
            <Tr><Td><strong>Monto presupuestado</strong></Td><Td>Se carga solo si le generaste presupuesto. Si no, escribilo.</Td></Tr>
            <Tr even><Td><strong>Forma de pago</strong></Td><Td>100% anticipado, 50/50, 3 cuotas, u Otro</Td></Tr>
            <Tr><Td><strong>Estado de entrega</strong></Td><Td>Pendiente fabricacion, En fabricacion, Listo para entregar, Entregado e instalado</Td></Tr>
            <Tr even><Td><strong>Notas</strong></Td><Td>Lo que quieras anotar</Td></Tr>
          </tbody>
        </table>

        <SubTitle>Exportar</SubTitle>
        <ul className="text-xs text-[#444] pl-5 leading-[1.8]">
          <li><strong>Exportar CSV:</strong> Descarga un archivo para abrir en Excel</li>
          <li><strong>Exportar Excel:</strong> Descarga un Excel formateado con resumen incluido</li>
        </ul>
        <P>Ambos exportan solo las ventas del periodo que tengas seleccionado.</P>
        <P><strong>Crear nueva venta manual:</strong> Boton &quot;+ Nueva venta&quot;. Elegis el cliente del desplegable, se cargan los datos, completas el monto y listo.</P>

        {/* Estadisticas */}
        <SectionTitle>Estadisticas — Como va el negocio</SectionTitle>
        <SubTitle>Metricas principales</SubTitle>
        <table className="w-full border-collapse my-2.5 text-[11px]">
          <thead>
            <tr><Th>Metrica</Th><Th>Que significa</Th></tr>
          </thead>
          <tbody>
            <Tr><Td><strong>Total leads</strong></Td><Td>Cuantas personas te consultaron en total</Td></Tr>
            <Tr even><Td><strong>Presupuestados</strong></Td><Td>Que porcentaje de los leads recibio presupuesto</Td></Tr>
            <Tr><Td><strong>Cerrados ganados</strong></Td><Td>Cuantas ventas cerraste</Td></Tr>
            <Tr even><Td><strong>Tasa de cierre</strong></Td><Td>De cada 100 que te consultan, cuantos compran</Td></Tr>
          </tbody>
        </table>

        <SubTitle>Graficos</SubTitle>
        <ul className="text-xs text-[#444] pl-5 leading-[1.8]">
          <li><strong>Leads por etapa:</strong> Cuantos tenes en cada columna del pipeline</li>
          <li><strong>Leads por ciudad:</strong> De donde vienen tus clientes</li>
          <li><strong>Leads por material:</strong> Epoxi vs Inoxidable — que prefieren</li>
          <li><strong>Leads por sistema:</strong> Guillotina vs Levadizo</li>
          <li><strong>Leads por semana:</strong> Cuantos leads te llegan cada semana</li>
        </ul>
        <P>Mismos filtros que Ventas: Todo, 7 dias, 15 dias, 30 dias, 90 dias, o rango personalizado. Las metricas y graficos se recalculan segun el periodo.</P>
        <P>Boton &quot;Exportar reporte&quot; descarga un Excel con todas las estadisticas del periodo seleccionado.</P>

        {/* Ajustes */}
        <SectionTitle>Ajustes</SectionTitle>
        <P>Desde aca podes configurar:</P>
        <StageCard color="border-brand" title="Datos de la empresa">
          Nombre, direccion, telefono, Instagram. Estos datos aparecen en los presupuestos PDF.
        </StageCard>
        <StageCard color="border-brand" title="Valores por defecto">
          IVA (21%), descuento por pago anticipado (5%), recargo por cuotas (15%), cantidad de cuotas (3), validez del presupuesto (10 dias). Podes cambiarlos y se aplican a todos los presupuestos nuevos.
        </StageCard>
        <StageCard color="border-brand" title="Textos">
          El saludo del presupuesto, el texto final, y las condiciones legales. Podes personalizarlos.
        </StageCard>
        <StageCard color="border-brand" title="Plantillas de mensajes">
          Los 4 mensajes rapidos que aparecen en la ficha del contacto. Podes editarlos aca.
        </StageCard>
        <StageCard color="border-brand" title="Usuarios">
          Podes agregar o eliminar personas que acceden al sistema.
        </StageCard>
        <P>Despues de cambiar algo, apreta <strong>&quot;Guardar cambios&quot;</strong>.</P>

        {/* Flujo completo */}
        <SectionTitle>El flujo completo — Como funciona todo</SectionTitle>
        <div className="bg-[#f5f5f5] rounded-[10px] p-4 my-3 font-mono text-[11px] leading-[1.9] text-[#555] whitespace-pre-wrap">
{`1. La persona ve tu anuncio en Instagram/Facebook
         \u2193
2. Hace click \u2192 le abre WhatsApp
         \u2193
3. El bot le hace preguntas automaticas
   (nombre, ciudad, medidas, material, sistema)
         \u2193
4. Los datos se guardan automaticamente
         \u2193
5. Vos abris presupuestosqd.vercel.app
         \u2193
6. En PIPELINE ves el lead nuevo
         \u2193
7. Haces click \u2192 ves sus datos \u2192 "Generar presupuesto"
         \u2193
8. Cargas los precios \u2192 generas el PDF
         \u2193
9. Le mandas el PDF por WhatsApp
         \u2193
10. Se mueve automaticamente a "Presupuesto Enviado"
         \u2193
11. Haces seguimiento (lo moves a "En Seguimiento")
         \u2193
12. Si cierra \u2192 tilde verde \u2192 aparece en VENTAS
    Si no cierra \u2192 X roja \u2192 queda en cerrados`}
        </div>

        {/* Tips */}
        <SectionTitle>Tips importantes</SectionTitle>
        <StageCard color="border-brand" title="Revisa el pipeline todos los dias">
          Si un lead lleva mas de 3 dias en &quot;Presupuesto Enviado&quot;, mandale un mensaje de seguimiento. Usa los mensajes rapidos de la ficha.
        </StageCard>
        <StageCard color="border-[#10b981]" title="Subi fotos reales a los presupuestos">
          Una foto de un trabajo similar al que el cliente quiere genera mucha mas confianza que sin foto. Elegilas del celular al momento de generar.
        </StageCard>
        <StageCard color="border-[#f59e0b]" title="Marca los cerrados">
          Si no marcas ganados/perdidos, las estadisticas no van a ser correctas. Cuando un cliente te confirma, apreta el tilde verde. Si no se da, la X roja.
        </StageCard>
        <StageCard color="border-brand" title="Usa las notas">
          Anota todo lo que pase con cada cliente: &quot;Lo llame, dice que lo llame el lunes&quot;, &quot;Esta esperando que termine la obra&quot;. Asi no te olvidas de nada.
        </StageCard>
        <StageCard color="border-[#ef4444]" title="No limpies la cache del navegador">
          Algunas configuraciones se guardan en tu navegador. Si limpias todo, vas a tener que volver a configurar los ajustes y las tareas del dia. Los datos de leads, presupuestos, ventas y notas no se pierden.
        </StageCard>

        {/* Busqueda rapida */}
        <SectionTitle>Busqueda rapida</SectionTitle>
        <P>En la barra de arriba hay un buscador. Escribi el nombre de un cliente y te aparecen resultados al instante. Hace click en un resultado para abrir su ficha.</P>

        {/* Soporte */}
        <SectionTitle>Soporte</SectionTitle>
        <P>Cualquier duda o problema con el sistema, contacta a Tomas de HQL Agency.</P>

        {/* Footer */}
        <div className="text-center pt-5 text-[#ccc] text-[10px] border-t border-[#eee] mt-8">
          Quality Deco — Frentes de parrillas<br />
          Sistema desarrollado por HQL Agency
        </div>
      </div>
    </div>
  );
}

/* ---- Reusable sub-components ---- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-extrabold text-brand mt-8 mb-3 pb-1.5 border-b-2 border-brand">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-[#2a2a2a] mt-4 mb-2">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-[#444] mb-2 leading-relaxed">{children}</p>;
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#fffbeb] border border-[#f59e0b] rounded-lg py-2.5 px-3.5 my-2.5 text-[11px]">
      <strong className="text-[#f59e0b]">TIP:</strong> {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#fef2f2] border border-[#ef4444] rounded-lg py-2.5 px-3.5 my-2.5 text-[11px]">
      <strong className="text-[#ef4444]">IMPORTANTE:</strong> {children}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#fafafa] rounded-lg p-3">
      <strong>{title}</strong><br />
      <span className="text-[11px] text-[#666]">{children}</span>
    </div>
  );
}

function StageCard({ color, title, children }: { color: string; title: string; children: React.ReactNode }) {
  return (
    <div className={`bg-[#fafafa] rounded-lg py-3.5 px-4 my-2 border-l-4 ${color}`}>
      <strong>{title}</strong><br />
      <span className="text-xs text-[#555]">{children}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="bg-[#f0f8ff] text-brand py-2 px-2.5 text-left text-[10px] uppercase">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-2 px-2.5 border-b border-[#eee]">{children}</td>;
}

function Tr({ children, even }: { children: React.ReactNode; even?: boolean }) {
  return <tr className={even ? 'bg-[#fafafa]' : ''}>{children}</tr>;
}
