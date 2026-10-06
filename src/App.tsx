/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useSyncExternalStore } from 'react';
import { patientManager } from './services/PatientManager';
import { alertManager } from './services/AlertManager';
import { Patient } from './types/patient';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TreatedPatientModal } from './components/modals/TreatedPatientModal';
import { PatientDetailModal } from './components/modals/PatientDetailModal';
import { AddPatientModal } from './components/modals/AddPatientModal';
import { EditPatientModal } from './components/modals/EditPatientModal';

import { DashboardView } from './components/views/DashboardView';
import { PatientRecordsView } from './components/views/PatientRecordsView';
import { PriorityQueueView } from './components/views/PriorityQueueView';
import { AVLVisualizerView } from './components/views/AVLVisualizerView';
import { SeverityUpdateView } from './components/views/SeverityUpdateView';
import { CriticalAlertsView } from './components/views/CriticalAlertsView';
import { BenchmarkingView } from './components/views/BenchmarkingView';
import { DataStructuresView } from './components/views/DataStructuresView';
import { ComplexityAnalysisView } from './components/views/ComplexityAnalysisView';
import { VivaPrepView } from './components/views/VivaPrepView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [treatedPatient, setTreatedPatient] = useState<Patient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [severityUpdateTargetId, setSeverityUpdateTargetId] = useState<string | undefined>(undefined);

  // Subscribe to patientManager changes
  const [, setVersion] = useState(0);
  useEffect(() => {
    const unsubPatient = patientManager.subscribe(() => setVersion((v) => v + 1));
    const unsubAlert = alertManager.subscribe(() => setVersion((v) => v + 1));

    // Periodic waiting time refresh (every 30 seconds)
    const interval = setInterval(() => {
      patientManager.refreshWaitingTimes();
    }, 30000);

    return () => {
      unsubPatient();
      unsubAlert();
      clearInterval(interval);
    };
  }, []);

  const stats = patientManager.getDashboardStats();
  const allPatients = patientManager.getAllPatients();
  const waitingPatients = patientManager.getWaitingPatientsSorted();
  const alerts = alertManager.getAlerts();
  const activeCriticalAlerts = alertManager.getActiveAlertCount();

  // Treat next patient action
  const handleTreatNext = () => {
    const result = patientManager.treatNextPatient();
    if (result.patient) {
      setTreatedPatient(result.patient);
    } else {
      alert('No patients currently waiting in the priority queue.');
    }
  };

  const handleTreatSpecificPatient = (patientId: string) => {
    const p = patientManager.searchPatientAVL(patientId).patient;
    if (p) {
      patientManager.deletePatient(p.id); // Or mark treated
      p.status = 'Treated';
      p.treatedAt = Date.now();
      patientManager.avlTree.insert(p);
      alertManager.markTreated(p.id);
      patientManager.saveToStorage();
      setTreatedPatient(p);
    }
  };

  const handleOpenSeverityUpdate = (patientId: string) => {
    setSeverityUpdateTargetId(patientId);
    setActiveTab('severity_update');
  };

  const handleResetSamples = () => {
    if (window.confirm('Reset all patients to the 26 sample realistic medical records?')) {
      patientManager.resetToSamples();
    }
  };

  // Suggest next ID (e.g. P127)
  const nextIdSuggestion = `P${(allPatients.length + 101).toString()}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Header Navbar */}
      <Navbar
        activeCriticalCount={activeCriticalAlerts}
        onTreatNext={handleTreatNext}
        onSelectPatient={(p) => setSelectedPatient(p)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onResetSamples={handleResetSamples}
      />

      {/* Main Layout: Left Sidebar + Viewport Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'severity_update') setSeverityUpdateTargetId(undefined);
          }}
          activeCriticalAlerts={activeCriticalAlerts}
          totalWaitingCount={stats.waitingCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              waitingQueue={waitingPatients}
              allPatients={allPatients}
              onTreatNext={handleTreatNext}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'records' && (
            <PatientRecordsView
              patients={allPatients}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onEditPatient={(p) => setPatientToEdit(p)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenSeverityModal={handleOpenSeverityUpdate}
            />
          )}

          {activeTab === 'priority_queue' && (
            <PriorityQueueView
              maxHeap={patientManager.maxHeap}
              waitingPatients={waitingPatients}
              onTreatNext={handleTreatNext}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenSeverityModal={handleOpenSeverityUpdate}
            />
          )}

          {activeTab === 'avl_visualizer' && (
            <AVLVisualizerView
              avlTree={patientManager.avlTree}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onResetSamples={handleResetSamples}
            />
          )}

          {activeTab === 'severity_update' && (
            <SeverityUpdateView
              patients={allPatients}
              preselectedPatientId={severityUpdateTargetId}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'critical_alerts' && (
            <CriticalAlertsView
              alerts={alerts}
              onTreatPatient={handleTreatSpecificPatient}
              onSelectPatient={(p) => setSelectedPatient(p)}
            />
          )}

          {activeTab === 'benchmarking' && <BenchmarkingView />}

          {activeTab === 'data_structures' && <DataStructuresView />}

          {activeTab === 'complexity' && <ComplexityAnalysisView />}

          {activeTab === 'viva_prep' && <VivaPrepView />}
        </main>
      </div>

      {/* Global Modals */}
      <TreatedPatientModal
        patient={treatedPatient}
        onClose={() => setTreatedPatient(null)}
      />

      <PatientDetailModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onOpenSeverityUpdate={handleOpenSeverityUpdate}
        onTreatPatient={(id) => {
          setSelectedPatient(null);
          handleTreatSpecificPatient(id);
        }}
      />

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        nextIdSuggestion={nextIdSuggestion}
      />

      <EditPatientModal
        patient={patientToEdit}
        onClose={() => setPatientToEdit(null)}
      />
    </div>
  );
}
