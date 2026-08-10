import { useEffect, useMemo, useState } from "react";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import {
  AccessibilityIcon,
  BellIcon,
  CalendarIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ChevronRightIcon,
  ClipboardIcon,
  ClockIcon,
  Cross2Icon,
  DashboardIcon,
  DownloadIcon,
  EnvelopeClosedIcon,
  ExclamationTriangleIcon,
  FileTextIcon,
  GearIcon,
  HeartIcon,
  HomeIcon,
  IdCardIcon,
  LightningBoltIcon,
  MagnifyingGlassIcon,
  PaperPlaneIcon,
  PersonIcon,
  PlusIcon,
  ReaderIcon,
  RocketIcon,
  SewingPinIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, KeyboardInput, KeyboardTextarea, MobileScroll, useKeyboard } from "./mobile";

type Guest = {
  name: string;
  hotel: string;
  reservation: string;
  arrival: string;
  room?: string;
  contact?: string;
};

type TicketStatus = "New" | "In progress" | "Resolved";
type Department = "Front Desk" | "Concierge" | "Maintenance";

type Ticket = {
  id: string;
  title: string;
  detail: string;
  department: Department;
  status: TicketStatus;
  priority: "Standard" | "High";
  minutesOpen: number;
  hoursInProgress?: number;
  comments: string[];
};

type View = "auth" | "home" | "concierge" | "requests" | "profile" | "ops";
type Sheet = "review" | "new-request" | "ticket" | "feedback" | "checkout" | null;

const hotels = [
  { name: "Aurora Grand", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001" },
  { name: "Cove House", city: "Goa", state: "Goa", country: "India", pincode: "403001" },
  { name: "The Meridian", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560001" },
  { name: "Aravali House", city: "Udaipur", state: "Rajasthan", country: "India", pincode: "313001" },
  { name: "Monsoon Atelier", city: "Kochi", state: "Kerala", country: "India", pincode: "682001" },
  { name: "Saffron Courtyard", city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001" },
  { name: "The Cedar Reserve", city: "Shimla", state: "Himachal Pradesh", country: "India", pincode: "171001" },
  { name: "Bayline Retreat", city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600001" },
  { name: "The Imperial Grove", city: "Delhi", state: "Delhi", country: "India", pincode: "110001" },
  { name: "Lotus Quay", city: "Kolkata", state: "West Bengal", country: "India", pincode: "700001" },
  { name: "Deccan House", city: "Hyderabad", state: "Telangana", country: "India", pincode: "500001" },
  { name: "Nila Heritage", city: "Puducherry", state: "Puducherry", country: "India", pincode: "605001" },
  { name: "Riverstone Lodge", city: "Rishikesh", state: "Uttarakhand", country: "India", pincode: "249201" },
  { name: "The Palm Annex", city: "Dubai", state: "Dubai", country: "UAE", pincode: "00000" },
  { name: "Harbour No. 8", city: "Singapore", state: "Singapore", country: "Singapore", pincode: "018956" },
];

const reservations: Record<string, Guest> = {
  "AG-7K92": { name: "Maya Kapoor", hotel: "Aurora Grand", reservation: "AG-7K92", arrival: "18:40", room: "1208", contact: "maya@example.com" },
  "CH-2048": { name: "Arjun Mehta", hotel: "Cove House", reservation: "CH-2048", arrival: "16:20", room: "408", contact: "+91 98765 43210" },
  "TM-8841": { name: "Rhea Shah", hotel: "The Meridian", reservation: "TM-8841", arrival: "20:10", room: "905", contact: "rhea@example.com" },
};

const initialTickets: Ticket[] = [
  {
    id: "IST-2408",
    title: "Wheelchair assistance",
    detail: "Meet at the main entrance at 18:35.",
    department: "Concierge",
    status: "In progress",
    priority: "High",
    minutesOpen: 286,
    hoursInProgress: 4.6,
    comments: [],
  },
  {
    id: "IST-2407",
    title: "AC making a noise",
    detail: "Technician dispatch requested for room 1208.",
    department: "Maintenance",
    status: "New",
    priority: "High",
    minutesOpen: 18,
    comments: [],
  },
  {
    id: "IST-2406",
    title: "Late checkout",
    detail: "Checkout extended to 14:00.",
    department: "Front Desk",
    status: "Resolved",
    priority: "Standard",
    minutesOpen: 32,
    comments: ["Approved by front desk."],
  },
];

const specialRequests = [
  "Wheelchair assistance",
  "Medical assistance",
  "Deaf or hearing assistance",
  "Blind or visual assistance",
  "Portable oxygen assistance",
  "Stretcher assistance",
  "Special dietary meal",
  "Unaccompanied minor support",
  "Infant and bassinet support",
  "Pregnant traveller assistance",
  "Elderly traveller assistance",
  "Service animal or pet support",
  "Mobility device handling",
  "Language assistance",
];

const requestOptions: { label: string; department: Department; icon: typeof GearIcon }[] = [
  { label: "Housekeeping", department: "Front Desk", icon: StarIcon },
  { label: "Maintenance", department: "Maintenance", icon: GearIcon },
  { label: "Dining & reservations", department: "Concierge", icon: CalendarIcon },
  { label: "Airport transfer", department: "Concierge", icon: RocketIcon },
  { label: "Checkout & billing", department: "Front Desk", icon: FileTextIcon },
  { label: "Special requests", department: "Concierge", icon: AccessibilityIcon },
];

function wordCountCredits(text: string) {
  return Math.max(2, Math.ceil(text.length / 4) * 2);
}

function statusClass(status: TicketStatus) {
  return status.toLowerCase().replace(" ", "-");
}

function AppMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`app-mark ${compact ? "compact" : ""}`} aria-label="Intellistay">
      <span className="brand-symbol"><LightningBoltIcon /></span>
      <span>Intellistay</span>
    </div>
  );
}

function Field({ label, ...props }: React.ComponentProps<typeof KeyboardInput> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <KeyboardInput {...props} />
    </label>
  );
}

