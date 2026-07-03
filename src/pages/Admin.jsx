import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_COLORS = {
  Pending:       "bg-yellow-100 text-yellow-800",
  Confirmed:     "bg-blue-100 text-blue-800",
  Completed:     "bg-green-100 text-green-800",
  Cancelled:     "bg-red-100 text-red-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Ready:         "bg-green-100 text-green-800",
  Delivered:     "bg-gray-100 text-gray-700",
  Declined:      "bg-red-100 text-red-800",
};

function Badge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`rounded-2xl p-5 flex items-center gap-4 shadow-sm ${color}`}>
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-sm font-medium opacity-70">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso || iso === "TBD") return iso || "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso; // Fallback if invalid
    return d.toLocaleDateString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch(e) {
    return iso;
  }
}

function needsAdminAttention(m) {
  if (m.is_read) return false;
  if (m.replies && m.replies.length > 0) {
    return m.replies[m.replies.length - 1].from !== "Admin";
  }
  return m.from !== "Admin";
}

function Dashboard({ appts, orders, msgs }) {
  const unreadCount  = msgs.filter(needsAdminAttention).length;
  const activeOrders = orders.filter(o => o.status === "In Progress" || o.status === "Pending").length;
  const readyOrders  = orders.filter(o => o.status === "Ready" && o.deliveryMethod !== "pickup");
  const pickupOrders = orders.filter(o => o.status === "Ready" && o.deliveryMethod === "pickup");
  const today        = new Date().toISOString().slice(0, 10);
  const todayAppts   = appts.filter(a => a.date && a.date.startsWith(today));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={appts.length}       icon="📅" color="bg-pink-100 text-pink-900"     />
        <StatCard label="Active Orders"       value={activeOrders}       icon="📦" color="bg-purple-100 text-purple-900" />
        <StatCard label="Unread Messages"     value={unreadCount}        icon="✉️"  color="bg-blue-100 text-blue-900"    />
        <StatCard label="Products Ready"      value={readyOrders.length + pickupOrders.length} icon="✅" color="bg-green-100 text-green-900"  />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Today's Appointments</h3>
          <ul className="space-y-2">
            {todayAppts.length > 0
              ? todayAppts.map(a => (
                  <li key={a.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{a.time} — {a.name}</span>
                    <Badge status={a.status} />
                  </li>
                ))
              : <p className="text-gray-400 text-sm">No appointments today.</p>
            }
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Orders Ready for Delivery</h3>
          <ul className="space-y-2">
            {readyOrders.length > 0
              ? readyOrders.map(o => (
                  <li key={o.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{o.id} — {o.client}</span>
                    <Badge status={o.status} />
                  </li>
                ))
              : <p className="text-gray-400 text-sm">No orders ready yet.</p>
            }
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Orders Ready for Pick Up</h3>
          <ul className="space-y-2">
            {pickupOrders.length > 0
              ? pickupOrders.map(o => (
                  <li key={o.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{o.id} — {o.client}</span>
                    <Badge status={o.status} />
                  </li>
                ))
              : <p className="text-gray-400 text-sm">No pickup orders ready.</p>
            }
          </ul>
        </div>
      </div>
    </div>
  );
}

function AppointmentDetailModal({ appt, onClose, onStatusChange, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:    appt.name    || "",
    service: appt.service || "",
    date:    appt.date    || "",
    time:    appt.time    || "",
    contact: appt.contact || "",
    clinic:  appt.clinic  || "",
    notes:   appt.notes   || "",
    status:  appt.status  || "Pending",
  });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSave() {
    onEdit(appt.id, form);
    setEditing(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">Appointment Details</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs text-[#e05555] hover:underline"
            >
              {editing ? "Cancel Edit" : "✏️ Edit"}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Patient Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Service</label>
              <select name="service" value={form.service} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                <option value="">Select a service…</option>
                <option>Complete Dentures</option>
                <option>Partial Dentures</option>
                <option>Implant-Supported Dentures</option>
                <option>Crowns &amp; Bridges</option>
                <option>Flexible Partial Dentures</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time Slot</label>
                <select name="time" value={form.time} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                  <option value="">Select a time slot…</option>
                  {["8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM",
                    "11:00 AM - 12:00 PM", "12:00 PM - 1:00 PM", "1:00 PM - 2:00 PM",
                    "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM",
                    "5:00 PM - 6:00 PM", "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM"
                  ].map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact Number</label>
              <input name="contact" value={form.contact} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Referred By (optional)</label>
              <input name="clinic" value={form.clinic} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555] resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                {["Pending", "Confirmed", "Completed", "Cancelled"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setEditing(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex-1 bg-[#e05555] hover:bg-[#c43a3a] text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Patient Name</p>
                <p className="font-medium text-gray-800">{appt.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Status</p>
                <Badge status={appt.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Date</p>
                <p className="font-medium text-gray-800">{formatDate(appt.date)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Time</p>
                <p className="font-medium text-gray-800">{appt.time}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Service</p>
              <p className="font-medium text-gray-800">{appt.service || "—"}</p>
            </div>

            {appt.contact && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Contact Number</p>
                <p className="font-medium text-gray-800">{appt.contact}</p>
              </div>
            )}
            {appt.clinic && (
              <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Referred By</p>
              <p className="font-medium text-gray-800">{appt.clinic || "—"}</p>
            </div>
            )}
            {appt.notes ? (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                <p className="text-gray-700 whitespace-pre-wrap">{appt.notes}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                <p className="text-gray-400 italic">No notes provided</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-1">Update Status</p>
              <select
                value={appt.status}
                onChange={e => onStatusChange(appt.id, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]"
              >
                {["Pending", "Confirmed", "Completed", "Cancelled"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <button onClick={onClose}
              className="mt-2 w-full border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Appointments({ appts, setAppts }) {
  const [filter,     setFilter]     = useState("All");
  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [detailAppt, setDetailAppt] = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const TIME_SLOTS = [
    "8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM", "12:00 PM - 1:00 PM", "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM", "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM",
  ];
  const [form,       setForm]       = useState({
    name: "", service: "", date: "", time: "", status: "Pending",
  });

  const statuses = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  const visible = appts
    .filter(a => filter === "All" || a.status === filter)
    .filter(a => {
      const q = search.toLowerCase();
      return (
        a.name?.toLowerCase().includes(q) ||
        a.service?.toLowerCase().includes(q) ||
        a.clinic?.toLowerCase().includes(q)
      );
    });

  async function updateApptStatus(id, status) {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      // The 2-second polling in Admin component will pick up the changes and also any created orders.
      if (detailAppt && detailAppt.id === id) {
        setDetailAppt(prev => ({ ...prev, status }));
      }
    } catch (err) { console.error(err); }
  }

  async function editAppt(id, fields) {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      setDetailAppt(prev => ({ ...prev, ...fields }));
    } catch(err) { console.error(err); }
  }

  async function deleteAppt(id) {
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      setDeleteId(null);
      setDetailAppt(null);
    } catch (err) { console.error(err); }
  }

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleAddAppointment() {
    if (!form.name || !form.date || !form.time) return;
    const newAppt = {
      public_id: `APT-${Date.now()}`,
      customer_name: form.name,
      service: form.service,
      appointment_date: form.date,
      time_slot: form.time,
      status: form.status
    };
    
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt)
      });
      closeModal();
    } catch (err) { console.error(err); }
  }

  function closeModal() {
    setForm({ name: "", service: "", date: "", time: "", status: "Pending" });
    setShowModal(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#e05555] hover:bg-[#c43a3a] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + New Appointment
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, service, or clinic…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#e05555] bg-white"
        />
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === s ? "bg-[#e05555] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#e05555]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fce8e8] text-gray-700">
            <tr>
              {["Patient", "Service", "Date", "Time", "Notes", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  <button
                    onClick={() => setDetailAppt(a)}
                    className="text-left text-[#e05555] hover:underline transition-colors"
                    title="View appointment details"
                  >
                    {a.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <button
                    onClick={() => setDetailAppt(a)}
                    className="text-left hover:text-[#e05555] hover:underline transition-colors"
                    title="View appointment details"
                  >
                    {a.service || "—"}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(a.date)}</td>
                <td className="px-4 py-3 text-gray-600">{a.time}</td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px]">
                  {a.notes ? (
                    <button
                      onClick={() => setDetailAppt(a)}
                      className="text-left hover:text-[#e05555] transition-colors line-clamp-2"
                      title={a.notes}
                    >
                      📝 {a.notes}
                    </button>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3"><Badge status={a.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={a.status}
                      onChange={e => updateApptStatus(a.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#e05555]"
                    >
                      {["Pending", "Confirmed", "Completed", "Cancelled"].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setDeleteId(a.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="text-center text-gray-400 py-8">No appointments found.</p>
        )}
      </div>

      {detailAppt && (
        <AppointmentDetailModal
          appt={detailAppt}
          onClose={() => setDetailAppt(null)}
          onStatusChange={updateApptStatus}
          onEdit={editAppt}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Appointment?</h3>
            <p className="text-sm text-gray-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteAppt(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">New Appointment</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Patient Name *</label>
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Juan dela Cruz"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Service *</label>
                <select name="service" value={form.service} onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                  <option value="">Select a service…</option>
                  <option>Complete Dentures</option>
                  <option>Partial Dentures</option>
                  <option>Implant-Supported Dentures</option>
                  <option>Crowns &amp; Bridges</option>
                  <option>Flexible Partial Dentures</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
                  <input type="date" name="date" value={form.date} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time Slot *</label>
                  <select name="time" value={form.time} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                    <option value="">Select a time slot…</option>
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Initial Status</label>
                <select name="status" value={form.status} onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                  {["Pending", "Confirmed"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddAppointment} disabled={!form.name || !form.date || !form.time || !form.service}
                className="flex-1 bg-[#e05555] hover:bg-[#c43a3a] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                Add Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* PriceEstimationCard removed — price estimation flow removed per requirements */

function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const ORDER_STATUSES = ["In Progress", "Ready", "In Transit", "Completed", "Cancelled"];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Order Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
              <p className="font-mono font-medium text-[#e05555]">{order.id}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Status</p>
              <Badge status={order.status} />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">Client</p>
            <p className="font-medium text-gray-800">{order.client}</p>
          </div>

          {order.appointmentId && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">From Appointment</p>
              <p className="font-mono text-sm text-blue-600">{order.appointmentId}</p>
            </div>
          )}

          {order.address && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Delivery Info</p>
              <p className="text-gray-800">{order.deliveryMethod === "pickup" ? "🏪 Pick Up" : `🚚 ${order.address}`}</p>
            </div>
          )}

          {order.deliveryContact && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Delivery Contact</p>
              <p className="text-gray-800">{order.deliveryContact}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Service / Product</p>
            {order.items ? order.items.map((it, i) => (
              <div key={i} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-0">
                <span className="text-gray-800">{it.product}</span>
                <span className="text-gray-500">{it.teeth} {Number(it.teeth) === 1 ? "tooth" : "teeth"}</span>
              </div>
            )) : (
              <p className="text-gray-800">{order.product || order.service || "—"}</p>
            )}
          </div>

          {order.notes ? (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Notes</p>
              <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Notes</p>
              <p className="text-gray-400 italic">No notes provided</p>
            </div>
          )}

          {/* Status update */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Update Status</p>
            <select
              value={order.status}
              onChange={e => { onUpdateStatus(order.id, e.target.value); onClose(); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]"
            >
              {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <button onClick={onClose}
            className="mt-2 w-full border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Orders({ orders, setOrders }) {
  const [showModal, setShowModal] = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [form,      setForm]      = useState({
    client: "", product: "", qty: 1, address: "", status: "In Progress",
  });

  const ORDER_STATUSES = ["In Progress", "Ready", "In Transit", "Completed", "Cancelled"];

  const visible = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      o.client?.toLowerCase().includes(q) ||
      o.product?.toLowerCase().includes(q) ||
      String(o.id).toLowerCase().includes(q)
    );
  });

  async function updateOrder(id, fields) {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
    } catch(err) { console.error(err); }
  }

  function updateStatus(id, status) {
    updateOrder(id, { status });
  }

  async function deleteOrder(id) {
    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      setDeleteId(null);
      setDetailOrder(null);
    } catch(err) { console.error(err); }
  }

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleAddOrder() {
    if (!form.client || !form.product) return;
    const newOrder = {
      public_id: `ORD-${Date.now()}`,
      client_name: form.client,
      product: form.product,
      qty: parseInt(form.qty) || 1,
      address: form.address,
      status: form.status
    };
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      setForm({ client: "", product: "", qty: 1, address: "", status: "In Progress" });
      setShowModal(false);
    } catch(err) { console.error(err); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Orders & Tracking</h2>
        <button onClick={() => setShowModal(true)}
          className="bg-[#e05555] hover:bg-[#c43a3a] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          + New Order
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by client, product, or order ID…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#e05555] bg-white"
      />

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium">No orders yet.</p>
          <p className="text-sm mt-1">Orders will appear here when appointments are marked as completed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* All orders table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fce8e8] text-gray-700">
                <tr>
                  {["Order ID", "Client", "Service/Product", "Delivery", "Notes", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => setDetailOrder(o)} className="font-mono font-medium text-[#e05555] hover:underline" title="View order details">{o.id}</button>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <button onClick={() => setDetailOrder(o)} className="hover:text-[#e05555] hover:underline transition-colors" title="View order details">{o.client}</button>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px]">
                      <button onClick={() => setDetailOrder(o)} className="text-left hover:text-[#e05555] transition-colors" title="View order details">
                        {o.service || o.product || "—"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px]">
                      {o.deliveryMethod ? (
                        <span>{o.deliveryMethod === "pickup" ? "🏪 Pick Up" : `🚚 ${o.address || "Pending"}`}</span>
                      ) : (
                        <span className="text-gray-300">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px]">
                      {o.notes ? (
                        <button
                          onClick={() => setDetailOrder(o)}
                          className="text-left hover:text-[#e05555] transition-colors line-clamp-2"
                          title={o.notes}
                        >
                          📝 {o.notes}
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><Badge status={o.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#e05555]">
                          {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => setDeleteId(o.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none" title="Delete">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && orders.length > 0 && (
              <p className="text-center text-gray-400 py-8">No orders match your search.</p>
            )}
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Order?</h3>
            <p className="text-sm text-gray-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteOrder(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">New Order</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client Name *</label>
                <input name="client" value={form.client} onChange={handleFormChange} placeholder="e.g. Juan dela Cruz"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Product *</label>
                <select name="product" value={form.product} onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                  <option value="">Select a product…</option>
                  <option>Complete Dentures</option>
                  <option>Partial Dentures</option>
                  <option>Implant-Supported Dentures</option>
                  <option>Crowns &amp; Bridges</option>
                  <option>Flexible Partial Dentures</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Address</label>
                <input name="address" value={form.address} onChange={handleFormChange} placeholder="e.g. 123 Main St, Manila"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                <input type="number" name="qty" min="1" value={form.qty} onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Initial Status</label>
                <select name="status" value={form.status} onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                {["In Progress", "Ready", "Delivered"].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddOrder} disabled={!form.client || !form.product}
                className="flex-1 bg-[#e05555] hover:bg-[#c43a3a] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                Add Order
              </button>
            </div>
          </div>
        </div>
      )}

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}


function Messages({ msgs, setMsgs }) {
  const [selected, setSelected] = useState(null);
  const [reply,    setReply]    = useState("");
  const [sent,     setSent]     = useState([]);
  const [sending,  setSending]  = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search,   setSearch]   = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeUser, setComposeUser] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSent, setComposeSent] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRegisteredUsers(data);
      })
      .catch(err => console.error(err));
  }, []);

  const visible = msgs.filter(m => {
    const q = search.toLowerCase();
    return (
      m.from?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.body?.toLowerCase().includes(q)
    );
  });

  async function markRead(id) {
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: 1 }) // Or whatever the API uses for read status, though the backend didn't explicitly show a mark as read endpoint, it has a generic update
      });
      setSelected(id);
      setReply("");
    } catch(err) { console.error(err); }
  }

  async function deleteMsg(id) {
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      setDeleteId(null);
      if (selected === id) setSelected(null);
    } catch(err) { console.error(err); }
  }

  async function handleSend() {
    if (!reply.trim() || !selected) return;
    setSending(true);
    
    try {
      await fetch(`/api/messages/${selected}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_name: "Admin",
          body: reply.trim()
        })
      });
      setSent(prev => [...prev, selected]);
      setReply("");
    } catch(err) { console.error(err); } finally {
      setSending(false);
    }
  }

  const selectedMsg = msgs.find(m => m.id === selected);
  const alreadySent = sent.includes(selected);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
        <button onClick={() => { setShowCompose(true); setComposeSent(false); setComposeUser(""); setComposeSubject(""); setComposeBody(""); }}
          className="bg-[#e05555] hover:bg-[#c43a3a] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
          ✉️ New Message to User
        </button>
      </div>
      {msgs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">✉️</p>
          <p className="font-medium">No messages yet.</p>
          <p className="text-sm mt-1">Messages will appear here when customers use the contact form on the site.</p>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search messages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#e05555] bg-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {visible.map(m => {
                  const unread = needsAdminAttention(m);
                  return (
                  <li key={m.id} onClick={() => markRead(m.id)}
                    className={`px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected === m.id ? "bg-[#fce8e8]" : ""}`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-sm ${unread ? "font-bold text-gray-900" : "text-gray-600"}`}>
                        {m.from === "Admin" 
                          ? `To: ${registeredUsers.find(u => Number(u.id) === Number(m.user_id))?.name || registeredUsers.find(u => Number(u.id) === Number(m.user_id))?.username || "User"}` 
                          : m.from}
                      </span>
                      <div className="flex items-center gap-2">
                        {m.replies?.length > 0 && <span className="text-[10px] text-gray-400">{m.replies.length} replies</span>}
                        <span className="text-xs text-gray-400">{m.date}</span>
                        <button onClick={e => { e.stopPropagation(); setDeleteId(m.id); }}
                          className="text-gray-300 hover:text-red-500 transition-colors text-sm leading-none" title="Delete">
                          🗑
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm mt-0.5 ${unread ? "text-gray-700" : "text-gray-400"}`}>{m.subject}</p>
                    {m.body && <p className="text-xs text-gray-400 mt-0.5 truncate">{m.body}</p>}
                    {unread && <span className="inline-block mt-1 w-2 h-2 rounded-full bg-[#e05555]" />}
                    {sent.includes(m.id) && <span className="inline-block mt-1 text-xs text-green-600 font-medium">✓ Replied</span>}
                  </li>
                  );
                })}
                {visible.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-gray-400">No messages match your search.</li>
                )}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-center text-gray-400">
              {selectedMsg ? (
                <div className="w-full">
                  <p className="font-semibold text-gray-700 mb-1">{selectedMsg.subject}</p>
                  {selectedMsg.from === "Admin" ? (
                    <p className="text-sm text-gray-500">To: {registeredUsers.find(u => Number(u.id) === Number(selectedMsg.user_id))?.name || registeredUsers.find(u => Number(u.id) === Number(selectedMsg.user_id))?.username || "User"}</p>
                  ) : (
                    <p className="text-sm text-gray-500">From: {selectedMsg.from} {selectedMsg.username && <span className="text-xs text-gray-400">(@{selectedMsg.username})</span>}</p>
                  )}
                  {selectedMsg.contact && <p className="text-sm text-gray-500">Contact: {selectedMsg.contact}</p>}
                  {selectedMsg.orderId && <p className="text-sm text-[#e05555] font-medium">📦 Order: {selectedMsg.orderId}</p>}
                  {selectedMsg.appointmentId && <p className="text-sm text-blue-600 font-medium">📅 Appointment: {selectedMsg.appointmentId}</p>}
                  {/* Original message */}
                  {selectedMsg.body && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedMsg.body}
                    </div>
                  )}
                  {/* Reply thread */}
                  {selectedMsg.replies?.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
                      {selectedMsg.replies.map((r, i) => (
                        <div key={i} className={`rounded-xl p-3 text-sm ${r.from === "Admin" ? "bg-[#fce8e8] border border-[#e05555]/10" : "bg-gray-50"}`}>
                          <p className="text-[11px] font-semibold mb-1" style={{ color: r.from === "Admin" ? "#e05555" : "#666" }}>
                            {r.from === "Admin" ? "🛡️ You (Admin)" : `👤 ${r.from}`}
                          </p>
                          <p className="text-gray-700 whitespace-pre-wrap">{r.body}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{r.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Reply input - always available */}
                  <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply…"
                    className="mt-4 w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-[#e05555]" />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{reply.trim().length > 0 ? `${reply.length} chars` : ""}</span>
                    <button onClick={handleSend} disabled={!reply.trim() || sending}
                      className="bg-[#e05555] hover:bg-[#c43a3a] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-5 py-2 rounded-xl transition-colors">
                      {sending ? "Sending…" : "Send Reply"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">Select a message to read & reply</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Compose New Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCompose(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">✉️ New Message to User</h3>
              <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            {composeSent ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-[16px] font-medium text-gray-800">Message sent!</p>
                <p className="text-[13px] text-gray-400 mt-1">The user will see your message in their sidebar.</p>
                <button onClick={() => setShowCompose(false)}
                  className="mt-4 border border-gray-200 text-gray-600 text-sm font-medium px-6 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Send to User *</label>
                  <select value={composeUser} onChange={e => setComposeUser(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                    <option value="">Select a user…</option>
                    {registeredUsers.map(u => (
                      <option key={u.username} value={u.username}>{u.name} (@{u.username})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                  <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
                    placeholder="e.g. Update on your order"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
                  <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)}
                    placeholder="Type your message…" rows={4}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555] resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowCompose(false)}
                    className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    disabled={!composeUser || !composeSubject.trim() || !composeBody.trim()}
                    onClick={async () => {
                      const targetUser = registeredUsers.find(u => u.username === composeUser);
                      const newMsg = {
                        public_id: `MSG-${Date.now()}`,
                        user_id: targetUser ? targetUser.id : null,
                        from_name: "Admin",
                        subject: composeSubject.trim(),
                        body: composeBody.trim(),
                      };
                      
                      try {
                        await fetch('/api/messages', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newMsg)
                        });
                        setComposeSent(true);
                      } catch(err) { console.error(err); }
                    }}
                    className="flex-1 bg-[#e05555] hover:bg-[#c43a3a] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Message?</h3>
            <p className="text-sm text-gray-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteMsg(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Settings() {
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [msg,        setMsg]        = useState(null);

  const savedPw = localStorage.getItem("3kp_admin_pw") || "admin123";

  function handleChangePassword(e) {
    e.preventDefault();
    if (currentPw !== savedPw) {
      setMsg({ type: "error", text: "Current password is incorrect." });
      return;
    }
    if (newPw.length < 6) {
      setMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    localStorage.setItem("3kp_admin_pw", newPw);
    setMsg({ type: "success", text: "Password changed successfully." });
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  }

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]"
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]"
              placeholder="Repeat new password"
            />
          </div>
          {msg && (
            <p className={`text-xs font-medium ${msg.type === "error" ? "text-red-500" : "text-green-600"}`}>
              {msg.text}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-[#e05555] hover:bg-[#c43a3a] text-white text-sm font-medium py-2.5 rounded-xl transition-colors mt-2"
          >
            Update Password
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-2">Clear All Data</h3>
        <p className="text-sm text-gray-500 mb-4">Permanently delete all appointments, orders, and messages from this device.</p>
        <button
          onClick={() => {
            if (window.confirm("This will delete everything. Are you sure?")) {
              localStorage.removeItem("3kp_appointments");
              localStorage.removeItem("3kp_orders");
              localStorage.removeItem("3kp_messages");
              window.location.reload();
            }
          }}
          className="w-full border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",    icon: "🏠" },
  { id: "appointments", label: "Appointments", icon: "📅" },
  { id: "orders",       label: "Orders",       icon: "📦" },
  { id: "messages",     label: "Messages",     icon: "✉️"  },
  { id: "settings",     label: "Settings",     icon: "⚙️"  },
];

export default function Admin() {
  const { logout } = useAuth();
  const [page,     setPage]     = useState("dashboard");

  const [appts,  setAppts]  = useState([]);
  const [orders, setOrders] = useState([]);
  const [msgs, setMsgs] = useState([]);

  // Fetch data from API every 2 seconds
  useEffect(() => {
    function loadData() {
      Promise.all([
        fetch('/api/appointments').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/messages').then(r => r.json())
      ])
      .then(([freshAppts, freshOrders, freshMsgs]) => {
        setAppts(Array.isArray(freshAppts) ? freshAppts : []);
        setOrders(Array.isArray(freshOrders) ? freshOrders : []);
        setMsgs(Array.isArray(freshMsgs) ? freshMsgs : []);
      })
      .catch(err => console.error(err));
    }
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = msgs.filter(needsAdminAttention).length;

  return (
    <div className="min-h-screen bg-[#f5e6e6] flex font-['Space_Grotesk',sans-serif] page-enter">
      <aside className="w-56 bg-white shadow-md flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-gray-100">
          <p className="text-xl font-bold text-[#e05555]">🦷 3KP</p>
          <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                page === item.id ? "bg-[#fce8e8] text-[#e05555]" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {item.id === "messages" && unreadCount > 0 && (
                <span className="ml-auto bg-[#e05555] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <button onClick={logout}
            className="w-full text-xs text-red-400 hover:text-red-600 text-left transition-colors duration-300">
            🚪 Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {page === "dashboard"    && <Dashboard appts={appts} orders={orders} msgs={msgs} />}
        {page === "appointments" && <Appointments appts={appts} setAppts={setAppts} />}
        {page === "orders"       && <Orders orders={orders} setOrders={setOrders} />}
        {page === "messages"     && <Messages msgs={msgs} setMsgs={setMsgs} />}
        {page === "settings"     && <Settings />}
      </main>
    </div>
  );
}
