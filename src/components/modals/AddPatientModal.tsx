import { FC, useState } from 'react';
import { patientManager } from '../../services/PatientManager';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { getEmergencyStatus } from '../../types/patient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nextIdSuggestion: string;
}

export const AddPatientModal: FC<Props> = ({ isOpen, onClose, nextIdSuggestion }) => {
  const [id, setId] = useState(nextIdSuggestion);
  const [name, setName] = useState('');
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [contact, setContact] = useState('+1 (555) 234-0000');
  const [symptoms, setSymptoms] = useState('');
  const [severityScore, setSeverityScore] = useState(5);
  const [department, setDepartment] = useState('General ER');
  const [assignedDoctor, setAssignedDoctor] = useState('Dr. Marcus Vance (Cardiology)');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !symptoms.trim()) {
      setError('Please fill in all required fields (ID, Name, and Symptoms).');
      return;
    }

    // Check if ID already exists
    const existing = patientManager.searchPatientAVL(id.trim());
    if (existing.found) {
      setError(`Patient ID "${id.trim()}" already exists in the AVL Tree registry! Please choose a unique ID.`);
      return;
    }

    patientManager.addPatient({
      id: id.trim().toUpperCase(),
      name: name.trim(),
      age: Number(age),
      gender,
      contact: contact.trim(),
      symptoms: symptoms.trim(),
      severityScore: Number(severityScore),
      arrivalTime: Date.now(),
      assignedDoctor,
      department,
    });

    onClose();
  };

  const status = getEmergencyStatus(severityScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <div>
              <h2 className="text-base font-bold">Register Emergency Patient</h2>
              <p className="text-xs text-blue-100">Synchronized into AVL Tree & Max-Heap Priority Queue</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white p-1 rounded-md" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient ID (AVL Search Key) *
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="e.g. P127"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="e.g. Sarah Jenkins"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Severity score selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800">
                Triage Severity Score: <span className="text-sm font-bold font-mono text-blue-700">{severityScore} / 10</span>
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${
                status === 'Critical' ? 'bg-red-100 text-red-800 border border-red-300' :
                status === 'High' ? 'bg-amber-100 text-amber-800' :
                status === 'Moderate' ? 'bg-blue-100 text-blue-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {status} Severity
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={severityScore}
              onChange={(e) => setSeverityScore(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>1-3 Low</span>
              <span>4-6 Moderate</span>
              <span>7-8 High</span>
              <span className="text-red-600 font-semibold">9-10 Critical Alert</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Symptoms & Notes *</label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              placeholder="e.g. Acute chest tightness, tachycardia, oxygen sat 91%"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="Cardiology ER">Cardiology ER</option>
                <option value="Trauma Bay 1">Trauma Bay 1</option>
                <option value="Trauma Bay 2">Trauma Bay 2</option>
                <option value="General ER">General ER</option>
                <option value="Neurology Acute">Neurology Acute</option>
                <option value="Pediatric ER">Pediatric ER</option>
                <option value="Fast Track ER">Fast Track ER</option>
                <option value="Resuscitation Bay">Resuscitation Bay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Physician</label>
              <select
                value={assignedDoctor}
                onChange={(e) => setAssignedDoctor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="Dr. Marcus Vance (Cardiology)">Dr. Marcus Vance (Cardiology)</option>
                <option value="Dr. Sarah Lin (Trauma)">Dr. Sarah Lin (Trauma)</option>
                <option value="Dr. Rebecca Stone (Neurology)">Dr. Rebecca Stone (Neurology)</option>
                <option value="Dr. James Thorne (General Surgery)">Dr. James Thorne (General Surgery)</option>
                <option value="Dr. Amanda Blake (Orthopedics)">Dr. Amanda Blake (Orthopedics)</option>
                <option value="Dr. Michael Chen (Pulmonology)">Dr. Michael Chen (Pulmonology)</option>
                <option value="Dr. Lisa Monroe (Pediatrics)">Dr. Lisa Monroe (Pediatrics)</option>
                <option value="Dr. Kevin Miller (Internal Med)">Dr. Kevin Miller (Internal Med)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              Insert Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
