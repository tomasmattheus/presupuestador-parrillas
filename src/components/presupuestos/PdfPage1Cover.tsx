import { useMemo } from 'react';
import type { LineItem, AppSettings } from '../../types';
import type { PresupFormData } from '../../hooks/usePresupuestoForm';
import { formatPrice } from '../../lib/formatters';
import { formatDateAR } from '../../lib/dates';

interface Props {
  formData: PresupFormData;
  lineItems: LineItem[];
  settings: AppSettings;
  calculateTotals: () => { subtotal: number; iva: number; total: number };
  nro?: string;
  fecha?: string;
  saludo?: string;
  validez?: string;
  photoUrl?: string;
}

export default function PdfPage1Cover({
  formData,
  lineItems: _lineItems,
  settings,
  calculateTotals,
  nro = '0001',
  fecha,
  saludo,
  validez,
  photoUrl,
}: Props) {
  const { total } = calculateTotals();

  const heroImage = photoUrl || (
    formData.material.toLowerCase().indexOf('inox') >= 0
      ? 'foto-inox-frente.jpg'
      : 'foto-frente.jpg'
  );

  const saludoText = saludo || settings.saludo;
  const validezText = validez || settings.validez;
  const cliente = formData.cliente || '-';
  const localidad = formData.localidad || '-';

  const greetingProcessed = useMemo(() => {
    const replaced = saludoText.replace(/\[cliente\]/gi, cliente);
    const parts = replaced.match(/^([^.!?]+[.!?])\s*([\s\S]*)$/);
    return {
      line1: parts ? parts[1] : replaced,
      rest: parts ? parts[2] : '',
    };
  }, [saludoText, cliente]);

  const configParts = useMemo(() => {
    const parts: string[] = [];
    if (formData.cbBajo) parts.push('Bajo parrilla ' + formData.bajoPuertas + ' puertas');
    if (formData.cbMesada) parts.push('Bajo mesada');
    if (formData.cbTapa) parts.push('Tapa horno');
    if (formData.cbLateral) parts.push('Lateral piso a techo');
    return parts;
  }, [formData.cbBajo, formData.cbMesada, formData.cbTapa, formData.cbLateral, formData.bajoPuertas]);

  return (
    <div className="page">
      <div className="p1-hero">
        <img src={heroImage} alt="Cover" />
        <div className="p1-hero-overlay" />
        <div className="p1-hero-text">
          <div className="h-pre">PRESUPUESTO</div>
          <div className="h-main">FRENTE DE PARRILLA</div>
          <div className="h-sub">{formData.sistema} &middot; {formData.material}</div>
        </div>
        <div className="p1-hero-caption">Trabajo realizado por Quality Deco &middot; Rosario</div>
        <div className="p1-logo-badge">
          <div className="lb-name">{settings.empresaNombre}</div>
          <div className="lb-sub">{settings.empresaSubtitulo.toUpperCase()}</div>
        </div>
      </div>

      <div className="p1-client-bar">
        <div className="cb-item">
          <div className="cb-label">Cliente</div>
          <div className="cb-value">{cliente}</div>
        </div>
        <div className="cb-item">
          <div className="cb-label">Localidad</div>
          <div className="cb-value">{localidad}</div>
        </div>
        <div className="cb-item">
          <div className="cb-label">Fecha</div>
          <div className="cb-value">{formatDateAR(fecha)}</div>
        </div>
        <div className="cb-item">
          <div className="cb-label">N&deg; Presupuesto</div>
          <div className="cb-value">{nro}</div>
        </div>
      </div>

      <div className="p1-greeting">
        <span className="greeting-name">{greetingProcessed.line1}</span>
        {greetingProcessed.rest}
      </div>

      <div className="p1-summary">
        <div className="p1-specs">
          <table>
            <tbody>
              <tr><td className="sk">Sistema</td><td className="sv">{formData.sistema}</td></tr>
              <tr><td className="sk">Material</td><td className="sv">{formData.material}</td></tr>
              <tr><td className="sk">Medidas</td><td className="sv">{formData.ancho} x {formData.alto} mm</td></tr>
              <tr><td className="sk">Boca parrilla</td><td className="sv">{formData.boca} mm</td></tr>
              {configParts.length > 0 && (
                <tr><td className="sk">Configuracion</td><td className="sv">{configParts.join(', ')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p1-total-box">
          <div className="tb-label">INVERSION TOTAL</div>
          <div className="tb-price">{formatPrice(total)}</div>
          <div className="tb-note">Instalacion incluida</div>
        </div>
      </div>

      <div className="p1-benefits-bar">
        <div className="p1-benefit"><span className="p1-benefit-dot" /> Fabricacion propia</div>
        <div className="p1-benefit"><span className="p1-benefit-dot" /> Instalacion incluida</div>
        <div className="p1-benefit"><span className="p1-benefit-dot" /> Garantia</div>
        <span className="p1-benefits-validez">Validez: {validezText}</span>
      </div>
    </div>
  );
}