function BottomNav({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  const items: { id: View; label: string; icon: typeof HomeIcon }[] = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "concierge", label: "Concierge", icon: ChatBubbleIcon },
    { id: "requests", label: "Requests", icon: ClipboardIcon },
    { id: "profile", label: "Profile", icon: PersonIcon },
  ];
  return (
    <nav className="bottom-nav" aria-label="Primary app navigation">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={view === item.id ? "active" : ""}
            aria-current={view === item.id ? "page" : undefined}
            onClick={() => onChange(item.id)}
            data-testid={`nav-${item.id}`}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TicketRow({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) {
  return (
    <button className="ticket-row" onClick={onOpen}>
      <span className={`ticket-status-dot ${statusClass(ticket.status)}`} />
      <span className="ticket-copy">
        <strong>{ticket.title}</strong>
        <small>{ticket.id} · {ticket.department}</small>
      </span>
      <span className={`status-pill ${statusClass(ticket.status)}`}>{ticket.status}</span>
      <ChevronRightIcon />
    </button>
  );
}

export default function Prototype() {
  const keyboard = useKeyboard();
  const [view, setView] = useState<View>(() => {
    const requested = new URLSearchParams(window.location.search).get("screen");
    return (["home", "concierge", "requests", "profile", "ops"] as View[]).includes(requested as View)
      ? (requested as View)
      : "auth";
  });
  const [authMode, setAuthMode] = useState<"reservation" | "guest">("reservation");
  const [reservationCode, setReservationCode] = useState("AG-7K92");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [hotelSearch, setHotelSearch] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<(typeof hotels)[number] | null>(null);
  const [authError, setAuthError] = useState("");
  const [guest, setGuest] = useState<Guest>(reservations["AG-7K92"]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState("IST-2407");
  const [requestCategory, setRequestCategory] = useState("");
  const [requestDepartment, setRequestDepartment] = useState<Department>("Front Desk");
  const [requestDetail, setRequestDetail] = useState("");
  const [showSpecialRequests, setShowSpecialRequests] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("Service request");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [toast, setToast] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "ai", text: "I’m tracking your arrival. Your transfer and dinner are already aligned with the new flight time." },
  ]);
  const [credits, setCredits] = useState(1200);
  const [opsComment, setOpsComment] = useState("");
  const [simulatedMinutes, setSimulatedMinutes] = useState(0);

  const hotelMatches = useMemo(() => {
    const query = hotelSearch.trim().toLowerCase();
    if (!query) return hotels.slice(0, 4);
    return hotels
      .filter((hotel) => `${hotel.name} ${hotel.city} ${hotel.state} ${hotel.country} ${hotel.pincode}`.toLowerCase().includes(query))
      .slice(0, 5);
  }, [hotelSearch]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0];
  const firstName = guest.name.split(" ")[0] || "Guest";

  useEffect(() => {
    const resetSurface = () => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      const scroller = document.querySelector<HTMLElement>('[data-testid="mobile-scroll"]');
      if (scroller) scroller.scrollTop = 0;
    };
    resetSurface();
    const timer = window.setTimeout(resetSurface, 140);
    return () => window.clearTimeout(timer);
  }, [view]);

  const dismissKeyboard = () => {
    if (keyboard.visible) keyboard.hide();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const changeView = (next: View) => {
    dismissKeyboard();
    setView(next);
  };

  const login = () => {
    dismissKeyboard();
    setAuthError("");
    if (authMode === "reservation") {
      const match = reservations[reservationCode.trim().toUpperCase()];
      if (!match) {
        setAuthError("Reservation not found. Try AG-7K92 for the demo.");
        return;
      }
      setGuest(match);
      setView("home");
      notify(`Welcome back, ${match.name.split(" ")[0]}.`);
      return;
    }
    if (!guestName.trim() || (!guestEmail.trim() && !guestPhone.trim())) {
      setAuthError("Add your name and either a phone number or email address.");
      return;
    }
    if (!selectedHotel) {
      setAuthError("Choose a participating hotel.");
      return;
    }
    setGuest({
      name: guestName.trim(),
      hotel: selectedHotel.name,
      reservation: "GUEST-2026",
      arrival: "Today",
      contact: guestEmail.trim() || guestPhone.trim(),
    });
    setView("home");
    notify("Guest access created. No password required for this demo.");
  };

  const raiseTicket = (title: string, department: Department, detail = "Guest request received in the app.") => {
    const id = `IST-${2410 + tickets.length}`;
    const ticket: Ticket = {
      id,
      title,
      detail,
      department,
      status: "New",
      priority: title.toLowerCase().includes("ac") || title.toLowerCase().includes("wheelchair") ? "High" : "Standard",
      minutesOpen: 0,
      comments: [],
    };
    setTickets((current) => [ticket, ...current]);
    setSelectedTicketId(id);
    notify(`${id} routed to ${department}.`);
    return id;
  };

  const submitRequest = () => {
    if (!requestCategory) return;
    dismissKeyboard();
    raiseTicket(requestCategory, requestDepartment, requestDetail || "Guest request received in the app.");
    setSheet(null);
    setRequestCategory("");
    setRequestDetail("");
    setShowSpecialRequests(false);
    setView("requests");
  };

  const sendMessage = async () => {
    const prompt = chatInput.trim();
    if (!prompt) return;
    dismissKeyboard();
    setChatInput("");
    setMessages((current) => [...current, { from: "guest", text: prompt }]);
    const lower = prompt.toLowerCase();
    let response = "I can help with that. I’ve prepared a request for the concierge team and kept it visible in My Requests.";
    if (lower.includes("ac") || lower.includes("air conditioning")) {
      const id = raiseTicket("AC making a noise", "Maintenance", "AI detected an in-room maintenance issue and dispatched the nearest technician. A ₹1,250 lobby voucher was issued while the guest waits.");
      response = `Done. I created high-priority ticket ${id}, dispatched Maintenance, and added a ₹1,250 lobby voucher while you wait.`;
    } else if (lower.includes("wheelchair")) {
      const id = raiseTicket("Wheelchair assistance", "Concierge", "Wheelchair and trained assistance requested at the hotel entrance.");
      response = `Wheelchair assistance is arranged under ${id}. The concierge team will meet you at the entrance.`;
    } else if (lower.includes("checkout") || lower.includes("invoice") || lower.includes("bill")) {
      response = "Your balance is fully paid. I can generate both the invoice and itemized bill privately on this device.";
      setSheet("checkout");
    } else if (lower.includes("flight") || lower.includes("transfer")) {
      response = "I’m tracking AI-624. The driver has the updated 19:30 pickup, and your dinner is now at 20:00 on the Terrace.";
    }

    const endpoint = import.meta.env.VITE_CONCIERGE_API_URL;
    if (endpoint) {
      try {
        const result = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, guest, tickets }),
        });
        if (result.ok) {
          const data = await result.json();
          if (typeof data.reply === "string") response = data.reply;
        }
      } catch {
        // The secure endpoint is optional; the deterministic orchestration demo remains available offline.
      }
    }
    setCredits((current) => Math.max(0, current - wordCountCredits(prompt + response)));
    window.setTimeout(() => setMessages((current) => [...current, { from: "ai", text: response }]), 300);
  };

  const updateTicket = (id: string, status: TicketStatus) => {
    const current = tickets.find((ticket) => ticket.id === id);
    if (current?.hoursInProgress && current.hoursInProgress >= 4 && status === "Resolved" && !current.comments.length) {
      notify("Add an update comment before resolving this 4-hour alert.");
      return;
    }
    setTickets((all) => all.map((ticket) => ticket.id === id ? { ...ticket, status, hoursInProgress: status === "In progress" ? 0 : ticket.hoursInProgress } : ticket));
    notify(`${id} moved to ${status}.`);
  };

  const addOpsComment = (id: string) => {
    if (!opsComment.trim()) return;
    setTickets((all) => all.map((ticket) => ticket.id === id ? { ...ticket, comments: [...ticket.comments, opsComment.trim()] } : ticket));
    setOpsComment("");
    dismissKeyboard();
    notify("Update saved; stall alert cleared.");
  };

  const downloadStayPdf = async (kind: "Invoice" | "Itemized Bill") => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Intellistay", 20, 24);
    doc.setFontSize(16);
    doc.text(kind, 20, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Guest: ${guest.name}`, 20, 54);
    doc.text(`Hotel: ${guest.hotel}`, 20, 62);
    doc.text(`Reservation: ${guest.reservation}`, 20, 70);
    doc.text("Stay charges", 20, 88);
    doc.text("Room · 2 nights", 20, 98);
    doc.text("₹48,000", 170, 98, { align: "right" });
    doc.text("Dining", 20, 108);
    doc.text("₹6,850", 170, 108, { align: "right" });
    doc.text("Spa", 20, 118);
    doc.text("₹4,200", 170, 118, { align: "right" });
    doc.line(20, 126, 170, 126);
    doc.setFont("helvetica", "bold");
    doc.text("Paid in full", 20, 138);
    doc.text("₹59,050", 170, 138, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("Generated privately in the Intellistay app. No device data was uploaded.", 20, 160);
    doc.save(`Intellistay-${kind.replace(" ", "-")}-${guest.reservation}.pdf`);
    notify(`${kind} downloaded.`);
  };

  const submitFeedback = () => {
    if (!rating) {
      notify("Choose a rating before submitting.");
      return;
    }
    dismissKeyboard();
    setSheet(null);
    setRating(0);
    setFeedbackComment("");
    notify("Thank you. Your feedback is linked to the service request.");
  };

  const renderAuth = () => (
    <MobileScroll className="app-screen auth-scroll">
      <main className="auth-screen" data-testid="auth-screen">
        <AppMark />
        <div className="auth-hero">
          <span className="eyebrow">Your stay, already in motion</span>
          <h1>Welcome to a more thoughtful stay.</h1>
          <p>Use a reservation, or continue as a guest with your name and one contact method.</p>
        </div>

        <div className="segment-control" role="tablist" aria-label="Access method">
          <button role="tab" aria-selected={authMode === "reservation"} className={authMode === "reservation" ? "active" : ""} onClick={() => setAuthMode("reservation")}>Reservation</button>
          <button role="tab" aria-selected={authMode === "guest"} className={authMode === "guest" ? "active" : ""} onClick={() => setAuthMode("guest")} data-testid="guest-access-tab">Guest access</button>
        </div>

        {authMode === "reservation" ? (
          <section className="access-form">
            <Field label="Reservation number" value={reservationCode} onChange={(event) => setReservationCode(event.target.value)} autoCapitalize="characters" data-testid="reservation-input" />
            <p className="field-help"><IdCardIcon /> Demo reservation: <button onClick={() => setReservationCode("AG-7K92")}>AG-7K92</button></p>
            <div className="matched-stay">
              <span className="hotel-monogram">AG</span>
              <span><strong>Aurora Grand</strong><small>Mumbai · Arrival 18:40</small></span>
              <CheckCircledIcon />
            </div>
          </section>
        ) : (
          <section className="access-form">
            <Field label="Full name" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Your name" />
            <div className="two-fields">
              <Field label="Phone" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} placeholder="Optional" inputMode="tel" />
              <Field label="Email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Optional" inputMode="email" />
            </div>
            <label className="search-field">
              <span>Participating hotel</span>
              <div><MagnifyingGlassIcon /><KeyboardInput value={hotelSearch} onChange={(event) => setHotelSearch(event.target.value)} placeholder="Hotel, city, region or pincode" /></div>
            </label>
            <div className="hotel-results" role="listbox" aria-label="Participating hotels">
              {hotelMatches.map((hotel) => (
                <button key={hotel.name} className={selectedHotel?.name === hotel.name ? "selected" : ""} onClick={() => setSelectedHotel(hotel)}>
                  <span><strong>{hotel.name}</strong><small>{hotel.city}, {hotel.country} · {hotel.pincode}</small></span>
                  {selectedHotel?.name === hotel.name ? <CheckCircledIcon /> : <ChevronRightIcon />}
                </button>
              ))}
            </div>
          </section>
        )}

        {authError && <p className="form-error"><ExclamationTriangleIcon /> {authError}</p>}
        <button className="primary-button" onClick={login} data-testid="continue-button">Continue securely <ChevronRightIcon /></button>
        <p className="privacy-note">Demo data stays in memory and resets when the page reloads. Intellistay does not read files, contacts, photos, or device history.</p>
      </main>
    </MobileScroll>
  );

  const renderHome = () => (
    <main className="screen-content home-screen" data-testid="home-screen">
      <header className="screen-header home-header">
        <AppMark compact />
        <button className="icon-button" aria-label="Profile" onClick={() => changeView("profile")}><PersonIcon /></button>
      </header>
      <section className="greeting">
        <p>Good evening,</p>
        <h1>{firstName}.</h1>
        <div className="stay-line"><SewingPinIcon /><strong>{guest.hotel}</strong><span />Arriving {guest.arrival}</div>
      </section>
      <section className="proactive-card" data-testid="proactive-card">
        <div className="proactive-label"><span><LightningBoltIcon /></span> Proactive update</div>
        <h2>I noticed your flight is delayed. I’ve adjusted your airport transfer and dinner reservation.</h2>
        <div className="progress-list">
          <div className="done"><CheckCircledIcon /><span><strong>Flight delay detected</strong><small>AI-624 · 42 minutes</small></span></div>
          <div className="done"><CheckCircledIcon /><span><strong>Transfer updated</strong><small>New pickup 19:30</small></span></div>
          <div className="current"><ClockIcon /><span><strong>Dinner reservation adjusted</strong><small>20:00 at Terrace</small></span></div>
        </div>
        <button className="sand-button" onClick={() => setSheet("review")}>Review changes <ChevronRightIcon /></button>
        <button className="outline-button light" onClick={() => changeView("concierge")}><ChatBubbleIcon /> Ask Intellistay</button>
      </section>
      <button className="reservation-row" onClick={() => setSheet("checkout")}>
        <span className="reservation-icon"><ReaderIcon /></span>
        <span><small>Your reservation</small><strong>Confirmation #{guest.reservation}</strong></span>
        <ChevronRightIcon />
      </button>
      <section className="home-suggestion">
        <span><BellIcon /></span>
        <div><small>Tomorrow’s weather</small><strong>Rain expected · indoor spa cabana available</strong></div>
        <button onClick={() => { setRequestCategory("Indoor spa cabana"); setRequestDepartment("Concierge"); setSheet("new-request"); }}>Reserve</button>
      </section>
    </main>
  );

  const renderConcierge = () => (
    <main className="screen-content concierge-screen" data-testid="concierge-screen">
      <header className="screen-header">
        <div><span className="eyebrow">Live concierge</span><h1>How can I help?</h1></div>
        <span className="credit-pill"><LightningBoltIcon /> {credits} credits</span>
      </header>
      <div className="quick-actions" aria-label="Concierge shortcuts">
        <button onClick={() => { setRequestCategory("Wheelchair assistance"); setRequestDepartment("Concierge"); setRequestDetail("Meet the guest at the main entrance."); setSheet("new-request"); }}><AccessibilityIcon />Wheelchair</button>
        <button onClick={() => { setShowSpecialRequests(true); setSheet("new-request"); }}><StarIcon />Special requests</button>
        <button onClick={() => { setRequestCategory("AC making a noise"); setRequestDepartment("Maintenance"); setRequestDetail("Dispatch the nearest technician."); setSheet("new-request"); }}><GearIcon />Room issue</button>
      </div>
      <section className="chat-thread" aria-live="polite">
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`} className={`message ${message.from}`}>
            {message.from === "ai" && <span className="ai-avatar"><LightningBoltIcon /></span>}
            <p>{message.text}</p>
          </div>
        ))}
      </section>
      <div className="chat-composer">
        <KeyboardInput value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }} placeholder="Ask Intellistay anything" aria-label="Ask Intellistay anything" />
        <button onClick={() => void sendMessage()} aria-label="Send message"><PaperPlaneIcon /></button>
      </div>
      <p className="ai-note">2 credits per estimated token · secure endpoint ready · offline orchestration fallback active</p>
    </main>
  );

  const renderRequests = () => (
    <main className="screen-content requests-screen" data-testid="requests-screen">
      <header className="screen-header">
        <div><span className="eyebrow">My stay</span><h1>Requests</h1></div>
        <button className="new-request-button" onClick={() => setSheet("new-request")}><PlusIcon /> New</button>
      </header>
      <section className="request-summary">
        <span><strong>{tickets.filter((ticket) => ticket.status !== "Resolved").length}</strong> active</span>
        <span><strong>{tickets.filter((ticket) => ticket.status === "Resolved").length}</strong> resolved</span>
        <span><strong>7m</strong> avg reply</span>
      </section>
      <section className="ticket-list" aria-label="Guest requests">
        {tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} onOpen={() => { setSelectedTicketId(ticket.id); setSheet("ticket"); }} />)}
      </section>
      <div className="empty-action">
        <HeartIcon />
        <div><strong>How was the service?</strong><span>Rate any request after the team has helped.</span></div>
        <button onClick={() => setSheet("feedback")}>Feedback</button>
      </div>
    </main>
  );

  const renderProfile = () => (
    <main className="screen-content profile-screen" data-testid="profile-screen">
      <header className="profile-hero">
        <span className="profile-avatar">{guest.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
        <h1>{guest.name}</h1>
        <p>{guest.hotel} · #{guest.reservation}</p>
      </header>
      <section className="profile-section">
        <span className="section-label">Stay & account</span>
        <button onClick={() => setSheet("checkout")}><FileTextIcon /><span><strong>Checkout & billing</strong><small>Paid · invoice and itemized bill ready</small></span><ChevronRightIcon /></button>
        <button onClick={() => setSheet("feedback")}><HeartIcon /><span><strong>Share feedback</strong><small>Ratings required · comments optional</small></span><ChevronRightIcon /></button>
        <button onClick={() => changeView("ops")} data-testid="open-ops"><DashboardIcon /><span><strong>Staff operations demo</strong><small>Tickets, routing and escalation logic</small></span><ChevronRightIcon /></button>
      </section>
      <section className="profile-section">
        <span className="section-label">Hotel contacts</span>
        <div className="contact-row"><span>AM</span><div><strong>Aisha Menon</strong><small>Front Desk Lead · aisha@auroragrand.demo</small></div></div>
        <div className="contact-row"><span>RK</span><div><strong>Rohan Khanna</strong><small>Concierge Lead · rohan@auroragrand.demo</small></div></div>
        <div className="contact-row"><span>JL</span><div><strong>Jia Lee</strong><small>Engineering Lead · jia@auroragrand.demo</small></div></div>
      </section>
      <section className="privacy-card">
        <CheckCircledIcon />
        <div><strong>Private demo mode</strong><p>No contacts, files, photos, location history, or device identifiers are read. Data resets on reload.</p></div>
      </section>
      <button className="text-button" onClick={() => { setView("auth"); dismissKeyboard(); }}>Sign out of demo</button>
    </main>
  );

  const renderOps = () => (
    <main className="screen-content ops-screen" data-testid="ops-screen">
      <header className="ops-header">
        <button className="icon-button light-bg" onClick={() => changeView("profile")}><Cross2Icon /></button>
        <div><span className="eyebrow">Aurora Grand</span><h1>Operations</h1></div>
        <button className="time-sim" onClick={() => setSimulatedMinutes((value) => value + 15)}>+15 min</button>
      </header>
      <section className="ops-metrics">
        <span><strong>{tickets.filter((ticket) => ticket.status === "New").length}</strong> New</span>
        <span><strong>{tickets.filter((ticket) => ticket.status === "In progress").length}</strong> Active</span>
        <span><strong>{tickets.filter((ticket) => ticket.priority === "High" && ticket.status !== "Resolved").length}</strong> High</span>
      </section>
      <div className="ops-live"><span className="live-dot" /> Department routing live · notifications enabled</div>
      <section className="ops-ticket-list">
        {tickets.filter((ticket) => ticket.status !== "Resolved").map((ticket) => {
          const effectiveMinutes = ticket.minutesOpen + simulatedMinutes;
          const stalled = ticket.status === "In progress" && (ticket.hoursInProgress ?? 0) >= 4 && !ticket.comments.length;
          return (
            <article key={ticket.id} className={`ops-ticket ${ticket.priority.toLowerCase()}`}>
              <div className="ops-ticket-top"><span>{ticket.id}</span><span className={`status-pill ${statusClass(ticket.status)}`}>{ticket.status}</span></div>
              <h2>{ticket.title}</h2>
              <p>{ticket.detail}</p>
              <div className="route-row"><span>{ticket.department}</span><span>{ticket.priority} priority</span><span>{effectiveMinutes}m open</span></div>
              {ticket.status === "New" && <div className="alert-strip"><BellIcon /> 15-min reminder #{Math.max(1, Math.floor(effectiveMinutes / 15))} active until accepted</div>}
              {stalled && <div className="alert-strip danger"><ExclamationTriangleIcon /> In progress over 4 hours. Comment required to clear alert.</div>}
              {ticket.comments.map((comment, index) => <blockquote key={index}>{comment}</blockquote>)}
              <div className="ops-actions">
                {ticket.status === "New" && <button onClick={() => updateTicket(ticket.id, "In progress")}>Accept</button>}
                <button className="secondary" onClick={() => updateTicket(ticket.id, "Resolved")}>Resolve</button>
              </div>
              <div className="ops-comment"><KeyboardInput value={selectedTicketId === ticket.id ? opsComment : ""} onFocus={() => setSelectedTicketId(ticket.id)} onChange={(event) => { setSelectedTicketId(ticket.id); setOpsComment(event.target.value); }} placeholder="Add internal update" /><button onClick={() => addOpsComment(ticket.id)}><PaperPlaneIcon /></button></div>
            </article>
          );
        })}
      </section>
    </main>
  );

  const sheetTitle = sheet === "review" ? "Your adjusted plan" : sheet === "new-request" ? "New request" : sheet === "ticket" ? selectedTicket?.title ?? "Request" : sheet === "feedback" ? "Share feedback" : sheet === "checkout" ? "Checkout & billing" : "";

  const renderSheetContent = () => {
    if (sheet === "review") return (
      <div className="sheet-stack">
        <div className="change-row"><CheckCircledIcon /><div><strong>Flight AI-624</strong><span>Delayed 42 minutes · tracked live</span></div></div>
        <div className="change-row"><CheckCircledIcon /><div><strong>Airport transfer</strong><span>Driver notified · pickup 19:30</span></div></div>
        <div className="change-row"><ClockIcon /><div><strong>Dinner at Terrace</strong><span>Moved to 20:00 · table held</span></div></div>
        <button className="primary-button" onClick={() => { setSheet(null); notify("Your updated plan is confirmed."); }}>Looks good <CheckCircledIcon /></button>
        <button className="secondary-button" onClick={() => { setSheet(null); changeView("concierge"); }}>Ask for a change</button>
      </div>
    );
    if (sheet === "new-request") return (
      <div className="sheet-stack">
        {!showSpecialRequests ? (
          <div className="request-option-grid">
            {requestOptions.map((option) => {
              const Icon = option.icon;
              return <button key={option.label} className={requestCategory === option.label ? "selected" : ""} onClick={() => { if (option.label === "Special requests") { setShowSpecialRequests(true); } else { setRequestCategory(option.label); setRequestDepartment(option.department); } }}><Icon /><span>{option.label}</span></button>;
            })}
          </div>
        ) : (
          <div className="special-list">
            <button className="back-link" onClick={() => setShowSpecialRequests(false)}>← Categories</button>
            {specialRequests.map((request) => <button key={request} className={requestCategory === request ? "selected" : ""} onClick={() => { setRequestCategory(request); setRequestDepartment("Concierge"); }}><AccessibilityIcon /><span>{request}</span>{requestCategory === request ? <CheckCircledIcon /> : <ChevronRightIcon />}</button>)}
          </div>
        )}
        {requestCategory && <div className="selected-request"><CheckCircledIcon /><span><small>Selected</small><strong>{requestCategory}</strong></span></div>}
        <label className="field"><span>Comments (optional)</span><KeyboardTextarea value={requestDetail} onChange={(event) => setRequestDetail(event.target.value)} placeholder="Timing, location or anything the team should know" rows={3} /></label>
        <button className="primary-button" disabled={!requestCategory} onClick={submitRequest}>Submit request <ChevronRightIcon /></button>
      </div>
    );
    if (sheet === "ticket" && selectedTicket) return (
      <div className="sheet-stack">
        <div className="ticket-detail-head"><span className={`status-pill ${statusClass(selectedTicket.status)}`}>{selectedTicket.status}</span><span>{selectedTicket.id}</span></div>
        <p className="ticket-detail-copy">{selectedTicket.detail}</p>
        <div className="ticket-timeline">
          <div className="done"><CheckCircledIcon /><span><strong>Request received</strong><small>Routed to {selectedTicket.department}</small></span></div>
          <div className={selectedTicket.status === "New" ? "current" : "done"}>{selectedTicket.status === "New" ? <ClockIcon /> : <CheckCircledIcon />}<span><strong>Team acknowledged</strong><small>{selectedTicket.status === "New" ? "Reminder active" : "In progress"}</small></span></div>
          <div className={selectedTicket.status === "Resolved" ? "done" : "future"}>{selectedTicket.status === "Resolved" ? <CheckCircledIcon /> : <ClockIcon />}<span><strong>Resolved</strong><small>{selectedTicket.status === "Resolved" ? "Complete" : "Waiting"}</small></span></div>
        </div>
        <button className="secondary-button" onClick={() => { setSheet("feedback"); }}>Rate this service</button>
      </div>
    );
    if (sheet === "feedback") return (
      <div className="sheet-stack">
        <label className="field"><span>What are you rating?</span><select value={feedbackType} onChange={(event) => setFeedbackType(event.target.value)}><option>Service request</option><option>Concierge</option><option>Room</option><option>Dining</option><option>Checkout</option><option>Other</option></select></label>
        <div className="rating-control" aria-label="Rating required">{[1, 2, 3, 4, 5].map((value) => <button key={value} className={rating >= value ? "selected" : ""} aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => setRating(value)}><StarIcon /></button>)}</div>
        <p className="rating-help">Choose a rating before submitting.</p>
        <label className="field"><span>Comments (optional)</span><KeyboardTextarea value={feedbackComment} onChange={(event) => setFeedbackComment(event.target.value)} placeholder="Tell us what stood out" rows={4} /></label>
        <button className="primary-button" disabled={!rating} onClick={submitFeedback}>Submit feedback</button>
      </div>
    );
    if (sheet === "checkout") return (
      <div className="sheet-stack">
        <div className="paid-banner"><CheckCircledIcon /><div><strong>Paid in full</strong><span>Final balance ₹0</span></div></div>
        <div className="bill-summary"><div><span>Room · 2 nights</span><strong>₹48,000</strong></div><div><span>Dining</span><strong>₹6,850</strong></div><div><span>Spa</span><strong>₹4,200</strong></div><div className="total"><span>Total paid</span><strong>₹59,050</strong></div></div>
        <p className="document-note">Both documents are ready. Choose which to view or download first.</p>
        <button className="primary-button" onClick={() => downloadStayPdf("Invoice")}><DownloadIcon /> Download invoice PDF</button>
        <button className="secondary-button" onClick={() => downloadStayPdf("Itemized Bill")}><ReaderIcon /> Download itemized bill PDF</button>
        <p className="privacy-note compact"><CheckCircledIcon /> Generated locally. No billing data is sent to another service.</p>
      </div>
    );
    return null;
  };

  if (view === "auth") return renderAuth();

  return (
    <div className="app-shell">
      <MobileScroll key={view} className={`app-screen ${view === "ops" ? "ops-scroll" : ""}`}>
        {view === "home" && renderHome()}
        {view === "concierge" && renderConcierge()}
        {view === "requests" && renderRequests()}
        {view === "profile" && renderProfile()}
        {view === "ops" && renderOps()}
      </MobileScroll>
      {view !== "ops" && <BottomNav view={view} onChange={changeView} />}
      <BottomSheet open={sheet !== null} onOpenChange={(open) => { if (!open) setSheet(null); }} title={sheetTitle} description={sheet === "new-request" ? "The right hotel team is notified immediately." : undefined}>
        {renderSheetContent()}
      </BottomSheet>
      {toast && <div className="toast" role="status"><CheckCircledIcon />{toast}</div>}
    </div>
  );
}
