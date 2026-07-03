import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_ICONS = {
  Pending: "⏳", Confirmed: "✅", Completed: "🎉", Cancelled: "❌",
  "In Progress": "🔨", Ready: "📦", Delivered: "🚚", Declined: "🚫",
};
const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
  "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
  Ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Delivered: "bg-gray-100 text-gray-700 border-gray-200",
  Declined: "bg-red-100 text-red-800 border-red-200",
};

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {STATUS_ICONS[status] || "•"} {status}
    </span>
  );
}

const PICKUP_ADDRESS = "296 15th ave. Cubao, Quezon City";

export function UserSidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [activePanel, setActivePanel] = useState(null); // "message" | "ticket-{id}" | "order-{id}" | "cancel-appt-{id}"
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgRefType, setMsgRefType] = useState("none");
  const [msgRefId, setMsgRefId] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Delivery / Pickup form state
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryContact, setDeliveryContact] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliverySaved, setDeliverySaved] = useState(false);

  const [appts, setAppts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    function load() {
      const uname = user?.username?.toLowerCase();
      
      Promise.all([
        fetch('/api/appointments').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/messages').then(r => r.json())
      ])
      .then(([allAppts, allOrders, allMsgs]) => {
        const validAppts = Array.isArray(allAppts) ? allAppts : [];
        const validOrders = Array.isArray(allOrders) ? allOrders : [];
        const validMsgs = Array.isArray(allMsgs) ? allMsgs : [];
        const uid = Number(user.id);
        setAppts(validAppts.filter((a) => (Number(a.user_id) === uid || a.customer_name?.toLowerCase() === user?.name?.toLowerCase()) && !a.is_hidden_by_user));
        setOrders(validOrders.filter((o) => (Number(o.user_id) === uid || Number(o.userId) === uid || o.client?.toLowerCase() === user?.name?.toLowerCase()) && !o.is_hidden_by_user));
        setTickets(validMsgs.filter((m) => (Number(m.user_id) === uid || m.from_name?.toLowerCase() === user?.name?.toLowerCase()) && !m.is_hidden_by_user));
      })
      .catch(err => console.error("Failed to load dashboard data", err));
    }
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadTickets = tickets.filter((t) => {
    if (t.is_read) return false;
    if (t.from_name === "Admin") return true;
    if (t.replies && t.replies.length > 0) {
      return t.replies[t.replies.length - 1].from === "Admin";
    }
    return false;
  }).length;

  // ====== CANCEL APPOINTMENT ======
  async function handleCancelAppointment(apptId) {
    try {
      await fetch(`/api/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      setActivePanel(null);
    } catch(err) {}
  }

  // ====== CANCEL ORDER (before completed) ======
  async function handleCancelOrder(orderId) {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      setActivePanel(null);
    } catch(err) {}
  }

  // ====== HIDE COMPLETED ORDER ======
  async function handleDeleteOrder(orderId) {
    if (!window.confirm("Are you sure you want to delete this order from your history?")) return;
    try {
      await fetch(`/api/orders/${orderId}/hide`, { method: 'PUT' });
      setActivePanel(null);
    } catch(err) {}
  }

  // ====== HIDE COMPLETED APPOINTMENT ======
  async function handleDeleteAppointment(apptId) {
    if (!window.confirm("Are you sure you want to delete this appointment from your history?")) return;
    try {
      await fetch(`/api/appointments/${apptId}/hide`, { method: 'PUT' });
      setActivePanel(null);
    } catch(err) {}
  }

  // ====== HIDE MESSAGE ======
  async function handleDeleteMessage(msgId) {
    if (!window.confirm("Are you sure you want to delete this message from your history?")) return;
    try {
      await fetch(`/api/messages/${msgId}/hide`, { method: 'PUT' });
      setActivePanel(null);
    } catch(err) {}
  }

  // ====== SAVE DELIVERY DETAILS ======
  async function handleSaveDeliveryDetails(orderId) {
    if ((deliveryMethod === "delivery" || deliveryMethod === "courier") && (!deliveryAddress.trim() || !deliveryContact.trim())) {
      alert("Please provide both a delivery address and a contact number.");
      return;
    }
    if (deliveryMethod === "pickup" && !deliveryContact.trim()) {
      alert("Please provide a contact number.");
      return;
    }
    // Validate phone: must be exactly 11 digits starting with 09
    if (!/^09\d{9}$/.test(deliveryContact)) {
      alert("Phone number must be 11 digits starting with 09.");
      return;
    }

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryMethod,
          contact: deliveryContact.trim(),
          address: deliveryMethod === "pickup" ? PICKUP_ADDRESS : deliveryAddress.trim(),
          notes: deliveryNotes.trim(),
        })
      });
      setDeliverySaved(true);
      setTimeout(() => { setDeliverySaved(false); setActivePanel(null); }, 2000);
    } catch(err) {}
  }

  // ====== SEND NEW MESSAGE ======
  async function handleSendMessage(e) {
    e.preventDefault();
    if (!msgBody.trim() || sending) return;
    setSending(true);

    const newMsg = {
      public_id: `MSG-${Date.now()}`,
      user_id: user?.id || null,
      from_name: user?.name || user?.username || "User",
      subject: msgSubject || "User Message",
      body: msgBody,
      order_id: msgRefType === "order" ? msgRefId : null,
      appointment_id: msgRefType === "appointment" ? msgRefId : null,
    };
    
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
      setMsgSent(true);
      setMsgSubject(""); setMsgBody(""); setMsgRefType("none"); setMsgRefId("");
      setTimeout(() => setMsgSent(false), 3000);
    } catch(err) {} finally {
      setSending(false);
    }
  }

  // ====== REPLY TO TICKET ======
  async function handleReply(ticketId) {
    if (!replyText.trim()) return;
    try {
      await fetch(`/api/messages/${ticketId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_name: user?.name || user?.username || "User",
          body: replyText.trim()
        })
      });
      setReplyText("");
    } catch(err) { console.error(err); }
  }

  if (!user) return null;

  // Check if any orders need delivery details (orders that are not completed/cancelled without deliveryMethod)
  const ordersNeedingDetails = orders.filter((o) => 
    (o.status === "In Progress" || o.status === "Ready" || o.status === "In Transit") && !o.address
  );


  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed bottom-4 left-4 z-40 w-12 h-12 bg-[#191a23] text-white rounded-full shadow-lg flex items-center justify-center text-[20px] hover:bg-[#2a2b36] transition-all duration-300"
      >
        {collapsed ? (
          <span className="relative">
            📋
            {(unreadTickets > 0 || ordersNeedingDetails.length > 0) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#e05555] rounded-full" />
            )}
          </span>
        ) : "✕"}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-[280px] bg-white border-r border-black/5 shadow-[4px_0_20px_rgba(0,0,0,0.03)] flex flex-col transition-transform duration-500 lg:translate-x-0 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{ top: "72px", height: "calc(100vh - 72px)" }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#f36767] text-white flex items-center justify-center text-[14px] font-bold shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#191a23]">{user.name}</p>
              <p className="text-[11px] text-black/40">My Dashboard</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

          {/* Action Required: Orders needing delivery details */}
          {ordersNeedingDetails.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-[#e05555] uppercase tracking-wider mb-2 px-1 animate-pulse">
                🔔 Action Required
              </h3>
              {ordersNeedingDetails.map((o) => (
                <div key={o.id} className="bg-[#fef3c7] rounded-xl p-3 border border-[#f59e0b]/30 mb-2">
                  <p className="text-[12px] font-medium text-[#191a23]">{o.service || o.product || "Order"}</p>
                  <p className="text-[10px] font-mono text-black/30">{o.id}</p>
                  <p className="text-[10px] text-black/50 mt-1">Please select delivery or pickup for this order.</p>
                  <button
                    onClick={() => {
                      setDeliveryMethod("delivery");
                      setDeliveryAddress("");
                      setDeliveryContact("");
                      setDeliveryNotes("");
                      setDeliverySaved(false);
                      setActivePanel(`order-${o.id}`);
                    }}
                    className="mt-2 w-full bg-[#e05555] hover:bg-[#c43a3a] text-white text-[12px] font-semibold py-2 rounded-lg transition-colors"
                  >
                    📦 Set Delivery Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Appointments */}
          <div>
            <h3 className="text-[11px] font-bold text-black/30 uppercase tracking-wider mb-2.5 px-1">📅 My Appointments</h3>
            {appts.length === 0 ? (
              <p className="text-[12px] text-black/30 px-1">No appointments yet.</p>
            ) : (
              <div className="space-y-2">
                {appts.map((a) => {
                  const canCancel = a.status !== "Completed" && a.status !== "Cancelled";
                  return (
                    <div key={a.id} className="bg-[#fafafa] rounded-xl p-3 border border-black/5 hover:border-[#f36767]/20 transition-all duration-300">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <p className="text-[13px] font-medium text-[#191a23] leading-tight">{a.service || "Appointment"}</p>
                          <p className="text-[10px] font-mono text-black/30 mt-0.5">ID: {a.id}</p>
                        </div>
                        <Badge status={a.status} />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-black/40">
                        <span>📅 {a.date}</span>
                        {a.time && a.time !== "TBD" && <span>🕐 {a.time}</span>}
                      </div>
                      {a.clinic && <p className="text-[11px] text-black/35 mt-1">🏥 {a.clinic}</p>}
                      {canCancel && (
                        <button
                          onClick={() => setActivePanel(`cancel-appt-${a.id}`)}
                          className="mt-2 w-full bg-red-50 text-red-500 text-[11px] font-semibold py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          ❌ Cancel Appointment
                        </button>
                      )}
                      {(a.status === "Completed" || a.status === "Cancelled") && (
                        <button
                          onClick={() => handleDeleteAppointment(a.id)}
                          className="mt-2 w-full bg-gray-50 text-gray-500 text-[11px] font-semibold py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          🗑 Delete History
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Orders */}
          <div>
            <h3 className="text-[11px] font-bold text-black/30 uppercase tracking-wider mb-2.5 px-1">📦 My Orders</h3>
            {orders.length === 0 ? (
              <p className="text-[12px] text-black/30 px-1">No orders yet. Orders are created when your appointment is marked as completed by the admin.</p>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => {
                  const canCancel = o.status === "In Progress" || o.status === "Pending";
                  return (
                    <div
                      key={o.id}
                      className="bg-[#fafafa] rounded-xl p-3 border border-black/5 hover:border-[#f36767]/20 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        setDeliveryMethod(o.deliveryMethod || "delivery");
                        setDeliveryAddress(o.address && o.address !== "Pickup" ? o.address : "");
                        setDeliveryContact(o.deliveryContact || "");
                        setDeliveryNotes(o.deliveryNotes || "");
                        setDeliverySaved(false);
                        setActivePanel(`order-${o.id}`);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#191a23] leading-tight truncate">
                            {o.service || (o.items ? o.items.map((i) => i.product).join(", ") : o.product) || "Order"}
                          </p>
                          <p className="text-[10px] font-mono text-black/30 mt-0.5">{o.id}</p>
                        </div>
                        <Badge status={o.status} />
                      </div>
                      {o.deliveryMethod && (
                        <p className="text-[11px] text-black/40 mt-1">
                          {o.deliveryMethod === "delivery" ? `🚚 Delivery: ${o.address}` : o.deliveryMethod === "courier" ? `📦 Courier: ${o.address}` : `🏪 Pickup: ${PICKUP_ADDRESS}`}
                        </p>
                      )}
                      {!o.deliveryMethod && o.status === "In Progress" && (
                        <p className="text-[11px] text-[#e05555] font-medium mt-1">⚠️ Set delivery details →</p>
                      )}
                      {canCancel && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCancelOrder(o.id); }}
                          className="mt-2 w-full bg-red-50 text-red-500 text-[11px] font-semibold py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          ❌ Cancel Order
                        </button>
                      )}
                      {(o.status === "Delivered" || o.status === "Completed" || o.status === "Cancelled") && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteOrder(o.id); }}
                          className="mt-2 w-full bg-gray-50 text-gray-500 text-[11px] font-semibold py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          🗑 Delete Order History
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tickets / Messages */}
          <div>
            <h3 className="text-[11px] font-bold text-black/30 uppercase tracking-wider mb-2.5 px-1">
              💬 My Messages {unreadTickets > 0 && <span className="ml-1 bg-[#e05555] text-white rounded-full px-1.5 py-0.5 text-[9px]">{unreadTickets}</span>}
            </h3>
            {tickets.length === 0 ? (
              <p className="text-[12px] text-black/30 px-1">No messages yet.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => {
                  const hasAdminReply = t.replies?.length > 0 && t.replies[t.replies.length - 1].from === "Admin";
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        const isOpening = activePanel !== `ticket-${t.id}`;
                        setActivePanel(isOpening ? `ticket-${t.id}` : null);
                        
                        // Mark as read if it needs user attention
                        const needsUserAttention = !t.is_read && (t.from_name === "Admin" || (t.replies?.length > 0 && t.replies[t.replies.length - 1].from === "Admin"));
                        if (isOpening && needsUserAttention) {
                          fetch(`/api/messages/${t.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ is_read: 1 })
                          }).catch(err => console.error(err));
                        }
                      }}
                      className={`w-full text-left bg-[#fafafa] rounded-xl p-3 border transition-all duration-300 ${
                        (!t.is_read && (t.from_name === "Admin" || (t.replies?.length > 0 && t.replies[t.replies.length - 1].from === "Admin"))) ? "border-[#e05555]/30 bg-[#fef2f2]" : "border-black/5"
                      } hover:border-[#f36767]/30`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <p className="text-[12px] font-medium text-[#191a23] truncate">{t.subject}</p>
                          {(!t.is_read && (t.from_name === "Admin" || (t.replies?.length > 0 && t.replies[t.replies.length - 1].from === "Admin"))) && <span className="w-2 h-2 rounded-full bg-[#e05555] shrink-0" />}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteMessage(t.id); }}
                          className="text-gray-300 hover:text-[#e05555] transition-colors shrink-0 text-sm"
                          title="Delete message from history"
                        >
                          🗑
                        </button>
                      </div>
                      <p className="text-[10px] text-black/30 mt-0.5">
                        {t.date ? new Date(t.date).toLocaleDateString("en-US", { month: 'numeric', day: 'numeric', year: 'numeric' }) : ""}
                      </p>
                      {t.replies?.length > 0 && (
                        <p className="text-[10px] text-black/40 mt-1">{t.replies.length} {t.replies.length === 1 ? "reply" : "replies"}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Message Admin Button */}
        <div className="px-4 py-3 border-t border-black/5">
          <button
            onClick={() => setActivePanel(activePanel === "message" ? null : "message")}
            className="w-full bg-[#191a23] text-white text-[13px] font-medium py-2.5 rounded-xl hover:bg-[#2a2b36] transition-all duration-300 flex items-center justify-center gap-2"
          >
            💬 Message Admin
          </button>
        </div>
      </aside>

      {/* ====== MODAL: Cancel Appointment Confirmation ====== */}
      {activePanel?.startsWith("cancel-appt-") && (() => {
        const apptId = parseInt(activePanel.replace("cancel-appt-", ""));
        const appt = appts.find((a) => a.id === apptId);
        if (!appt) return null;
        return (
          <ModalOverlay onClose={() => setActivePanel(null)}>
            <div className="text-center">
              <p className="text-3xl mb-3">❌</p>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Cancel Appointment?</h3>
              <p className="text-sm text-gray-500 mb-2">
                {appt.service || "Appointment"} on {appt.date} at {appt.time}
              </p>
              <p className="text-xs text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setActivePanel(null)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Keep it
                </button>
                <button onClick={() => handleCancelAppointment(apptId)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                  Cancel Appointment
                </button>
              </div>
            </div>
          </ModalOverlay>
        );
      })()}

      {/* ====== MODAL: Order Details & Delivery Form ====== */}
      {activePanel?.startsWith("order-") && (() => {
        const orderId = activePanel.replace("order-", "");
        const order = orders.find((o) => String(o.id) === orderId);
        if (!order) return null;
        const canEdit = ["In Progress", "Pending", "Ready"].includes(order.status);

        return (
          <ModalOverlay onClose={() => setActivePanel(null)}>
            <h3 className="text-lg font-bold text-gray-800 mb-1">📦 Order Details</h3>
            <p className="text-xs font-mono text-[#e05555] mb-1">{order.id}</p>
            <Badge status={order.status} />

            <div className="mt-4 space-y-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Service / Product</p>
                <p className="font-medium text-gray-800">{order.service || order.product || "—"}</p>
              </div>

              {order.appointmentId && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">From Appointment</p>
                  <p className="font-mono text-sm text-blue-600">{order.appointmentId}</p>
                </div>
              )}

              {/* Free Shipping Banner */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-[13px] font-medium text-green-700">🚚 Free Shipping on all deliveries!</p>
              </div>

              {deliverySaved ? (
                <div className="text-center py-4">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-[15px] font-medium text-gray-800">Delivery details saved!</p>
                </div>
              ) : canEdit ? (
                <>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">How would you like to receive your order?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("delivery")}
                        className={`flex-1 py-3 rounded-xl text-[12px] font-medium border-2 transition-all ${
                          deliveryMethod === "delivery"
                            ? "border-[#e05555] bg-[#fce8e8] text-[#e05555]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        🚚 Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("courier")}
                        className={`flex-1 py-3 rounded-xl text-[12px] font-medium border-2 transition-all ${
                          deliveryMethod === "courier"
                            ? "border-[#e05555] bg-[#fce8e8] text-[#e05555]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        📦 Courier
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("pickup")}
                        className={`flex-1 py-3 rounded-xl text-[12px] font-medium border-2 transition-all ${
                          deliveryMethod === "pickup"
                            ? "border-[#e05555] bg-[#fce8e8] text-[#e05555]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        🏪 Pick Up
                      </button>
                    </div>
                  </div>

                  {deliveryMethod === "pickup" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-xs text-blue-600 font-medium mb-0.5">📍 Pickup Location</p>
                      <p className="text-sm font-medium text-gray-800">{PICKUP_ADDRESS}</p>
                    </div>
                  )}

                  {deliveryMethod === "courier" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs text-amber-700 font-medium mb-0.5">📦 Courier — For Outside Metro Manila</p>
                      <p className="text-[11px] text-amber-600">Additional courier fees may apply based on location.</p>
                    </div>
                  )}

                  {(deliveryMethod === "delivery" || deliveryMethod === "courier") && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{deliveryMethod === "courier" ? "Full Address (Province) *" : "Delivery Address *"}</label>
                      <input
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder={deliveryMethod === "courier" ? "e.g. Brgy. San Jose, Batangas City, Batangas" : "e.g. 123 Main St, Quezon City"}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number (09xxxxxxxxx) *</label>
                    <input
                      value={deliveryContact}
                      onChange={(e) => setDeliveryContact(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="09xxxxxxxxx"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]"
                      maxLength={11}
                      inputMode="numeric"
                      required
                    />
                    {deliveryContact.length > 0 && !/^09/.test(deliveryContact) && (
                      <p className="text-[11px] text-[#e05555] mt-1">⚠️ Must start with 09</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Additional Notes</label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Any special instructions..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555] resize-none"
                    />
                  </div>

                  <button
                    onClick={() => handleSaveDeliveryDetails(order.id)}
                    disabled={
                      (deliveryMethod === "delivery" || deliveryMethod === "courier")
                        ? (!deliveryAddress.trim() || !/^09\d{9}$/.test(deliveryContact))
                        : !/^09\d{9}$/.test(deliveryContact)
                    }
                    className="w-full bg-[#e05555] hover:bg-[#c43a3a] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                  >
                    Save {deliveryMethod === "courier" ? "Courier" : deliveryMethod === "pickup" ? "Pickup" : "Delivery"} Details
                  </button>
                </>
              ) : (
                /* Already saved / non-editable */
                <div className="space-y-2">
                  {order.deliveryMethod && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Method</p>
                      <p className="font-medium text-gray-800">{order.deliveryMethod === "delivery" ? "🚚 Delivery" : order.deliveryMethod === "courier" ? "📦 Courier (Outside Metro Manila)" : "🏪 Pick Up"}</p>
                    </div>
                  )}
                  {order.address && order.address !== "Pickup" && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                      <p className="text-gray-800">{order.address}</p>
                    </div>
                  )}
                  {order.deliveryContact && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Contact</p>
                      <p className="text-gray-800">{order.deliveryContact}</p>
                    </div>
                  )}
                  {order.deliveryNotes && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                      <p className="text-gray-700">{order.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalOverlay>
        );
      })()}

      {/* ====== MODAL: New Message ====== */}
      {activePanel === "message" && (
        <ModalOverlay onClose={() => setActivePanel(null)}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">💬 Message Admin</h3>
          {msgSent ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-[16px] font-medium text-gray-800">Message sent!</p>
              <p className="text-[13px] text-gray-400 mt-1">The admin will see your message in their dashboard.</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Related to (optional)</label>
                <div className="flex gap-2">
                  <select value={msgRefType} onChange={(e) => { setMsgRefType(e.target.value); setMsgRefId(""); }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                    <option value="none">None</option>
                    <option value="appointment">Appointment</option>
                    <option value="order">Order</option>
                  </select>
                  {msgRefType !== "none" && (
                    <select value={msgRefId} onChange={(e) => setMsgRefId(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]">
                      <option value="">Select...</option>
                      {(msgRefType === "appointment" ? appts : orders).map((item) => (
                        <option key={item.id} value={item.id}>{item.id} — {item.service || item.product}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                <input value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)} placeholder="e.g. Question about my order"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Message *</label>
                <textarea value={msgBody} onChange={(e) => setMsgBody(e.target.value)} placeholder="Type your message here..."
                  required rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555] resize-none" />
              </div>
              <button type="submit" disabled={!msgBody.trim() || sending}
                className="w-full bg-[#e05555] hover:bg-[#c43a3a] disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </ModalOverlay>
      )}

      {/* ====== MODAL: Ticket Thread ====== */}
      {activePanel?.startsWith("ticket-") && (() => {
        const ticketId = parseInt(activePanel.replace("ticket-", ""));
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket) return null;
        return (
          <ModalOverlay onClose={() => { setActivePanel(null); setReplyText(""); }}>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{ticket.subject}</h3>
            {ticket.orderId && <p className="text-xs text-[#e05555] font-medium">📦 Order: {ticket.orderId}</p>}
            {ticket.appointmentId && <p className="text-xs text-blue-600 font-medium">📅 Appointment: {ticket.appointmentId}</p>}
            <p className="text-xs text-gray-400 mb-4">{ticket.date}</p>

            {/* Thread */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {/* Original message */}
              <div className="bg-[#f0f0f0] rounded-xl p-3">
                <p className="text-[11px] font-semibold text-black/50 mb-1">You</p>
                <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{ticket.body}</p>
              </div>
              {/* Replies */}
              {ticket.replies?.map((r, i) => (
                <div key={i} className={`rounded-xl p-3 ${r.from === "Admin" ? "bg-[#fce8e8] border border-[#e05555]/10" : "bg-[#f0f0f0]"}`}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: r.from === "Admin" ? "#e05555" : "#666" }}>
                    {r.from === "Admin" ? "🛡️ Admin" : "You"}
                  </p>
                  <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{r.body}</p>
                  <p className="text-[10px] text-black/30 mt-1">{r.date}</p>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05555] resize-none"
              />
              <button
                onClick={() => handleReply(ticketId)}
                disabled={!replyText.trim()}
                className="mt-2 w-full bg-[#191a23] hover:bg-[#2a2b36] disabled:opacity-40 text-white text-sm font-medium py-2 rounded-xl transition-colors"
              >
                Send Reply
              </button>
            </div>
          </ModalOverlay>
        );
      })()}

      {/* Mobile overlay */}
      {!collapsed && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setCollapsed(true)} />}
    </>
  );
}

function ModalOverlay({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-[pageSlideIn_0.3s_ease_forwards]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-1">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
