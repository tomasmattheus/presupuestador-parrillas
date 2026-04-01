import type { LineItem, AppSettings } from '../../types';
import type { PresupFormData } from '../../hooks/usePresupuestoForm';
import { formatPrice } from '../../lib/formatters';

interface Props {
  formData: PresupFormData;
  lineItems: LineItem[];
  settings: AppSettings;
  calculateTotals: () => { subtotal: number; iva: number; total: number };
  nro?: string;
  validez?: string;
}

export default function PdfPage2Detail({
  formData,
  lineItems,
  settings,
  calculateTotals,
  nro = '0001',
  validez,
}: Props) {
  const { total } = calculateTotals();
  const validezText = validez || settings.validez;
  const mainMeasure = formData.ancho + ' x ' + formData.alto;

  let isFirstItem = true;

  return (
    <div className="page" style={{ position: 'relative' }}>
      <div className="mini-header">
        <div className="mh-brand">QUALITY DECO</div>
        <div className="mh-page">PRESUPUESTO N&deg; {nro} &mdash; PAG 2/3</div>
      </div>
      <div className="accent-line" />

      <div className="detail-header">
        <span>DETALLE DEL PRESUPUESTO</span>
      </div>

      <table className="detail-table">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Medida</th>
            <th>Descripcion</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => {
            let itemMeasure = '\u2014';
            if (isFirstItem && !item.isFree) {
              itemMeasure = mainMeasure;
              isFirstItem = false;
            }
            return (
              <tr key={item.id}>
                <td><span className="dt-code">{item.code}</span></td>
                <td><span className="dt-measure">{itemMeasure}</span></td>
                <td>
                  <div className="dt-desc-name">{item.name}</div>
                  {item.subtitle && <div className="dt-desc-sub">{item.subtitle}</div>}
                </td>
                <td>
                  {item.isFree ? (
                    <span className="dt-free">Sin cargo</span>
                  ) : (
                    <span className="dt-price">{item.price > 0 ? formatPrice(item.price) : '-'}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="totals-box">
        <div className="totals-inner">
          <div className="totals-row">
            <span className="tr-label">Colocacion + accesorios</span>
            <span className="tr-green">Bonificado</span>
          </div>
          <div className="totals-row tr-total">
            <span className="tr-label">TOTAL</span>
            <span className="tr-value">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="p2-footer">
        Precios en pesos argentinos &middot; Validez: {validezText}
      </div>
    </div>
  );
}
