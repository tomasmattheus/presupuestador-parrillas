import type { LineItem, AppSettings } from '../../types';
import type { PresupFormData } from '../../hooks/usePresupuestoForm';
import { formatPrice } from '../../lib/formatters';

interface Props {
  formData: PresupFormData;
  lineItems: LineItem[];
  settings: AppSettings;
  calculateTotals: () => { subtotal: number; iva: number; total: number };
  nro?: string;
  cta?: string;
  legal?: string;
}

export default function PdfPage3Payment({
  formData,
  lineItems: _lineItems,
  settings,
  calculateTotals,
  nro = '0001',
  cta,
  legal,
}: Props) {
  const { total: totalConIva } = calculateTotals();
  const descuento = formData.descuento;
  const recargo = formData.recargo;
  const cuotas = formData.cuotas;

  const anticipado = Math.round(totalConIva * (1 - descuento / 100));
  const ahorro = totalConIva - anticipado;
  const conRecargo = Math.round(totalConIva * (1 + recargo / 100));
  const cuotaVal = cuotas > 0 ? Math.round(conRecargo / cuotas) : 0;
  const mitad = Math.round(totalConIva / 2);

  const legalText = legal || settings.legal;
  const ctaText = cta || settings.cta;
  const infoCards = settings.infoServicio;

  const empresaNombre = settings.empresaNombre || 'QUALITY DECO';
  const empresaSub = settings.empresaSubtitulo || 'Frentes de parrillas';
  const empresaDir = settings.empresaDireccion || 'Campbell 1505 A \u00B7 Rosario \u00B7 Santa Fe';
  const empresaTel = settings.empresaTelefono || '0341-3664952';
  const empresaIG = settings.empresaInstagram || '@qualitydeco.ok';

  return (
    <div className="page" style={{ position: 'relative' }}>
      <div className="mini-header">
        <div className="mh-brand">QUALITY DECO</div>
        <div className="mh-page">PRESUPUESTO N&deg; {nro} &mdash; PAG 3/3</div>
      </div>
      <div className="accent-line" />

      <div className="section-label-wrap">
        <div className="section-label">Formas de pago</div>
      </div>

      <div className="pay-cards">
        <div className="pay-card">
          <div className="pc-header">100% anticipado</div>
          <div className="pc-body">
            <div className="pc-price">{formatPrice(anticipado)}</div>
            <div className="pc-detail">
              Transferencia bancaria<br />Pago unico antes de fabricar
            </div>
            {descuento > 0 && (
              <div className="pc-tag-green">
                Ahorras {formatPrice(ahorro)} ({descuento}% off)
              </div>
            )}
          </div>
        </div>

        <div className="pay-card recommended">
          <span className="pc-badge">Recomendado</span>
          <div className="pc-header">50% anticipo + entrega</div>
          <div className="pc-body">
            <div className="pc-price">{formatPrice(totalConIva)}</div>
            <div className="pc-detail">
              Sena al contratar: <strong>{formatPrice(mitad)}</strong><br />
              Saldo contra entrega: <strong>{formatPrice(totalConIva - mitad)}</strong>
            </div>
          </div>
        </div>

        <div className="pay-card">
          <div className="pc-header">{cuotas} cuotas</div>
          <div className="pc-body">
            <div className="pc-price">{formatPrice(conRecargo)}</div>
            <div className="pc-detail">
              {cuotas} pagos de {formatPrice(cuotaVal)}
            </div>
            {recargo > 0 ? (
              <div className="pc-tag-amber">Recargo {recargo}%</div>
            ) : (
              <div className="pc-tag-green">Sin interes</div>
            )}
          </div>
        </div>
      </div>

      <div className="info-section-label">
        <div className="section-label">Informacion del servicio</div>
      </div>

      <div className="info-grid">
        {infoCards.map((card, i) => (
          <div key={i} className="info-card">
            <div className="ic-header">
              <div className="ic-dot" />
              <div className="ic-title">{card.titulo}</div>
            </div>
            <div className="ic-body">
              {card.items.map((item, j) => (
                <div key={j} className="ic-item">
                  <span className="ic-dash">--</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="legal-box">{legalText}</div>
      <div className="cta-box">{ctaText}</div>

      <div className="p3-footer">
        <div className="pf-brand">{empresaNombre} | {empresaSub}</div>
        <div className="pf-contact">{empresaDir} &middot; {empresaTel} &middot; {empresaIG}</div>
        <div />
      </div>
    </div>
  );
}
