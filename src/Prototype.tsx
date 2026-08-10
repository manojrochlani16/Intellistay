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
  ChevronLeftIcon,
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

type Hotel = {
  name: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  opsEmail: string;
};

type Guest = {
  name: string;
  hotel: string;
  reservation: string;
  arrival: string;
  room?: string;
  contact?: string;
};

type TicketStatus = "New" | "In progress" | "Resolved" | "Closed";
type Department = "Front Desk" | "Concierge" | "Maintenance" | "Housekeeping" | "Dining" | "Reservations";

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

type ServiceNode = {
  label: string;
  department: Department;
  detail?: string;
  priority?: "Standard" | "High";
  children?: ServiceNode[];
};

type Feedback = {
  id: string;
  type: string;
  rating: number;
  comment: string;
  destination: string;
};

type Notice = {
  id: number;
  title: string;
  body: string;
  read: boolean;
};

type View = "auth" | "home" | "concierge" | "requests" | "profile" | "ops";
type Sheet = "review" | "service" | "ticket" | "feedback" | "checkout" | "credits" | "notifications" | "hotel" | null;

const hotels: Hotel[] = [
  { name: "Aurora Grand", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001", opsEmail: "guestcare@auroragrand.demo" },
  { name: "Cove House", city: "Goa", state: "Goa", country: "India", pincode: "403001", opsEmail: "guestcare@covehouse.demo" },
  { name: "The Meridian", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560001", opsEmail: "experience@themeridian.demo" },
  { name: "Aravali House", city: "Udaipur", state: "Rajasthan", country: "India", pincode: "313001", opsEmail: "stay@aravalihouse.demo" },
  { name: "Monsoon Atelier", city: "Kochi", state: "Kerala", country: "India", pincode: "682001", opsEmail: "care@monsoonatelier.demo" },
  { name: "Saffron Courtyard", city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001", opsEmail: "guestcare@saffroncourtyard.demo" },
  { name: "The Cedar Reserve", city: "Shimla", state: "Himachal Pradesh", country: "India", pincode: "171001", opsEmail: "concierge@cedarreserve.demo" },
  { name: "Bayline Retreat", city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600001", opsEmail: "care@baylineretreat.demo" },
  { name: "The Imperial Grove", city: "Delhi", state: "Delhi", country: "India", pincode: "110001", opsEmail: "guestrelations@imperialgrove.demo" },
  { name: "Lotus Quay", city: "Kolkata", state: "West Bengal", country: "India", pincode: "700001", opsEmail: "stay@lotusquay.demo" },
  { name: "Deccan House", city: "Hyderabad", state: "Telangana", country: "India", pincode: "500001", opsEmail: "care@deccanhouse.demo" },
  { name: "Nila Heritage", city: "Puducherry", state: "Puducherry", country: "India", pincode: "605001", opsEmail: "guestcare@nilaheritage.demo" },
  { name: "Riverstone Lodge", city: "Rishikesh", state: "Uttarakhand", country: "India", pincode: "249201", opsEmail: "concierge@riverstonelodge.demo" },
  { name: "The Palm Annex", city: "Dubai", state: "Dubai", country: "UAE", pincode: "00000", opsEmail: "experience@palmannex.demo" },
  { name: "Harbour No. 8", city: "Singapore", state: "Singapore", country: "Singapore", pincode: "018956", opsEmail: "stay@harbour8.demo" },
];

const reservations: Record<string, Guest> = {
  "AG-7K92": { name: "Maya Kapoor", hotel: "Aurora Grand", reservation: "AG-7K92", arrival: "18:40", room: "1208", contact: "maya@example.com" },
  "CH-2048": { name: "Arjun Mehta", hotel: "Cove House", reservation: "CH-2048", arrival: "16:20", room: "408", contact: "+91 98765 43210" },
  "TM-8841": { name: "Rhea Shah", hotel: "The Meridian", reservation: "TM-8841", arrival: "20:10", room: "905", contact: "rhea@example.com" },
};

const wheelchairOptions: ServiceNode[] = [
  { label: "Wheelchair assistance", department: "Concierge", detail: "Arrange trained wheelchair assistance at the requested location.", priority: "High" },
  { label: "Wheelchair ramp", department: "Concierge", detail: "Confirm an accessible ramp and step-free route.", priority: "High" },
  { label: "Wheelchair required", department: "Concierge", detail: "Reserve a wheelchair for the guest.", priority: "High" },
  { label: "Wheelchair friendly space / room", department: "Front Desk", detail: "Verify or allocate an accessible room and common-area route.", priority: "High" },
];

const specialOptions: ServiceNode[] = [
  "Medical assistance",
  "Stretcher assistance",
  "Pregnant Traveler assistance",
  "Elderly Traveler assistance",
  "Service animal or Pet Support",
  "Language assistance",
  "Bassinet Support",
  "Extra Bedding",
].map((label) => ({ label, department: label === "Extra Bedding" ? "Housekeeping" : "Concierge", priority: label.includes("Medical") || label.includes("Stretcher") ? "High" : "Standard" }));

const serviceCatalog: ServiceNode[] = [
  { label: "Wheelchair", department: "Concierge", children: wheelchairOptions },
  { label: "Special Requests", department: "Concierge", children: specialOptions },
  {
    label: "Housekeeping & Maintenance",
    department: "Housekeeping",
    children: [
      {
        label: "AC",
        department: "Maintenance",
        children: ["Temperature issue", "Heat issue", "Humidity issue", "Leakage issue", "Other"].map((label) => ({ label, department: "Maintenance", detail: `AC: ${label}. Dispatch engineering and keep the guest updated.`, priority: label === "Leakage issue" ? "High" : "Standard" })),
      },
      {
        label: "Cleaning",
        department: "Housekeeping",
        children: ["Room", "Bathroom", "Bathtub"].map((label) => ({ label, department: "Housekeeping", detail: `${label} cleaning requested.` })),
      },
      ...["Towels / Napkins", "Bedspreads / Bedsheets", "Refrigerator", "Mini Bar", "Lights / Fans"].map((label) => ({ label, department: label === "Refrigerator" || label === "Lights / Fans" ? "Maintenance" as Department : "Housekeeping" as Department })),
    ],
  },
  {
    label: "Dining & Reservations",
    department: "Dining",
    children: [
      {
        label: "Restaurants",
        department: "Dining",
        children: [
          { label: "Book a table (up to 4)", department: "Dining", detail: "Reserve a restaurant table for up to four guests." },
          { label: "Table for more than 4", department: "Dining", detail: "Route a group-dining request to Restaurants / Banquets." },
        ],
      },
      { label: "Banquet Halls", department: "Dining", children: [{ label: "Book Hall", department: "Dining", detail: "Request banquet availability, capacity, and pricing." }] },
      { label: "Bars", department: "Dining", children: [{ label: "Reserve Table", department: "Dining", detail: "Reserve a table at the hotel bar." }] },
    ],
  },
  {
    label: "Airport Transfer",
    department: "Concierge",
    children: [
      { label: "Book cab to Hotel", department: "Concierge", detail: "Collect flight and pickup details, then arrange an airport-to-hotel cab." },
      { label: "Book cab to Airport", department: "Concierge", detail: "Confirm departure time and arrange a hotel-to-airport cab." },
    ],
  },
  {
    label: "Reservations",
    department: "Reservations",
    children: [
      { label: "Change / Update reservations", department: "Reservations" },
      { label: "Cancel reservations", department: "Reservations", priority: "High" },
      {
        label: "Membership & Loyalty",
        department: "Reservations",
        children: [
          { label: "Use Loyalty points to book room", department: "Reservations" },
          { label: "Report missing points", department: "Reservations" },
          { label: "Check membership number", department: "Reservations" },
          { label: "Membership benefits", department: "Reservations" },
        ],
      },
    ],
  },
  { label: "Checkout & Billing", department: "Front Desk", detail: "Open checkout, invoice, itemized bill, email, and PDF options." },
];

const initialTickets: Ticket[] = [
  { id: "IST-2408", title: "Wheelchair assistance", detail: "Meet at the main entrance at 18:35.", department: "Concierge", status: "In progress", priority: "High", minutesOpen: 286, hoursInProgress: 4.6, comments: [] },
  { id: "IST-2407", title: "AC · Temperature issue", detail: "Engineering dispatch requested for room 1208.", department: "Maintenance", status: "New", priority: "High", minutesOpen: 18, comments: [] },
  { id: "IST-2406", title: "Late checkout", detail: "Checkout extended to 14:00.", department: "Front Desk", status: "Resolved", priority: "Standard", minutesOpen: 32, comments: ["Approved by front desk."] },
];

const reportPeriods = ["Daily", "Weekly", "Monthly", "Quarterly"] as const;
type ReportPeriod = typeof reportPeriods[number];

function statusClass(status: TicketStatus) {
  return status.toLowerCase().replace(" ", "-");
}

function estimateCredits(text: string) {
  return Math.max(4, Math.ceil(text.length / 4) * 2);
}

function findRoot(label: string) {
  return serviceCatalog.find((node) => node.label === label);
}

function AppMark({ compact = false }: { compact?: boolean }) {
  return <div className={`app-mark ${compact ? "compact" : ""}`} aria-label="Intellistay"><span className="brand-symbol"><LightningBoltIcon /></span><span>Intellistay</span></div>;
}

function Field({ label, ...props }: React.ComponentProps<typeof KeyboardInput> & { label: string }) {
  return <label className="field"><span>{label}</span><KeyboardInput {...props} /></label>;
}

function BottomNav({ view, onChange, unread }: { view: View; onChange: (view: View) => void; unread: boolean }) {
  const items: { id: View; label: string; icon: typeof HomeIcon }[] = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "concierge", label: "Concierge", icon: ChatBubbleIcon },
    { id: "requests", label: "Requests", icon: ClipboardIcon },
    { id: "profile", label: "Profile", icon: PersonIcon },
  ];
  return <nav className="bottom-nav" aria-label="Primary app navigation">{items.map((item) => {
    const Icon = item.icon;
    return <button key={item.id} className={view === item.id ? "active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => onChange(item.id)} data-testid={`nav-${item.id}`}><span className="nav-icon-wrap"><Icon />{unread && item.id === "concierge" && <i className="notification-dot" />}</span><span>{item.label}</span></button>;
  })}</nav>;
}

function TicketRow({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) {
  return <button className="ticket-row" onClick={onOpen}><span className={`ticket-status-dot ${statusClass(ticket.status)}`} /><span className="ticket-copy"><strong>{ticket.title}</strong><small>{ticket.id} · {ticket.department}</small></span><span className={`status-pill ${statusClass(ticket.status)}`}>{ticket.status}</span><ChevronRightIcon /></button>;
}

export default function Prototype() {
  const keyboard = useKeyboard();
  const [view, setView] = useState<View>(() => {
    const requested = new URLSearchParams(window.location.search).get("screen");
    return (["home", "concierge", "requests", "profile", "ops"] as View[]).includes(requested as View) ? requested as View : "auth";
  });
  const [authMode, setAuthMode] = useState<"reservation" | "guest">("reservation");
  const [reservationCode, setReservationCode] = useState("AG-7K92");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [hotelSearch, setHotelSearch] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [authError, setAuthError] = useState("");
  const [guest, setGuest] = useState<Guest>(reservations["AG-7K92"]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState("IST-2407");
  const [servicePath, setServicePath] = useState<ServiceNode[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceNode | null>(null);
  const [requestDetail, setRequestDetail] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("Service request");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [toast, setToast] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{ from: "ai", text: "I’m tracking your arrival. Your transfer and dinner are aligned with the updated flight time. Ask me to book, change, dispatch, or explain anything about your stay." }]);
  const [chatBusy, setChatBusy] = useState(false);
  const [credits, setCredits] = useState(1200);
  const [creditUsage, setCreditUsage] = useState<{ label: string; amount: number }[]>([{ label: "Arrival planning", amount: 84 }]);
  const [opsComment, setOpsComment] = useState("");
  const [simulatedMinutes, setSimulatedMinutes] = useState(0);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("Daily");
  const [billView, setBillView] = useState<"Invoice" | "Itemized Bill">("Invoice");
  const [receiptEmail, setReceiptEmail] = useState(guest.contact?.includes("@") ? guest.contact : "");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [interests, setInterests] = useState<string[]>(["Airport Transfer"]);
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, title: "Transfer adjusted", body: "Your driver now expects you at 19:30.", read: false },
    { id: 2, title: "Rain tomorrow", body: "An indoor spa cabana is available from 11:00.", read: false },
  ]);

  const firstName = guest.name.split(" ")[0] || "Guest";
  const currentHotel = hotels.find((hotel) => hotel.name === guest.hotel) ?? hotels[0];
  const unreadNotices = notices.some((notice) => !notice.read);
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0];
  const currentServiceNodes = servicePath.length ? servicePath[servicePath.length - 1].children ?? [] : serviceCatalog;
  const hotelMatches = useMemo(() => {
    const query = hotelSearch.trim().toLowerCase();
    return hotels.filter((hotel) => !query || `${hotel.name} ${hotel.city} ${hotel.state} ${hotel.country} ${hotel.pincode}`.toLowerCase().includes(query)).slice(0, 6);
  }, [hotelSearch]);

  const proactiveCopy = useMemo(() => {
    const latest = interests[interests.length - 1] ?? "Airport Transfer";
    if (latest.includes("Dining") || latest.includes("Restaurants") || latest.includes("Bars")) return { title: "Planning dinner?", body: "Terrace has a quiet 20:00 table that fits your updated arrival.", action: "Browse dining", root: "Dining & Reservations" };
    if (latest.includes("Housekeeping") || latest.includes("AC") || latest.includes("Cleaning")) return { title: "Room comfort check", body: "Would you like Housekeeping to prepare the room before you arrive?", action: "Set room preferences", root: "Housekeeping & Maintenance" };
    if (latest.includes("Wheelchair") || latest.includes("Special")) return { title: "Arrival accessibility", body: "I can coordinate a step-free route from car to room and notify the lobby team.", action: "Review assistance", root: "Wheelchair" };
    if (latest.includes("Reservations") || latest.includes("Loyalty")) return { title: "Member benefit found", body: "Your stay may qualify for late checkout and a points review.", action: "View benefits", root: "Reservations" };
    return { title: "Arrival is in motion", body: "Your flight delay, transfer, and dinner timing are already synchronized.", action: "Review plan", root: "Airport Transfer" };
  }, [interests]);

  useEffect(() => {
    keyboard.hide();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const scroller = document.querySelector<HTMLElement>('[data-testid="mobile-scroll"]');
    if (scroller) scroller.scrollTop = 0;
  }, [view]);

  const dismissKeyboard = () => {
    keyboard.hide();
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

  const addNotice = (title: string, body: string) => {
    setNotices((current) => [{ id: Date.now(), title, body, read: false }, ...current]);
    if (pushEnabled && "Notification" in window && Notification.permission === "granted") new Notification(title, { body });
  };

  const login = () => {
    dismissKeyboard();
    setAuthError("");
    if (authMode === "reservation") {
      const match = reservations[reservationCode.trim().toUpperCase()];
      if (!match) return setAuthError("Reservation not found. Try AG-7K92 for the demo.");
      setGuest(match);
      setReceiptEmail(match.contact?.includes("@") ? match.contact : "");
      setView("home");
      notify(`Welcome back, ${match.name.split(" ")[0]}.`);
      return;
    }
    if (!guestName.trim() || (!guestEmail.trim() && !guestPhone.trim())) return setAuthError("Add your name and either a phone number or email address.");
    if (!selectedHotel) return setAuthError("Choose a participating Intellistay hotel.");
    const newGuest = { name: guestName.trim(), hotel: selectedHotel.name, reservation: "GUEST-2026", arrival: "Today", contact: guestEmail.trim() || guestPhone.trim() };
    setGuest(newGuest);
    setReceiptEmail(guestEmail.trim());
    setView("home");
    notify("Guest access created. No password required for this demo.");
  };

  const openService = (rootLabel?: string) => {
    dismissKeyboard();
    setSelectedService(null);
    setRequestDetail("");
    const root = rootLabel ? findRoot(rootLabel) : undefined;
    setServicePath(root ? [root] : []);
    if (rootLabel) setInterests((current) => [...current.filter((item) => item !== rootLabel), rootLabel]);
    setSheet("service");
  };

  const chooseService = (node: ServiceNode) => {
    setInterests((current) => [...current.filter((item) => item !== node.label), node.label]);
    addNotice("Personalized stay suggestion", `I’ll tailor upcoming recommendations around ${node.label.toLowerCase()}.`);
    if (node.label === "Checkout & Billing") {
      setSheet("checkout");
      return;
    }
    if (node.children?.length) {
      setServicePath((current) => [...current, node]);
      setSelectedService(null);
      return;
    }
    setSelectedService(node);
  };

  const raiseTicket = (title: string, department: Department, detail: string, priority: "Standard" | "High" = "Standard") => {
    const id = `IST-${2410 + tickets.length}`;
    const ticket: Ticket = { id, title, detail, department, status: "New", priority, minutesOpen: 0, comments: [] };
    setTickets((current) => [ticket, ...current]);
    setSelectedTicketId(id);
    addNotice("Request received", `${id} is with ${department}. We’ll keep you updated here.`);
    notify(`${id} routed to ${department}.`);
    return id;
  };

  const submitService = () => {
    if (!selectedService) return;
    dismissKeyboard();
    const id = raiseTicket(selectedService.label, selectedService.department, requestDetail.trim() || selectedService.detail || `${selectedService.label} requested by guest.`, selectedService.priority);
    setSheet(null);
    setSelectedService(null);
    setServicePath([]);
    setRequestDetail("");
    setView("requests");
    if (emailUpdates && receiptEmail) notify(`${id} confirmation also queued to ${receiptEmail}.`);
  };

  const localOrchestration = (prompt: string) => {
    const lower = prompt.toLowerCase();
    if (/ac|air conditioning|temperature|humidity|leak/.test(lower)) {
      const issue = lower.includes("leak") ? "Leakage issue" : lower.includes("humid") ? "Humidity issue" : lower.includes("heat") ? "Heat issue" : "Temperature issue";
      const id = raiseTicket(`AC · ${issue}`, "Maintenance", `AI classified the room issue as ${issue.toLowerCase()} and routed Engineering to room ${guest.room ?? "the guest room"}.`, issue === "Leakage issue" ? "High" : "Standard");
      return `I classified this as “${issue}” and opened ${id} with Engineering. I’ll alert you when the technician accepts it. Would you like the team to call before entering?`;
    }
    if (/clean|bathroom|bathtub|towel|sheet|bedding|minibar|mini bar/.test(lower)) {
      const title = lower.includes("towel") ? "Towels / Napkins" : lower.includes("bath") ? "Bathroom cleaning" : lower.includes("sheet") || lower.includes("bedding") ? "Bedspreads / Bedsheets" : lower.includes("mini") ? "Mini Bar" : "Room cleaning";
      const id = raiseTicket(title, "Housekeeping", `Housekeeping request inferred from chat: ${prompt}`);
      return `${title} is arranged under ${id}. Based on your arrival at ${guest.arrival}, I suggested completion before you reach the room.`;
    }
    if (/wheelchair|ramp|accessible/.test(lower)) {
      const id = raiseTicket("Wheelchair assistance", "Concierge", "Coordinate wheelchair assistance and a step-free route from arrival point to room.", "High");
      return `I opened ${id} for wheelchair assistance and a step-free arrival route. The concierge will confirm the meeting point in My Requests.`;
    }
    if (/medical|stretcher|pregnan|elderly|service animal|pet|bassinet|language/.test(lower)) {
      const match = specialOptions.find((item) => lower.includes(item.label.split(" ")[0].toLowerCase())) ?? specialOptions[0];
      const id = raiseTicket(match.label, match.department, `Special assistance requested through AI chat: ${prompt}`, match.priority);
      return `${match.label} is now with ${match.department} under ${id}. I’ll keep sensitive details out of lock-screen notifications.`;
    }
    if (/restaurant|dinner|table|bar|banquet|hall/.test(lower)) {
      const group = /more than 4|five|six|seven|eight|group/.test(lower);
      const title = group ? "Group dining / Banquet enquiry" : "Restaurant table reservation";
      const id = raiseTicket(title, "Dining", group ? "Route to Restaurants / Banquets for capacity and pricing." : "Request a table aligned with the guest itinerary.");
      return `${title} is being handled under ${id}. I used your updated arrival time to suggest 20:00; tell me the party size if you want me to refine it.`;
    }
    if (/cab|airport|transfer|flight|pickup/.test(lower)) {
      const toAirport = /to airport|departure|drop/.test(lower);
      const id = raiseTicket(toAirport ? "Book cab to Airport" : "Book cab to Hotel", "Concierge", `${toAirport ? "Hotel-to-airport" : "Airport-to-hotel"} transfer requested through AI chat.`);
      return `Transfer request ${id} is live. I’ll coordinate the pickup against your itinerary and surface any timing conflict before dispatch.`;
    }
    if (/cancel reservation|change reservation|loyalty|points|membership/.test(lower)) {
      const title = lower.includes("cancel") ? "Cancel reservations" : lower.includes("point") ? "Membership & Loyalty · Points" : "Change / Update reservations";
      const id = raiseTicket(title, "Reservations", `Reservations request inferred from chat: ${prompt}`, lower.includes("cancel") ? "High" : "Standard");
      return `${title} is assigned to Reservations under ${id}. No irreversible change will be completed without your confirmation.`;
    }
    if (/checkout|invoice|itemized|bill|receipt|email/.test(lower)) {
      setBillView(lower.includes("item") ? "Itemized Bill" : "Invoice");
      setSheet("checkout");
      return "Your folio is paid in full. I opened the secure billing view so you can inspect the invoice or itemized bill before emailing or downloading it.";
    }
    if (/rain|weather|spa|cabana/.test(lower)) return "Rain is expected tomorrow. Since you viewed indoor options, I can hold the 11:00 spa cabana for 10 minutes or show dining alternatives inside the property.";
    const latest = interests[interests.length - 1];
    return `I understood your request in the context of ${latest.toLowerCase()} at ${guest.hotel}. I can turn it into a tracked hotel request, but I need one detail first: what time should the team complete it?`;
  };

  const sendMessage = async () => {
    const prompt = chatInput.trim();
    if (!prompt || chatBusy) return;
    dismissKeyboard();
    setChatInput("");
    setChatBusy(true);
    setMessages((current) => [...current, { from: "guest", text: prompt }]);
    let response = "";
    const endpoint = import.meta.env.VITE_CONCIERGE_API_URL;
    if (endpoint) {
      try {
        const result = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: prompt, guest, tickets, interests, conversation: messages.slice(-6), availableServices: serviceCatalog.map((item) => item.label) }) });
        if (result.ok) {
          const data = await result.json();
          if (typeof data.reply === "string") response = data.reply;
        }
      } catch {
        response = "";
      }
    }
    if (!response) response = localOrchestration(prompt);
    const used = estimateCredits(prompt + response);
    setCredits((current) => Math.max(0, current - used));
    setCreditUsage((current) => [{ label: prompt.slice(0, 28), amount: used }, ...current].slice(0, 6));
    window.setTimeout(() => {
      setMessages((current) => [...current, { from: "ai", text: response }]);
      setChatBusy(false);
    }, 360);
  };

  const requestPushPermission = async () => {
    if (!("Notification" in window)) {
      setPushEnabled(true);
      return notify("In-app proactive alerts enabled for this prototype.");
    }
    const permission = await Notification.requestPermission();
    setPushEnabled(permission === "granted");
    notify(permission === "granted" ? "Push notifications enabled." : "Push stayed off; in-app alerts remain available.");
  };

  const updateTicket = (id: string, status: TicketStatus) => {
    const current = tickets.find((ticket) => ticket.id === id);
    if (current?.hoursInProgress && current.hoursInProgress >= 4 && status === "Resolved" && !current.comments.length) return notify("Add an internal update before resolving this 4-hour alert.");
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

  const exportReport = (period: ReportPeriod) => {
    const rows = ["Ticket,Service,Department,Status,Priority,Minutes Open", ...tickets.map((ticket) => [ticket.id, `"${ticket.title}"`, ticket.department, ticket.status, ticket.priority, ticket.minutesOpen + simulatedMinutes].join(",")), "", "Feedback,Rating,Type,Destination", ...feedback.map((item) => [item.id, item.rating, `"${item.type}"`, item.destination].join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Intellistay-${period}-MIS.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify(`${period} MIS exported.`);
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
    doc.text("Room · 2 nights", 20, 96); doc.text("INR 48,000", 170, 96, { align: "right" });
    if (kind === "Itemized Bill") { doc.text("Dining · Terrace dinner", 20, 108); doc.text("INR 6,850", 170, 108, { align: "right" }); doc.text("Spa · Indoor cabana", 20, 120); doc.text("INR 4,200", 170, 120, { align: "right" }); }
    doc.line(20, 132, 170, 132); doc.setFont("helvetica", "bold"); doc.text("Paid in full", 20, 144); doc.text("INR 59,050", 170, 144, { align: "right" });
    doc.save(`Intellistay-${kind.replace(" ", "-")}-${guest.reservation}.pdf`);
    notify(`${kind} downloaded.`);
  };

  const emailReceipt = () => {
    if (!receiptEmail.trim() || !receiptEmail.includes("@")) return notify("Enter a valid email address first.");
    notify(`${billView} sent to ${receiptEmail.trim()}.`);
  };

  const submitFeedback = () => {
    if (!rating) return notify("Choose a rating before submitting.");
    const item = { id: `FB-${110 + feedback.length}`, type: feedbackType, rating, comment: feedbackComment.trim(), destination: currentHotel.opsEmail };
    setFeedback((current) => [item, ...current]);
    setSheet(null); setRating(0); setFeedbackComment("");
    notify(`Feedback delivered to ${currentHotel.opsEmail}.`);
  };

  const chooseHotel = (hotel: Hotel) => {
    setGuest((current) => ({ ...current, hotel: hotel.name }));
    setSelectedHotel(hotel); setHotelSearch(""); setSheet(null);
    addNotice("Hotel changed", `${hotel.name} is now configuring your available services.`);
    notify(`${hotel.name} selected.`);
  };

  const renderHotelSearch = (showChoose = true) => <>
    <label className="search-field"><span>Participating Intellistay hotels only</span><div><MagnifyingGlassIcon /><KeyboardInput value={hotelSearch} onChange={(event) => setHotelSearch(event.target.value)} placeholder="Hotel, city, state, country or pincode" /></div></label>
    <div className="hotel-results" role="listbox" aria-label="Participating hotels">{hotelMatches.map((hotel) => {
      const isSelected = showChoose ? guest.hotel === hotel.name : selectedHotel?.name === hotel.name;
      return <button key={hotel.name} className={isSelected ? "selected" : ""} onClick={() => showChoose ? chooseHotel(hotel) : setSelectedHotel(hotel)}><span><strong>{hotel.name}</strong><small>{hotel.city}, {hotel.country} · {hotel.pincode}</small></span>{isSelected ? <CheckCircledIcon /> : <ChevronRightIcon />}</button>;
    })}</div>
  </>;

  const renderAuth = () => <MobileScroll className="app-screen auth-scroll"><main className="auth-screen" data-testid="auth-screen">
    <AppMark />
    <div className="auth-hero"><span className="eyebrow">Your stay, already in motion</span><h1>Welcome to a more thoughtful stay.</h1><p>Use a reservation, or continue as a guest with your name and one contact method.</p></div>
    <div className="segment-control" role="tablist" aria-label="Access method"><button role="tab" aria-selected={authMode === "reservation"} className={authMode === "reservation" ? "active" : ""} onClick={() => setAuthMode("reservation")}>Reservation</button><button role="tab" aria-selected={authMode === "guest"} className={authMode === "guest" ? "active" : ""} onClick={() => setAuthMode("guest")} data-testid="guest-access-tab">Guest access</button></div>
    {authMode === "reservation" ? <section className="access-form"><Field label="Reservation number" value={reservationCode} onChange={(event) => setReservationCode(event.target.value)} autoCapitalize="characters" data-testid="reservation-input" /><p className="field-help"><IdCardIcon /> Demo reservation: <button onClick={() => setReservationCode("AG-7K92")}>AG-7K92</button></p><div className="matched-stay"><span className="hotel-monogram">AG</span><span><strong>Aurora Grand</strong><small>Mumbai · Arrival 18:40</small></span><CheckCircledIcon /></div></section> : <section className="access-form"><Field label="Full name" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Your name" /><div className="two-fields"><Field label="Phone" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} placeholder="Optional" inputMode="tel" /><Field label="Email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Optional" inputMode="email" /></div>{renderHotelSearch(false)}</section>}
    {authError && <p className="form-error"><ExclamationTriangleIcon /> {authError}</p>}
    <button className="primary-button" onClick={login} data-testid="continue-button">Continue securely <ChevronRightIcon /></button>
    <p className="privacy-note">Demo data stays in memory and resets on reload. Intellistay does not read files, contacts, photos, or device history.</p>
  </main></MobileScroll>;

  const renderHome = () => <main className="screen-content home-screen" data-testid="home-screen">
    <header className="screen-header home-header"><AppMark compact /><div className="header-actions"><button className="icon-button notice-button" aria-label="Notifications" onClick={() => { setNotices((all) => all.map((item) => ({ ...item, read: true }))); setSheet("notifications"); }}><BellIcon />{unreadNotices && <i className="notification-dot" />}</button><button className="icon-button" aria-label="Profile" onClick={() => changeView("profile")}><PersonIcon /></button></div></header>
    <section className="greeting"><p>Good evening,</p><h1>{firstName}.</h1><button className="stay-line stay-switch" onClick={() => setSheet("hotel")}><SewingPinIcon /><strong>{guest.hotel}</strong><span />Change hotel <ChevronRightIcon /></button></section>
    <section className="proactive-card"><div className="proactive-label"><span><LightningBoltIcon /></span> Proactive for you</div><h2>{proactiveCopy.title}</h2><p className="proactive-body">{proactiveCopy.body}</p><div className="progress-list"><div className="done"><CheckCircledIcon /><span><strong>Flight delay detected</strong><small>AI-624 · 42 minutes</small></span></div><div className="done"><CheckCircledIcon /><span><strong>Transfer updated</strong><small>New pickup 19:30</small></span></div><div className="current"><ClockIcon /><span><strong>Dinner protected</strong><small>20:00 at Terrace</small></span></div></div><button className="sand-button" onClick={() => proactiveCopy.root === "Airport Transfer" ? setSheet("review") : openService(proactiveCopy.root)}>{proactiveCopy.action} <ChevronRightIcon /></button><button className="outline-button light" onClick={() => changeView("concierge")}><ChatBubbleIcon /> Ask Intellistay</button></section>
    <button className="reservation-row" onClick={() => setSheet("checkout")}><span className="reservation-icon"><ReaderIcon /></span><span><small>Checkout & billing</small><strong>View invoice or itemized bill</strong></span><ChevronRightIcon /></button>
    <section className="home-suggestion"><span><BellIcon /></span><div><small>Suggested from your interests</small><strong>Rain expected · indoor spa cabana available</strong></div><button onClick={() => { setSelectedService({ label: "Indoor spa cabana", department: "Concierge" }); setServicePath([]); setSheet("service"); }}>Reserve</button></section>
  </main>;

  const renderConcierge = () => <main className="screen-content concierge-screen" data-testid="concierge-screen">
    <header className="screen-header"><div><span className="eyebrow">AI concierge</span><h1>How can I help?</h1></div><button className="credit-pill" onClick={() => setSheet("credits")} aria-label={`${credits} credits, view details`}><LightningBoltIcon /> {credits} <ChevronRightIcon /></button></header>
    <section className="interest-prompt"><span className="pulse-dot" /><div><small>Proactive suggestion</small><strong>{proactiveCopy.body}</strong></div><button onClick={() => openService(proactiveCopy.root)}>View</button></section>
    <div className="quick-actions service-shortcuts" aria-label="Concierge services">
      <button onClick={() => openService("Wheelchair")}><AccessibilityIcon />Wheelchair</button>
      <button onClick={() => openService("Special Requests")}><StarIcon />Special requests</button>
      <button onClick={() => openService("Housekeeping & Maintenance")}><GearIcon />Room issue</button>
      <button onClick={() => openService("Dining & Reservations")}><CalendarIcon />Dining</button>
      <button onClick={() => openService("Airport Transfer")}><RocketIcon />Airport</button>
      <button onClick={() => openService("Reservations")}><ReaderIcon />Reservations</button>
    </div>
    <section className="chat-thread" aria-live="polite">{messages.map((message, index) => <div key={`${message.from}-${index}`} className={`message ${message.from}`}>{message.from === "ai" && <span className="ai-avatar"><LightningBoltIcon /></span>}<p>{message.text}</p></div>)}{chatBusy && <div className="message ai"><span className="ai-avatar"><LightningBoltIcon /></span><p>Checking your stay context and hotel workflow…</p></div>}</section>
    <div className="chat-composer"><KeyboardInput value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }} placeholder="Ask me to book, change or resolve" aria-label="Ask Intellistay anything" /><button onClick={() => void sendMessage()} aria-label="Send message" disabled={chatBusy}><PaperPlaneIcon /></button></div>
    <p className="ai-note">Context-aware hotel workflows · 2 credits per estimated token</p>
  </main>;

  const renderRequests = () => <main className="screen-content requests-screen" data-testid="requests-screen">
    <header className="screen-header"><div><span className="eyebrow">My stay</span><h1>Requests</h1></div><button className="new-request-button" onClick={() => openService()}><PlusIcon /> New</button></header>
    <section className="request-summary"><span><strong>{tickets.filter((ticket) => ticket.status === "New" || ticket.status === "In progress").length}</strong> active</span><span><strong>{tickets.filter((ticket) => ticket.status === "Resolved" || ticket.status === "Closed").length}</strong> completed</span><span><strong>7m</strong> avg reply</span></section>
    <section className="ticket-list" aria-label="Guest requests">{tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} onOpen={() => { setSelectedTicketId(ticket.id); setSheet("ticket"); }} />)}</section>
    <div className="empty-action"><HeartIcon /><div><strong>How was the service?</strong><span>Your feedback goes to {currentHotel.opsEmail}.</span></div><button onClick={() => setSheet("feedback")}>Feedback</button></div>
  </main>;

  const renderProfile = () => <main className="screen-content profile-screen" data-testid="profile-screen">
    <header className="profile-hero"><span className="profile-avatar">{guest.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><h1>{guest.name}</h1><p>{guest.hotel} · #{guest.reservation}</p></header>
    <section className="profile-section"><span className="section-label">Stay & account</span><button onClick={() => setSheet("hotel")}><MagnifyingGlassIcon /><span><strong>Change participating hotel</strong><small>Search by hotel, city, region or pincode</small></span><ChevronRightIcon /></button><button onClick={() => setSheet("checkout")}><FileTextIcon /><span><strong>Checkout & billing</strong><small>View, email or download both documents</small></span><ChevronRightIcon /></button><button onClick={() => setSheet("notifications")}><BellIcon /><span><strong>Proactive notifications</strong><small>Push {pushEnabled ? "on" : "off"} · email {emailUpdates ? "on" : "off"}</small></span><ChevronRightIcon /></button><button onClick={() => setSheet("feedback")}><HeartIcon /><span><strong>Share feedback</strong><small>Delivered to participating hotel operations</small></span><ChevronRightIcon /></button><button onClick={() => changeView("ops")} data-testid="open-ops"><DashboardIcon /><span><strong>Hotel operations console</strong><small>Track, action, close and export MIS</small></span><ChevronRightIcon /></button></section>
    <section className="privacy-card"><CheckCircledIcon /><div><strong>Private demo mode</strong><p>No contacts, files, photos, location history, or device identifiers are read. Data resets on reload.</p></div></section>
    <button className="text-button" onClick={() => { setView("auth"); dismissKeyboard(); }}>Sign out of demo</button>
  </main>;

  const renderOps = () => <main className="screen-content ops-screen" data-testid="ops-screen">
    <header className="ops-header"><button className="icon-button light-bg" aria-label="Close operations" onClick={() => changeView("profile")}><Cross2Icon /></button><div><span className="eyebrow">{guest.hotel}</span><h1>Operations</h1></div><button className="time-sim" onClick={() => setSimulatedMinutes((value) => value + 15)}>+15 min</button></header>
    <section className="ops-metrics"><span><strong>{tickets.filter((ticket) => ticket.status === "New").length}</strong> New</span><span><strong>{tickets.filter((ticket) => ticket.status === "In progress").length}</strong> Active</span><span><strong>{tickets.filter((ticket) => ticket.priority === "High" && ticket.status !== "Closed").length}</strong> High</span><span><strong>{feedback.length}</strong> Feedback</span></section>
    <div className="ops-live"><span className="live-dot" /> Department routing live · 15-minute escalations enabled</div>
    <section className="report-card"><div><small>Management information system</small><strong>{reportPeriod} MIS · {tickets.length} tickets</strong></div><div className="report-periods">{reportPeriods.map((period) => <button key={period} className={reportPeriod === period ? "active" : ""} onClick={() => setReportPeriod(period)}>{period}</button>)}</div><button className="export-button" onClick={() => exportReport(reportPeriod)}><DownloadIcon /> Export {reportPeriod.toLowerCase()} report</button></section>
    {feedback.length > 0 && <section className="ops-feedback"><span className="section-label">Guest feedback</span>{feedback.map((item) => <article key={item.id}><strong>{item.rating}/5 · {item.type}</strong><p>{item.comment || "No comment provided."}</p><small>Delivered to {item.destination}</small></article>)}</section>}
    <section className="ops-ticket-list">{tickets.filter((ticket) => ticket.status !== "Closed").map((ticket) => {
      const effectiveMinutes = ticket.minutesOpen + simulatedMinutes;
      const stalled = ticket.status === "In progress" && (ticket.hoursInProgress ?? 0) >= 4 && !ticket.comments.length;
      return <article key={ticket.id} className={`ops-ticket ${ticket.priority.toLowerCase()}`}><div className="ops-ticket-top"><span>{ticket.id}</span><span className={`status-pill ${statusClass(ticket.status)}`}>{ticket.status}</span></div><h2>{ticket.title}</h2><p>{ticket.detail}</p><div className="route-row"><span>{ticket.department}</span><span>{ticket.priority}</span><span>{effectiveMinutes}m open</span></div>{ticket.status === "New" && <div className="alert-strip"><BellIcon /> Reminder #{Math.max(1, Math.floor(effectiveMinutes / 15))} active until accepted</div>}{stalled && <div className="alert-strip danger"><ExclamationTriangleIcon /> In progress over 4 hours. Comment required.</div>}{ticket.comments.map((comment, index) => <blockquote key={index}>{comment}</blockquote>)}<div className="ops-actions">{ticket.status === "New" && <button onClick={() => updateTicket(ticket.id, "In progress")}>Accept</button>}{ticket.status === "In progress" && <button onClick={() => updateTicket(ticket.id, "Resolved")}>Resolve</button>}{ticket.status === "Resolved" && <button onClick={() => updateTicket(ticket.id, "Closed")}>Close</button>}</div><div className="ops-comment"><KeyboardInput value={selectedTicketId === ticket.id ? opsComment : ""} onFocus={() => setSelectedTicketId(ticket.id)} onChange={(event) => { setSelectedTicketId(ticket.id); setOpsComment(event.target.value); }} placeholder="Add internal update" /><button onClick={() => addOpsComment(ticket.id)} aria-label="Save internal update"><PaperPlaneIcon /></button></div></article>;
    })}</section>
  </main>;

  const sheetTitle = sheet === "review" ? "Your adjusted plan" : sheet === "service" ? servicePath[servicePath.length - 1]?.label ?? "How can we help?" : sheet === "ticket" ? selectedTicket?.title ?? "Request" : sheet === "feedback" ? "Share feedback" : sheet === "checkout" ? "Checkout & billing" : sheet === "credits" ? "AI credits" : sheet === "notifications" ? "Proactive notifications" : sheet === "hotel" ? "Change hotel" : "";

  const renderSheetContent = () => {
    if (sheet === "review") return <div className="sheet-stack"><div className="change-row"><CheckCircledIcon /><div><strong>Flight AI-624</strong><span>Delayed 42 minutes · tracked live</span></div></div><div className="change-row"><CheckCircledIcon /><div><strong>Airport transfer</strong><span>Driver notified · pickup 19:30</span></div></div><div className="change-row"><ClockIcon /><div><strong>Dinner at Terrace</strong><span>Moved to 20:00 · table held</span></div></div><button className="primary-button" onClick={() => { setSheet(null); notify("Your updated plan is confirmed."); }}>Looks good <CheckCircledIcon /></button><button className="secondary-button" onClick={() => { setSheet(null); changeView("concierge"); }}>Ask for a change</button></div>;
    if (sheet === "service") return <div className="sheet-stack service-browser">{servicePath.length > 0 && !selectedService && <button className="back-link" onClick={() => setServicePath((current) => current.slice(0, -1))}><ChevronLeftIcon /> Back</button>}{!selectedService ? <div className="special-list">{currentServiceNodes.map((node) => <button key={node.label} onClick={() => chooseService(node)}><span className="service-icon">{node.department === "Maintenance" ? <GearIcon /> : node.department === "Dining" ? <CalendarIcon /> : node.label.includes("Wheelchair") ? <AccessibilityIcon /> : <StarIcon />}</span><span><strong>{node.label}</strong><small>{node.children?.length ? `${node.children.length} options` : `Routes to ${node.department}`}</small></span><ChevronRightIcon /></button>)}</div> : <><div className="selected-request"><CheckCircledIcon /><span><small>Selected · {selectedService.department}</small><strong>{selectedService.label}</strong></span></div><p className="selection-explainer">{selectedService.detail ?? `The ${selectedService.department} team will receive this request immediately.`}</p><label className="field"><span>Timing or comments (optional)</span><KeyboardTextarea value={requestDetail} onChange={(event) => setRequestDetail(event.target.value)} placeholder="Tell the team when and where" rows={3} /></label><button className="primary-button" onClick={submitService}>Submit tracked request <ChevronRightIcon /></button><button className="secondary-button" onClick={() => setSelectedService(null)}>Choose another option</button></>}<button className="cancel-button" onClick={() => { dismissKeyboard(); setSheet(null); setSelectedService(null); setServicePath([]); }}>Cancel</button></div>;
    if (sheet === "ticket" && selectedTicket) return <div className="sheet-stack"><div className="ticket-detail-head"><span className={`status-pill ${statusClass(selectedTicket.status)}`}>{selectedTicket.status}</span><span>{selectedTicket.id}</span></div><p className="ticket-detail-copy">{selectedTicket.detail}</p><div className="ticket-timeline"><div className="done"><CheckCircledIcon /><span><strong>Request received</strong><small>Routed to {selectedTicket.department}</small></span></div><div className={selectedTicket.status === "New" ? "current" : "done"}>{selectedTicket.status === "New" ? <ClockIcon /> : <CheckCircledIcon />}<span><strong>Team acknowledged</strong><small>{selectedTicket.status === "New" ? "Reminder active" : "In progress"}</small></span></div><div className={selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? "done" : "future"}><CheckCircledIcon /><span><strong>Resolved</strong><small>{selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? "Complete" : "Waiting"}</small></span></div></div><button className="secondary-button" onClick={() => setSheet("feedback")}>Rate this service</button></div>;
    if (sheet === "feedback") return <div className="sheet-stack"><div className="delivery-note"><EnvelopeClosedIcon /><span>Feedback is delivered to <strong>{currentHotel.opsEmail}</strong> and appears in Operations.</span></div><label className="field"><span>What are you rating?</span><select value={feedbackType} onChange={(event) => setFeedbackType(event.target.value)}><option>Service request</option><option>Concierge</option><option>Room</option><option>Dining</option><option>Checkout</option><option>Other</option></select></label><div className="rating-control" aria-label="Rating required">{[1, 2, 3, 4, 5].map((value) => <button key={value} className={rating >= value ? "selected" : ""} aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => setRating(value)}><StarIcon /></button>)}</div><p className="rating-help">Rating is required; comments are optional.</p><label className="field"><span>Comments (optional)</span><KeyboardTextarea value={feedbackComment} onChange={(event) => setFeedbackComment(event.target.value)} placeholder="Tell the hotel what stood out" rows={4} /></label><button className="primary-button" disabled={!rating} onClick={submitFeedback}>Submit feedback</button></div>;
    if (sheet === "checkout") return <div className="sheet-stack"><div className="paid-banner"><CheckCircledIcon /><div><strong>Paid in full</strong><span>Final balance ₹0</span></div></div><div className="segment-control bill-tabs" role="tablist" aria-label="Billing document"><button role="tab" aria-selected={billView === "Invoice"} className={billView === "Invoice" ? "active" : ""} onClick={() => setBillView("Invoice")}>View invoice</button><button role="tab" aria-selected={billView === "Itemized Bill"} className={billView === "Itemized Bill" ? "active" : ""} onClick={() => setBillView("Itemized Bill")}>Itemized bill</button></div><div className="bill-summary"><div><span>Room · 2 nights</span><strong>₹48,000</strong></div>{billView === "Itemized Bill" && <><div><span>Dining · Terrace</span><strong>₹6,850</strong></div><div><span>Spa · Cabana</span><strong>₹4,200</strong></div></>}<div className="total"><span>Total paid</span><strong>₹59,050</strong></div></div><Field label="Email receipt" value={receiptEmail} onChange={(event) => setReceiptEmail(event.target.value)} placeholder="Enter email for guest access" inputMode="email" /><button className="primary-button" onClick={emailReceipt}><EnvelopeClosedIcon /> Email {billView.toLowerCase()}</button><button className="secondary-button" onClick={() => void downloadStayPdf(billView)}><DownloadIcon /> Download {billView.toLowerCase()} PDF</button><p className="privacy-note compact"><CheckCircledIcon /> Review first, then choose email or local PDF.</p></div>;
    if (sheet === "credits") return <div className="sheet-stack credits-sheet"><div className="credit-balance"><LightningBoltIcon /><div><small>Available balance</small><strong>{credits} credits</strong></div></div><p>Intellistay uses 2 credits for each estimated AI token. Hotel actions themselves do not use credits.</p><div className="usage-list">{creditUsage.map((item, index) => <div key={`${item.label}-${index}`}><span>{item.label}</span><strong>−{item.amount}</strong></div>)}</div><button className="primary-button" onClick={() => { setCredits((current) => current + 500); notify("500 demo credits added."); }}>Add 500 demo credits</button><button className="cancel-button" onClick={() => setSheet(null)}>Done</button></div>;
    if (sheet === "notifications") return <div className="sheet-stack"><div className="notification-setting"><div><strong>Push notifications</strong><span>Request updates and proactive stay suggestions</span></div><button className={pushEnabled ? "toggle on" : "toggle"} aria-pressed={pushEnabled} onClick={() => pushEnabled ? setPushEnabled(false) : void requestPushPermission()}><span /></button></div><div className="notification-setting"><div><strong>Email notifications</strong><span>Send the same confirmations to {receiptEmail || "your email"}</span></div><button className={emailUpdates ? "toggle on" : "toggle"} aria-pressed={emailUpdates} onClick={() => setEmailUpdates((value) => !value)}><span /></button></div><p className="notification-consent">Push is requested here, after its value is clear. Private or medical details never appear in notification previews.</p><div className="notice-list">{notices.map((notice) => <article key={notice.id}><span className="live-dot" /><div><strong>{notice.title}</strong><p>{notice.body}</p></div></article>)}</div><button className="cancel-button" onClick={() => setSheet(null)}>Done</button></div>;
    if (sheet === "hotel") return <div className="sheet-stack">{renderHotelSearch(true)}<p className="privacy-note compact">Only hotels contracted with Intellistay appear here. Selecting a hotel updates available services and hotel operations routing.</p><button className="cancel-button" onClick={() => { setHotelSearch(""); setSheet(null); }}>Cancel</button></div>;
    return null;
  };

  if (view === "auth") return renderAuth();

  return <div className="app-shell"><MobileScroll key={view} className={`app-screen ${view === "ops" ? "ops-scroll" : ""}`}>{view === "home" && renderHome()}{view === "concierge" && renderConcierge()}{view === "requests" && renderRequests()}{view === "profile" && renderProfile()}{view === "ops" && renderOps()}</MobileScroll>{view !== "ops" && <BottomNav view={view} onChange={changeView} unread={unreadNotices} />}<BottomSheet open={sheet !== null} onOpenChange={(open) => { if (!open) { setSheet(null); setSelectedService(null); setServicePath([]); } }} title={sheetTitle} description={sheet === "service" ? "Choose a service; Intellistay routes it to the right hotel team." : undefined}>{renderSheetContent()}</BottomSheet>{toast && <div className="toast" role="status"><CheckCircledIcon />{toast}</div>}</div>;
}
