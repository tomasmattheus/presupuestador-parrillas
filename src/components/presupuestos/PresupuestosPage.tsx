import { useState, useCallback, useContext, useEffect } from 'react';
import type { BudgetFlat } from '../../types';
import { usePresupuestoForm } from '../../hooks/usePresupuestoForm';
import { ModalContext } from '../../contexts/ModalContext';
import PresupuestosDashboard from './PresupuestosDashboard';
import PresupuestoForm from './PresupuestoForm';
import PresupuestoPreview, { usePrintPreview } from './PresupuestoPreview';

type Mode = 'dashboard' | 'form';

export default function PresupuestosPage() {
  const [mode, setMode] = useState<Mode>('dashboard');
  const [editBudget, setEditBudget] = useState<BudgetFlat | null>(null);
  const formHook = usePresupuestoForm();
  const { containerRef, printPages } = usePrintPreview();
  const { pendingPresupLead, clearPendingPresupLead } = useContext(ModalContext);

  // When a lead is sent from the LeadDetailModal, open the form and load the lead
  useEffect(() => {
    if (pendingPresupLead) {
      setEditBudget(null);
      setMode('form');
      formHook.loadLeadIntoForm(pendingPresupLead);
      clearPendingPresupLead();
    }
  }, [pendingPresupLead, clearPendingPresupLead, formHook.loadLeadIntoForm]);

  const openForm = useCallback((budget?: BudgetFlat) => {
    setEditBudget(budget ?? null);
    setMode('form');
  }, []);

  const goBack = useCallback(() => {
    setEditBudget(null);
    setMode('dashboard');
  }, []);

  if (mode === 'form') {
    return (
      <div className="flex flex-1 h-full overflow-hidden">
        <PresupuestoForm onBack={goBack} editBudget={editBudget} formHook={formHook} onPrint={printPages} />
        <PresupuestoPreview formHook={formHook} containerRef={containerRef} />
      </div>
    );
  }

  return <PresupuestosDashboard onCreateNew={() => openForm()} onEdit={openForm} onDuplicate={openForm} />;
}
