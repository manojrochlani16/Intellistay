import { useEffect, useMemo, useRef, useState } from "react";
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

type TicketStatus = "New" | "In progress" | "Dead" | "Resolved" | "Closed" | "N/A / Invalid";
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
  guestName?: string;
  guestEmail?: string;
  status?: "New" | "Needs response" | "Responded" | "Closed";
  response?: string;
};

type Notice = {
  id: number;
  title: string;
  body: string;
  read: boolean;
};

type DemoSyncEvent =
  | { type: "ticket-created"; ticket: Ticket }
  | { type: "ticket-status"; id: string; status: TicketStatus }
  | { type: "feedback-created"; feedback: Feedback }
  | { type: "feedback-response"; feedbackId: string; response: string; recipient: string };

type View = "auth" | "home" | "concierge" | "requests" | "profile";
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
const demoChannelName = "intellistay-live-demo";

function statusClass(status: TicketStatus) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function estimateCredits(text: string) {
  return Math.max(4, Math.ceil(text.length / 4) * 2);
}

function findRoot(label: string) {
  return serviceCatalog.find((node) => node.label === label);
}

function AppMark({ compact = false }: { compact?: boolean }) {
  return <div className={`app-mark ${compact ? "compact" : ""}`} aria-label="Intellistay"><span className="brand-symbol" aria-hidden="true"><HomeIcon /></span><span>Intellistay</span></div>;
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
    return (["home", "concierge", "requests", "profile"] as View[]).includes(requested as View) ? requested as View : "auth";
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
  const [billView, setBillView] = useState<"Invoice" | "Itemized Bill">("Invoice");
  const [receiptEmail, setReceiptEmail] = useState(guest.contact?.includes("@") ? guest.contact : "");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [interests, setInterests] = useState<string[]>(["Airport Transfer"]);
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, title: "Transfer adjusted", body: "Your driver now expects you at 19:30.", read: false },
    { id: 2, title: "Rain tomorrow", body: "An indoor spa cabana is available from 11:00.", read: false },
  ]);
  const demoChannel = useRef<BroadcastChannel | null>(null);

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
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const deviceScreen = document.querySelector<HTMLElement>(".device-screen");
    if (deviceScreen) deviceScreen.scrollTop = 0;
    const scroller = document.querySelector<HTMLElement>('[data-testid="mobile-scroll"]');
    if (scroller) scroller.scrollTop = 0;
  }, [view]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(demoChannelName);
    demoChannel.current = channel;
    channel.onmessage = (event: MessageEvent<DemoSyncEvent>) => {
      const update = event.data;
      if (update.type === "ticket-status") {
        setTickets((all) => all.map((ticket) => ticket.id === update.id ? { ...ticket, status: update.status } : ticket));
        notify(`${update.id} updated by hotel operations: ${update.status}.`);
      }
      if (update.type === "feedback-response") {
        addNotice("Hotel replied to your feedback", update.response);
        notify(`A hotel response is in Notifications and was sent to ${update.recipient}.`);
      }
    };
    return () => {
      demoChannel.current = null;
      channel.close();
    };
  }, []);

  useEffect(() => {
    const dismissOnFocusLeave = () => window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLInputElement) && !(active instanceof HTMLTextAreaElement)) keyboard.hide();
    });
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissKeyboard();
    };
    document.addEventListener("focusout", dismissOnFocusLeave);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("focusout", dismissOnFocusLeave);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  });

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

  const openOperationsPortal = () => {
    dismissKeyboard();
    window.location.assign("?surface=operations");
  };

  const exploreDemo = () => {
    dismissKeyboard();
    setGuest(reservations["AG-7K92"]);
    setReceiptEmail("maya@example.com");
    setView("home");
    addNotice("Demo mode", "You can explore every guest tab without signing in.");
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
    demoChannel.current?.postMessage({ type: "ticket-created", ticket } satisfies DemoSyncEvent);
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
    const hospitalityIntent = /hotel|stay|room|ac|air conditioning|temperature|humidity|leak|clean|bathroom|bathtub|towel|sheet|bedding|minibar|mini bar|wheelchair|ramp|accessible|medical|stretcher|pregnan|elderly|service animal|pet|bassinet|language|restaurant|dinner|breakfast|lunch|table|bar|banquet|hall|cab|airport|transfer|flight|pickup|reservation|booking|loyalty|points|membership|checkout|invoice|itemized|bill|receipt|email|rain|weather|spa|cabana|nearby|local area|sightseeing|concierge|housekeeping|maintenance/.test(lower);
    if (!hospitalityIntent) {
      if (/capital\s+of\s+france/.test(lower)) {
        return "Paris is the capital of France. That is a general-knowledge question, so I did not create a hotel ticket. I can also help with your stay, local travel, dining, accessibility, reservations, room comfort, or billing.";
      }
      return "That looks outside the hotel and travel services I can safely action, so I did not create a ticket. The live-AI connection can answer broader questions when enabled; this demo keeps autonomous actions limited to your stay.";
    }
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
        const result = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          mode: "hotel_concierge",
          message: prompt,
          guest,
          tickets,
          interests,
          conversation: messages.slice(-6),
          availableServices: serviceCatalog.map((item) => item.label),
          actionPolicy: {
            allowed: ["suggest_service", "create_request_draft", "check_request_status", "open_billing_view"],
            confirmationRequired: ["cancel_reservation", "charge_payment", "send_external_message", "dispatch_transport"],
            prohibited: ["expose_private_data", "execute_unlisted_action"],
          },
        }) });
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
    const comment = feedbackComment.trim();
    const needsResponse = rating <= 3 || /\?|concern|issue|problem|call|contact/i.test(comment);
    const item: Feedback = { id: `FB-${110 + feedback.length}`, type: feedbackType, rating, comment, destination: currentHotel.opsEmail, guestName: guest.name, guestEmail: receiptEmail || (guest.contact?.includes("@") ? guest.contact : ""), status: needsResponse ? "Needs response" : "New" };
    setFeedback((current) => [item, ...current]);
    demoChannel.current?.postMessage({ type: "feedback-created", feedback: item } satisfies DemoSyncEvent);
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
    <header className="auth-entry-header"><AppMark /><button className="auth-operations-switch" onClick={openOperationsPortal}><DashboardIcon /><span>Hotel team</span><ChevronRightIcon /></button></header>
    <div className="auth-hero"><span className="eyebrow">Your stay, already in motion</span><h1>Welcome to a more thoughtful stay.</h1><p>Use a reservation, or continue as a guest with your name and one contact method.</p></div>
    <div className="segment-control" role="tablist" aria-label="Access method"><button role="tab" aria-selected={authMode === "reservation"} className={authMode === "reservation" ? "active" : ""} onClick={() => setAuthMode("reservation")}>Reservation</button><button role="tab" aria-selected={authMode === "guest"} className={authMode === "guest" ? "active" : ""} onClick={() => setAuthMode("guest")} data-testid="guest-access-tab">Guest access</button></div>
    {authMode === "reservation" ? <section className="access-form"><Field label="Reservation number" value={reservationCode} onChange={(event) => setReservationCode(event.target.value)} autoCapitalize="characters" data-testid="reservation-input" /><p className="field-help"><IdCardIcon /> Demo reservation: <button onClick={() => setReservationCode("AG-7K92")}>AG-7K92</button></p><div className="matched-stay"><span className="hotel-monogram">AG</span><span><strong>Aurora Grand</strong><small>Mumbai · Arrival 18:40</small></span><CheckCircledIcon /></div></section> : <section className="access-form"><Field label="Full name" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Your name" /><div className="two-fields"><Field label="Phone" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} placeholder="Optional" inputMode="tel" /><Field label="Email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Optional" inputMode="email" /></div>{renderHotelSearch(false)}</section>}
    {authError && <p className="form-error"><ExclamationTriangleIcon /> {authError}</p>}
    <button className="primary-button" onClick={login} data-testid="continue-button">Continue securely <ChevronRightIcon /></button>
    <div className="auth-choice-divider"><span>or</span></div>
    <button className="explore-demo-button" onClick={exploreDemo} data-testid="explore-demo"><span><HomeIcon /><strong>Explore the guest demo</strong><small>No email or reservation required</small></span><ChevronRightIcon /></button>
    <button className="auth-staff-link" onClick={openOperationsPortal}><DashboardIcon /><span><strong>Switch to Hotel Operations</strong><small>Authorized hotel staff sign-in required</small></span><ChevronRightIcon /></button>
    <p className="privacy-note">Demo data stays in memory and resets on reload. Intellistay does not read files, contacts, photos, or device history.</p>
  </main></MobileScroll>;

  const renderHome = () => <main className="screen-content home-screen" data-testid="home-screen">
    <header className="screen-header home-header"><AppMark compact /><div className="header-actions"><button className="icon-button staff-entry-button" aria-label="Switch to hotel operations" onClick={openOperationsPortal}><DashboardIcon /></button><button className="icon-button notice-button" aria-label="Notifications" onClick={() => { setNotices((all) => all.map((item) => ({ ...item, read: true }))); setSheet("notifications"); }}><BellIcon />{unreadNotices && <i className="notification-dot" />}</button><button className="icon-button" aria-label="Profile" onClick={() => changeView("profile")}><PersonIcon /></button></div></header>
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
    <p className="ai-note"><CheckCircledIcon /> Agent-ready boundary · hotel tools only · 2 credits per estimated token</p>
  </main>;

  const renderRequests = () => <main className="screen-content requests-screen" data-testid="requests-screen">
    <header className="screen-header"><div><span className="eyebrow">My stay</span><h1>Requests</h1></div><button className="new-request-button" onClick={() => openService()}><PlusIcon /> New</button></header>
    <section className="request-summary"><span><strong>{tickets.filter((ticket) => ticket.status === "New" || ticket.status === "In progress").length}</strong> active</span><span><strong>{tickets.filter((ticket) => ticket.status === "Resolved" || ticket.status === "Closed").length}</strong> completed</span><span><strong>7m</strong> avg reply</span></section>
    <section className="ticket-list" aria-label="Guest requests">{tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} onOpen={() => { setSelectedTicketId(ticket.id); setSheet("ticket"); }} />)}</section>
    <div className="empty-action"><HeartIcon /><div><strong>How was the service?</strong><span>Your feedback goes to {currentHotel.opsEmail}.</span></div><button onClick={() => setSheet("feedback")}>Feedback</button></div>
  </main>;

  const renderProfile = () => <main className="screen-content profile-screen" data-testid="profile-screen">
    <header className="profile-hero"><span className="profile-avatar">{guest.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><h1>{guest.name}</h1><p>{guest.hotel} · #{guest.reservation}</p></header>
    <section className="profile-section"><span className="section-label">Stay & account</span><button onClick={() => setSheet("hotel")}><MagnifyingGlassIcon /><span><strong>Change participating hotel</strong><small>Search by hotel, city, region or pincode</small></span><ChevronRightIcon /></button><button onClick={() => setSheet("checkout")}><FileTextIcon /><span><strong>Checkout & billing</strong><small>View, email or download both documents</small></span><ChevronRightIcon /></button><button onClick={() => setSheet("notifications")}><BellIcon /><span><strong>Proactive notifications</strong><small>Push {pushEnabled ? "on" : "off"} · email {emailUpdates ? "on" : "off"}</small></span><ChevronRightIcon /></button><button onClick={() => setSheet("feedback")}><HeartIcon /><span><strong>Share feedback</strong><small>Delivered to participating hotel operations</small></span><ChevronRightIcon /></button></section>
    <section className="profile-section experience-switch-section"><span className="section-label">Switch experience</span><button onClick={openOperationsPortal}><DashboardIcon /><span><strong>Hotel Operations</strong><small>Opens the protected hotel-staff sign-in</small></span><ChevronRightIcon /></button></section>
    <section className="privacy-card"><CheckCircledIcon /><div><strong>Private demo mode</strong><p>No contacts, files, photos, location history, or device identifiers are read. Data resets on reload.</p></div></section>
    <button className="text-button" onClick={() => { setView("auth"); dismissKeyboard(); }}>Sign out of demo</button>
  </main>;

  /* Legacy in-phone staff console removed from the customer experience.
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
  */

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

  return <div className="app-shell"><MobileScroll key={view} className="app-screen">{view === "home" && renderHome()}{view === "concierge" && renderConcierge()}{view === "requests" && renderRequests()}{view === "profile" && renderProfile()}</MobileScroll><BottomNav view={view} onChange={changeView} unread={unreadNotices} />{keyboard.visible && <button className="keyboard-done" style={{ bottom: keyboard.height + 8 }} onPointerDown={(event) => { event.preventDefault(); dismissKeyboard(); }} aria-label="Dismiss keyboard">Done</button>}<BottomSheet open={sheet !== null} onOpenChange={(open) => { if (!open) { setSheet(null); setSelectedService(null); setServicePath([]); } }} title={sheetTitle} description={sheet === "service" ? "Choose a service; Intellistay routes it to the right hotel team." : undefined}>{renderSheetContent()}</BottomSheet>{toast && <div className="toast" role="status"><CheckCircledIcon />{toast}</div>}</div>;
}

function WebOperationsDashboardLegacy() {
  const [property, setProperty] = useState(hotels[0].name);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [period, setPeriod] = useState<ReportPeriod>("Daily");
  const [activeSection, setActiveSection] = useState("Overview");
  const [activity, setActivity] = useState([
    "Flight AI-624 delay verified against arrival context",
    "Airport transfer moved to 19:30 within hotel policy",
    "Terrace reservation protected for 20:00",
  ]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(demoChannelName);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<DemoSyncEvent>) => {
      const update = event.data;
      if (update.type === "ticket-created") {
        setTickets((all) => [update.ticket, ...all.filter((ticket) => ticket.id !== update.ticket.id)]);
        setActivity((all) => [`${update.ticket.id} routed to ${update.ticket.department} from the guest app`, ...all].slice(0, 6));
      }
      if (update.type === "ticket-status") setTickets((all) => all.map((ticket) => ticket.id === update.id ? { ...ticket, status: update.status } : ticket));
      if (update.type === "feedback-created") setFeedback((all) => [update.feedback, ...all]);
    };
    return () => {
      channelRef.current = null;
      channel.close();
    };
  }, []);

  const changeStatus = (id: string, status: TicketStatus) => {
    setTickets((all) => all.map((ticket) => ticket.id === id ? { ...ticket, status } : ticket));
    channelRef.current?.postMessage({ type: "ticket-status", id, status } satisfies DemoSyncEvent);
    setActivity((all) => [`${id} moved to ${status} by hotel operations`, ...all].slice(0, 6));
  };

  const exportWebReport = () => {
    const rows = ["Ticket,Service,Department,Status,Priority", ...tickets.map((ticket) => [ticket.id, `"${ticket.title}"`, ticket.department, ticket.status, ticket.priority].join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Intellistay-${period}-MIS.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openTickets = tickets.filter((ticket) => ticket.status === "New" || ticket.status === "In progress");
  const highPriority = openTickets.filter((ticket) => ticket.priority === "High").length;

  return <div className="web-ops-surface">
    <aside className="web-sidebar">
      <AppMark />
      <label className="web-property"><span>Participating property</span><select value={property} onChange={(event) => setProperty(event.target.value)}>{hotels.map((hotel) => <option key={hotel.name}>{hotel.name}</option>)}</select></label>
      <nav aria-label="Operations website navigation">{["Overview", "Guest journeys", "Requests", "AI actions", "Reports"].map((item) => <button key={item} className={activeSection === item ? "active" : ""} onClick={() => setActiveSection(item)}>{item === "Overview" ? <DashboardIcon /> : item === "Requests" ? <ClipboardIcon /> : item === "Reports" ? <FileTextIcon /> : item === "AI actions" ? <LightningBoltIcon /> : <PersonIcon />}{item}{item === "Requests" && <span>{openTickets.length}</span>}</button>)}</nav>
      <div className="web-system-card"><span className="live-dot" /><div><strong>Agent control plane live</strong><small>Actions restricted by hotel policy</small></div></div>
      <a className="web-guest-link" href="?screen=home" target="_blank" rel="noreferrer"><HomeIcon /> Open guest mobile app <ChevronRightIcon /></a>
      <small className="web-reset-note">Hackathon demo data resets on reload.</small>
    </aside>

    <main className="web-main">
      <header className="web-topbar"><div><span className="eyebrow">{property}</span><h1>Operations command center</h1><p>Guest requests, proactive actions, SLA alerts, and management reporting in one live workspace.</p></div><div className="web-top-actions"><button aria-label="Operations notifications"><BellIcon /><i /></button><span>MK</span></div></header>

      <section className="web-metrics" aria-label="Operations metrics">
        <article><span>Open requests</span><strong>{openTickets.length}</strong><small>Across 5 departments</small></article>
        <article><span>High priority</span><strong>{highPriority}</strong><small>Immediate attention</small></article>
        <article><span>AI actions today</span><strong>18</strong><small>94% completed autonomously</small></article>
        <article><span>Guest sentiment</span><strong>{feedback.length ? `${feedback[0].rating}.0` : "4.8"}</strong><small>Live feedback average</small></article>
      </section>

      <section className="web-command-grid">
        <article className="web-panel web-agent-panel">
          <div className="web-panel-head"><div><span className="section-label">Proactive AI activity</span><h2>Arrival plan orchestrated</h2></div><span className="web-safe-badge"><CheckCircledIcon /> Policy checked</span></div>
          <p className="web-panel-intro">The agent linked flight context to transfer and dining tools, then stopped at the hotel-approved action boundary.</p>
          <div className="web-agent-timeline">{activity.slice(0, 4).map((item, index) => <div key={`${item}-${index}`} className={index === 0 ? "current" : "done"}><span>{index + 1}</span><div><strong>{item}</strong><small>{index === 0 ? "Just now" : `${index * 4 + 2} minutes ago`}</small></div></div>)}</div>
          <div className="web-tool-row"><span>Flight status</span><span>Transport</span><span>Dining</span><span>Hotel PMS</span></div>
        </article>

        <article className="web-panel web-control-panel">
          <div className="web-panel-head"><div><span className="section-label">Agent readiness</span><h2>Safe autonomy controls</h2></div><LightningBoltIcon /></div>
          <div className="web-control-list">
            <div><CheckCircledIcon /><span><strong>Context engine</strong><small>Guest, stay, hotel, weather, and itinerary context</small></span><em>Ready</em></div>
            <div><CheckCircledIcon /><span><strong>Tool allowlist</strong><small>Requests, billing view, transfers, dining, and PMS adapters</small></span><em>Ready</em></div>
            <div><CheckCircledIcon /><span><strong>Approval gate</strong><small>Required for charges, cancellations, dispatch, and external messages</small></span><em>Active</em></div>
            <div><ClockIcon /><span><strong>Live model endpoint</strong><small>Connect a server-side Responses API runtime and secret</small></span><em className="pending">Connect</em></div>
          </div>
        </article>
      </section>

      <section className="web-lower-grid">
        <article className="web-panel web-queue-panel">
          <div className="web-panel-head"><div><span className="section-label">Live request queue</span><h2>Department workboard</h2></div><span>{openTickets.length} open</span></div>
          <div className="web-table" role="table" aria-label="Hotel request queue"><div className="web-table-head" role="row"><span>Request</span><span>Department</span><span>Priority</span><span>Status</span><span>Action</span></div>{tickets.filter((ticket) => ticket.status !== "Closed").map((ticket) => <div className="web-table-row" role="row" key={ticket.id}><span><strong>{ticket.title}</strong><small>{ticket.id} · {ticket.minutesOpen}m open</small></span><span>{ticket.department}</span><span className={ticket.priority === "High" ? "web-priority high" : "web-priority"}>{ticket.priority}</span><span className={`status-pill ${statusClass(ticket.status)}`}>{ticket.status}</span><span>{ticket.status === "New" && <button onClick={() => changeStatus(ticket.id, "In progress")}>Accept</button>}{ticket.status === "In progress" && <button onClick={() => changeStatus(ticket.id, "Resolved")}>Resolve</button>}{ticket.status === "Resolved" && <button onClick={() => changeStatus(ticket.id, "Closed")}>Close</button>}</span></div>)}</div>
        </article>

        <article className="web-panel web-report-panel">
          <span className="section-label">Management reporting</span><h2>{period} MIS</h2><p>Export the current operational view for leadership and department reviews.</p>
          <div className="web-report-tabs">{reportPeriods.map((item) => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div>
          <div className="web-report-stat"><span>Tickets handled</span><strong>{tickets.length}</strong></div><div className="web-report-stat"><span>Automated actions</span><strong>18</strong></div><div className="web-report-stat"><span>Estimated time saved</span><strong>3.4h</strong></div>
          <button className="web-export" onClick={exportWebReport}><DownloadIcon /> Export {period.toLowerCase()} report</button>
        </article>
      </section>
    </main>
  </div>;
}

type OpsSection = "Overview" | "Requests" | "Performance" | "Feedback" | "Reports" | "AI analyst";
type OperationsTicket = Ticket & {
  property: string;
  guestName: string;
  guestEmail: string;
  room: string;
  queueMinutes: number;
  resolutionMinutes?: number;
  firstTimeResolved: boolean;
  owner: string;
  openedAt: string;
};
type OpsSession = { email: string; hotelName: string; role: string };

const operationsSections: OpsSection[] = ["Overview", "Requests", "Performance", "Feedback", "Reports", "AI analyst"];
const operationsStatuses: TicketStatus[] = ["New", "In progress", "Dead", "Resolved", "Closed", "N/A / Invalid"];

function buildOperationsTickets(property: string): OperationsTicket[] {
  return [
    { ...initialTickets[1], property, guestName: "Maya Kapoor", guestEmail: "maya@example.com", room: "1208", queueMinutes: 7, firstTimeResolved: false, owner: "Unassigned", openedAt: "18:42" },
    { ...initialTickets[0], property, guestName: "Maya Kapoor", guestEmail: "maya@example.com", room: "1208", queueMinutes: 4, firstTimeResolved: false, owner: "A. Fernandes", openedAt: "14:12" },
    { ...initialTickets[2], property, guestName: "Kabir Rao", guestEmail: "kabir@example.com", room: "704", queueMinutes: 6, resolutionMinutes: 18, firstTimeResolved: true, owner: "N. Shah", openedAt: "17:58" },
    { id: "IST-2405", title: "Room cleaning", detail: "Evening refresh requested before 19:00.", department: "Housekeeping", status: "Closed", priority: "Standard", minutesOpen: 22, comments: ["Completed and guest confirmed."], property, guestName: "Anika Sen", guestEmail: "anika@example.com", room: "508", queueMinutes: 3, resolutionMinutes: 14, firstTimeResolved: true, owner: "P. Das", openedAt: "16:21" },
    { id: "IST-2404", title: "Airport pickup", detail: "Driver missed original terminal meeting point.", department: "Concierge", status: "Dead", priority: "High", minutesOpen: 142, comments: ["SLA breached; duty manager reviewing."], property, guestName: "Dev Malhotra", guestEmail: "dev@example.com", room: "1102", queueMinutes: 38, firstTimeResolved: false, owner: "R. Pinto", openedAt: "15:36" },
    { id: "IST-2403", title: "Duplicate minibar request", detail: "Duplicate of IST-2399; no operational action required.", department: "Front Desk", status: "N/A / Invalid", priority: "Standard", minutesOpen: 5, comments: ["Duplicate validated."], property, guestName: "Sara Iyer", guestEmail: "sara@example.com", room: "312", queueMinutes: 2, firstTimeResolved: false, owner: "N. Shah", openedAt: "15:12" },
    { id: "IST-2402", title: "Restaurant table for two", detail: "Terrace table reserved for 20:00.", department: "Dining", status: "Resolved", priority: "Standard", minutesOpen: 19, comments: ["Confirmation sent."], property, guestName: "Maya Kapoor", guestEmail: "maya@example.com", room: "1208", queueMinutes: 5, resolutionMinutes: 12, firstTimeResolved: true, owner: "L. Mehta", openedAt: "13:08" },
    { id: "IST-2401", title: "Extra bedding", detail: "Rollaway bed delivered to room 914.", department: "Housekeeping", status: "Closed", priority: "Standard", minutesOpen: 31, comments: ["Delivered in one visit."], property, guestName: "Vihaan Bose", guestEmail: "vihaan@example.com", room: "914", queueMinutes: 8, resolutionMinutes: 23, firstTimeResolved: true, owner: "P. Das", openedAt: "12:44" },
    { id: "IST-2400", title: "Membership points review", detail: "Stay points are being validated against the loyalty account.", department: "Reservations", status: "In progress", priority: "Standard", minutesOpen: 46, comments: ["Loyalty ledger requested."], property, guestName: "Tara Khanna", guestEmail: "tara@example.com", room: "601", queueMinutes: 11, firstTimeResolved: false, owner: "S. Roy", openedAt: "12:18" },
  ];
}

function buildOperationsFeedback(hotel: Hotel): Feedback[] {
  return [
    { id: "FB-113", type: "Room", rating: 2, comment: "The AC is better now, but can someone explain why it took so long?", destination: hotel.opsEmail, guestName: "Maya Kapoor", guestEmail: "maya@example.com", status: "Needs response" },
    { id: "FB-112", type: "Concierge", rating: 5, comment: "Wheelchair assistance was waiting before we arrived. Excellent care.", destination: hotel.opsEmail, guestName: "Kabir Rao", guestEmail: "kabir@example.com", status: "New" },
    { id: "FB-111", type: "Dining", rating: 4, comment: "Lovely dinner. Please share my thanks with the Terrace team.", destination: hotel.opsEmail, guestName: "Anika Sen", guestEmail: "anika@example.com", status: "Responded", response: "Thank you—your note has been shared with the Terrace team." },
    { id: "FB-110", type: "Checkout", rating: 3, comment: "Could you email a clearer explanation of the spa line item?", destination: hotel.opsEmail, guestName: "Dev Malhotra", guestEmail: "dev@example.com", status: "Needs response" },
  ];
}

function sectionIcon(section: OpsSection) {
  if (section === "Overview") return <DashboardIcon />;
  if (section === "Requests") return <ClipboardIcon />;
  if (section === "Performance") return <ClockIcon />;
  if (section === "Feedback") return <HeartIcon />;
  if (section === "Reports") return <FileTextIcon />;
  return <LightningBoltIcon />;
}

export function WebOperationsDashboard() {
  const [session, setSession] = useState<OpsSession | null>(() => {
    try { return JSON.parse(window.sessionStorage.getItem("intellistay-ops-session") || "null") as OpsSession | null; } catch { return null; }
  });
  const initialHotel = hotels.find((hotel) => hotel.name === session?.hotelName) ?? hotels[0];
  const [tickets, setTickets] = useState<OperationsTicket[]>(() => buildOperationsTickets(initialHotel.name));
  const [feedback, setFeedback] = useState<Feedback[]>(() => buildOperationsFeedback(initialHotel));
  const [activeSection, setActiveSection] = useState<OpsSection>("Overview");
  const [period, setPeriod] = useState<ReportPeriod>("Daily");
  const [accessMode, setAccessMode] = useState<"email" | "partner">("email");
  const [staffEmail, setStaffEmail] = useState("manager@auroragrand.demo");
  const [partnerId, setPartnerId] = useState("AG-HOTEL-001");
  const [accessCode, setAccessCode] = useState("INTELLI-DEMO");
  const [partnerHotel, setPartnerHotel] = useState(hotels[0].name);
  const [authError, setAuthError] = useState("");
  const [requestFilter, setRequestFilter] = useState<"All" | TicketStatus>("All");
  const [requestSearch, setRequestSearch] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState("");
  const [responseDraft, setResponseDraft] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("Ask for a property summary, a guest history, queue risks, feedback concerns, or a reporting breakdown.");
  const [toast, setToast] = useState("");
  const channelRef = useRef<BroadcastChannel | null>(null);

  const hotel = hotels.find((item) => item.name === session?.hotelName) ?? initialHotel;
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(demoChannelName);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<DemoSyncEvent>) => {
      const update = event.data;
      if (update.type === "ticket-created") {
        const incoming: OperationsTicket = { ...update.ticket, property: hotel.name, guestName: "Maya Kapoor", guestEmail: "maya@example.com", room: "1208", queueMinutes: 0, firstTimeResolved: false, owner: "Unassigned", openedAt: "Just now" };
        setTickets((all) => [incoming, ...all.filter((ticket) => ticket.id !== incoming.id)]);
        showToast(`${incoming.id} arrived from the guest app.`);
      }
      if (update.type === "ticket-status") setTickets((all) => all.map((ticket) => ticket.id === update.id ? { ...ticket, status: update.status } : ticket));
      if (update.type === "feedback-created") setFeedback((all) => [{ ...update.feedback, guestName: update.feedback.guestName || "Maya Kapoor", guestEmail: update.feedback.guestEmail || "maya@example.com" }, ...all]);
    };
    return () => { channelRef.current = null; channel.close(); };
  }, [hotel.name]);

  useEffect(() => {
    document.querySelector<HTMLElement>(".web-ops-surface")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  const completeLogin = (nextHotel: Hotel, email: string, role: string) => {
    const nextSession = { email, hotelName: nextHotel.name, role };
    setSession(nextSession);
    window.sessionStorage.setItem("intellistay-ops-session", JSON.stringify(nextSession));
    setTickets(buildOperationsTickets(nextHotel.name));
    setFeedback(buildOperationsFeedback(nextHotel));
    setAuthError("");
  };

  const authenticate = () => {
    if (accessMode === "email") {
      const domain = staffEmail.trim().toLowerCase().split("@")[1];
      const matchedHotel = hotels.find((item) => item.opsEmail.split("@")[1] === domain);
      if (!matchedHotel) return setAuthError("This email domain is not associated with a participating Intellistay hotel.");
      completeLogin(matchedHotel, staffEmail.trim(), "Hotel operations manager");
      return;
    }
    const matchedHotel = hotels.find((item) => item.name === partnerHotel);
    if (!matchedHotel || partnerId.trim().length < 4 || accessCode !== "INTELLI-DEMO") return setAuthError("Partner ID or access code could not be verified.");
    completeLogin(matchedHotel, `${partnerId.trim()}@partner.intellistay.demo`, "Partner operations lead");
  };

  const signOut = () => {
    window.sessionStorage.removeItem("intellistay-ops-session");
    setSession(null);
    setActiveSection("Overview");
  };

  const changeStatus = (id: string, status: TicketStatus) => {
    setTickets((all) => all.map((ticket) => ticket.id === id ? { ...ticket, status, owner: ticket.owner === "Unassigned" ? "M. Kapoor" : ticket.owner, resolutionMinutes: status === "Resolved" || status === "Closed" ? ticket.resolutionMinutes ?? ticket.minutesOpen : ticket.resolutionMinutes, firstTimeResolved: status === "Resolved" ? ticket.comments.length <= 1 : ticket.firstTimeResolved } : ticket));
    channelRef.current?.postMessage({ type: "ticket-status", id, status } satisfies DemoSyncEvent);
    showToast(`${id} moved to ${status}. The guest view is synchronized.`);
  };

  const raised = tickets.length;
  const inProgress = tickets.filter((ticket) => ticket.status === "In progress").length;
  const dead = tickets.filter((ticket) => ticket.status === "Dead").length;
  const resolved = tickets.filter((ticket) => ticket.status === "Resolved").length;
  const closed = tickets.filter((ticket) => ticket.status === "Closed").length;
  const invalid = tickets.filter((ticket) => ticket.status === "N/A / Invalid").length;
  const completed = tickets.filter((ticket) => ticket.status === "Resolved" || ticket.status === "Closed");
  const ftr = completed.filter((ticket) => ticket.firstTimeResolved).length;
  const ftrRate = completed.length ? Math.round(ftr / completed.length * 100) : 0;
  const resolutionTimes = tickets.flatMap((ticket) => ticket.resolutionMinutes ? [ticket.resolutionMinutes] : []);
  const fastest = resolutionTimes.length ? Math.min(...resolutionTimes) : 0;
  const averageQueue = tickets.length ? Math.round(tickets.reduce((sum, ticket) => sum + ticket.queueMinutes, 0) / tickets.length) : 0;
  const feedbackNeedsResponse = feedback.filter((item) => item.status === "Needs response").length;
  const guestSentiment = feedback.length ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1) : "—";
  const filteredTickets = tickets.filter((ticket) => (requestFilter === "All" || ticket.status === requestFilter) && (!requestSearch.trim() || `${ticket.id} ${ticket.title} ${ticket.guestName} ${ticket.room} ${ticket.department}`.toLowerCase().includes(requestSearch.trim().toLowerCase())));
  const departmentStats = (["Front Desk", "Concierge", "Maintenance", "Housekeeping", "Dining", "Reservations"] as Department[]).map((department) => ({ department, count: tickets.filter((ticket) => ticket.department === department).length, active: tickets.filter((ticket) => ticket.department === department && (ticket.status === "New" || ticket.status === "In progress" || ticket.status === "Dead")).length }));
  const metrics = [
    { label: "Requests raised", value: raised, note: `${period} property total` },
    { label: "In progress", value: inProgress, note: "Actively owned" },
    { label: "Dead / breached", value: dead, note: "Needs recovery", alert: true },
    { label: "Resolved", value: resolved, note: "Awaiting closure" },
    { label: "Closed", value: closed, note: "Guest loop complete" },
    { label: "N/A or invalid", value: invalid, note: "Excluded with reason" },
    { label: "First-time resolved", value: `${ftrRate}%`, note: `${ftr} of ${completed.length} completed` },
    { label: "Fastest resolution", value: `${fastest}m`, note: "Best completed request" },
    { label: "Average queue wait", value: `${averageQueue}m`, note: "Before team acceptance" },
  ];

  const exportWebReport = () => {
    const rows = ["Ticket,Guest,Room,Service,Department,Status,Priority,Queue Minutes,Resolution Minutes,FTR,Owner", ...tickets.map((ticket) => [ticket.id, `"${ticket.guestName}"`, ticket.room, `"${ticket.title}"`, ticket.department, ticket.status, ticket.priority, ticket.queueMinutes, ticket.resolutionMinutes ?? "", ticket.firstTimeResolved ? "Yes" : "No", `"${ticket.owner}"`].join(",")), "", "Feedback,Guest,Rating,Type,Status,Comment,Response", ...feedback.map((item) => [item.id, `"${item.guestName || "Guest"}"`, item.rating, item.type, item.status || "New", `"${item.comment.replace(/"/g, "'")}"`, `"${(item.response || "").replace(/"/g, "'")}"`].join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Intellistay-${hotel.name.replace(/\s+/g, "-")}-${period}-MIS.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(`${period} report downloaded.`);
  };

  const emailWebReport = () => showToast(`${period} management report queued to ${hotel.opsEmail}.`);

  const sendFeedbackResponse = (item: Feedback) => {
    if (!responseDraft.trim()) return showToast("Write a response before sending.");
    const recipient = item.guestEmail || "guest email on reservation";
    setFeedback((all) => all.map((entry) => entry.id === item.id ? { ...entry, response: responseDraft.trim(), status: "Responded" } : entry));
    channelRef.current?.postMessage({ type: "feedback-response", feedbackId: item.id, response: responseDraft.trim(), recipient } satisfies DemoSyncEvent);
    setSelectedFeedback("");
    setResponseDraft("");
    showToast(`Response sent to ${recipient} and added to the guest notification center.`);
  };

  const runAiAnalysis = (prompt = aiQuery) => {
    const query = prompt.trim().toLowerCase();
    if (!query) return;
    setAiQuery(prompt);
    if (/maya|customer|guest/.test(query)) {
      const guestTickets = tickets.filter((ticket) => ticket.guestName.toLowerCase().includes("maya"));
      setAiAnswer(`Maya Kapoor has ${guestTickets.length} requests: ${guestTickets.map((ticket) => `${ticket.title} (${ticket.status})`).join(", ")}. Her AC request is the current recovery risk and her latest feedback needs a response.`);
    } else if (/feedback|concern|question|sentiment/.test(query)) {
      setAiAnswer(`${feedbackNeedsResponse} feedback items need a response. The main concern is response-time clarity after maintenance. Recommended action: acknowledge Maya today and explain the dispatch timeline.`);
    } else if (/queue|wait|slow|dead|breach/.test(query)) {
      setAiAnswer(`Average queue wait is ${averageQueue} minutes. Concierge owns the only dead request, an airport pickup open for 142 minutes. Reassign it to the duty manager and contact the guest now.`);
    } else if (/ftr|first|resolve|performance/.test(query)) {
      setAiAnswer(`First-time resolution is ${ftrRate}% (${ftr} of ${completed.length} completed requests). Housekeeping leads with two one-visit completions; Concierge needs recovery coaching.`);
    } else if (/report|summary|today|overview/.test(query)) {
      setAiAnswer(`${hotel.name} has ${raised} requests, ${inProgress} in progress, ${dead} dead, ${resolved} resolved, and ${closed} closed. Guest sentiment is ${guestSentiment}/5. I recommend clearing the dead airport transfer and responding to ${feedbackNeedsResponse} feedback items first.`);
    } else {
      setAiAnswer(`I searched this property's requests and feedback but need a hotel-operations question. Try “show queue risks”, “summarize Maya Kapoor”, “review FTR”, or “what feedback needs a response?”`);
    }
  };

  if (!session) return <div className="ops-auth-surface">
    <button className="ops-auth-guest-switch" onClick={() => window.location.assign("?screen=home")}><HomeIcon /><span>Guest app</span><ChevronRightIcon /></button>
    <aside className="ops-auth-story"><AppMark /><div><span className="eyebrow">Intellistay for hotel partners</span><h1>Turn every guest signal into a decisive next action.</h1><p>A private operations workspace for participating properties—connected to the guest concierge, never exposed inside it.</p></div><div className="ops-auth-proof"><span><CheckCircledIcon /> Property-scoped access</span><span><CheckCircledIcon /> Guest-to-team live routing</span><span><CheckCircledIcon /> Auditable AI recommendations</span></div></aside>
    <main className="ops-auth-main"><section className="ops-auth-card"><span className="section-label">Authorized partner workspace</span><h2>Hotel operations sign in</h2><p>We identify your participating property from its approved email domain or partnership login.</p><div className="ops-access-tabs" role="tablist" aria-label="Hotel operations access method"><button role="tab" aria-selected={accessMode === "email"} className={accessMode === "email" ? "active" : ""} onClick={() => { setAccessMode("email"); setAuthError(""); }}>Hotel email</button><button role="tab" aria-selected={accessMode === "partner"} className={accessMode === "partner" ? "active" : ""} onClick={() => { setAccessMode("partner"); setAuthError(""); }}>Partner login</button></div>{accessMode === "email" ? <label className="ops-auth-field"><span>Work email</span><input value={staffEmail} onChange={(event) => setStaffEmail(event.target.value)} type="email" aria-label="Hotel work email" /><small>Demo: manager@auroragrand.demo</small></label> : <><label className="ops-auth-field"><span>Participating hotel</span><select value={partnerHotel} onChange={(event) => setPartnerHotel(event.target.value)}>{hotels.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><div className="ops-auth-two"><label className="ops-auth-field"><span>Partner ID</span><input value={partnerId} onChange={(event) => setPartnerId(event.target.value)} /></label><label className="ops-auth-field"><span>Access code</span><input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} type="password" /><small>Demo: INTELLI-DEMO</small></label></div></>}{authError && <p className="ops-auth-error" role="alert"><ExclamationTriangleIcon />{authError}</p>}<button className="ops-auth-submit" onClick={authenticate}>Enter operations workspace <ChevronRightIcon /></button><p className="ops-auth-privacy"><CheckCircledIcon /> Demo verification only. Production access requires SSO, MFA, property roles, and server-enforced data isolation.</p></section></main>
  </div>;

  const statusVisual = operationsStatuses.map((status) => ({ status, count: tickets.filter((ticket) => ticket.status === status).length }));
  const maxStatusCount = Math.max(1, ...statusVisual.map((item) => item.count));
  const pageCopy: Record<OpsSection, { eyebrow: string; title: string; description: string }> = {
    Overview: { eyebrow: "Live property pulse", title: "Operations overview", description: "Every guest request, SLA risk, recovery action, and feedback signal in one decision-ready view." },
    Requests: { eyebrow: "Service command center", title: "Requests workboard", description: "Search, own, progress, resolve, close, or invalidate requests with the guest view synchronized." },
    Performance: { eyebrow: "Service intelligence", title: "Performance dashboard", description: "Track resolution quality, queue speed, department workload, and first-time resolution." },
    Feedback: { eyebrow: "Voice of the guest", title: "Feedback action center", description: "Find concerns and questions, respond personally, and close the loop by email and in-app notification." },
    Reports: { eyebrow: "Management information", title: "Reports & MIS", description: "Review and distribute daily, weekly, monthly, or quarterly operational reporting." },
    "AI analyst": { eyebrow: "Property-aware intelligence", title: "Ask Intellistay operations", description: "Query this hotel's requests, guests, feedback, risks, and performance in plain language." },
  };
  const copy = pageCopy[activeSection];

  return <div className="web-ops-surface ops-v2">
    <button className="ops-switch-guest" onClick={() => window.location.assign("?screen=home")}><HomeIcon /><span><strong>Guest app</strong><small>Switch experience</small></span><ChevronRightIcon /></button>
    <aside className="web-sidebar ops-sidebar"><AppMark /><div className="ops-property-lock"><span className="hotel-monogram">{hotel.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><small>Authorized property</small><strong>{hotel.name}</strong><span>{hotel.city}, {hotel.country}</span></div><CheckCircledIcon /></div><nav aria-label="Hotel operations navigation">{operationsSections.map((section) => <button key={section} className={activeSection === section ? "active" : ""} aria-current={activeSection === section ? "page" : undefined} onClick={() => setActiveSection(section)}>{sectionIcon(section)}{section}{section === "Requests" && <span>{inProgress + dead}</span>}{section === "Feedback" && feedbackNeedsResponse > 0 && <span>{feedbackNeedsResponse}</span>}</button>)}</nav><div className="web-system-card"><span className="live-dot" /><div><strong>Guest integration live</strong><small>Property-scoped routing and policy controls active</small></div></div><div className="ops-staff-card"><span>{session.email.split("@")[0].slice(0, 2).toUpperCase()}</span><div><strong>{session.role}</strong><small>{session.email}</small></div><button onClick={signOut}>Sign out</button></div></aside>

    <main className="web-main ops-main"><header className="web-topbar ops-topbar"><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.description}</p></div><div className="ops-top-actions"><button className="ops-action-secondary" onClick={emailWebReport}><EnvelopeClosedIcon /> Email report</button><button className="ops-action-primary" onClick={exportWebReport}><DownloadIcon /> Download</button><button className="ops-icon-button" aria-label="Operations notifications"><BellIcon /><i /></button></div></header>

      {activeSection === "Overview" && <><section className="ops-metric-grid" aria-label="Hotel operations metrics">{metrics.map((metric) => <article key={metric.label} className={metric.alert ? "alert" : ""}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></article>)}</section><section className="ops-overview-grid"><article className="web-panel ops-status-panel"><div className="web-panel-head"><div><span className="section-label">Request lifecycle</span><h2>Status distribution</h2></div><span className="ops-live-badge"><span className="live-dot" /> Live</span></div><div className="ops-bars" aria-label="Request status distribution">{statusVisual.map((item) => <div key={item.status}><span>{item.status}</span><div><i style={{ width: `${Math.max(7, item.count / maxStatusCount * 100)}%` }} className={`bar-${statusClass(item.status)}`} /></div><strong>{item.count}</strong></div>)}</div></article><article className="web-panel ops-attention-panel"><div className="web-panel-head"><div><span className="section-label">Decision queue</span><h2>Needs attention</h2></div><span>{dead + feedbackNeedsResponse + tickets.filter((ticket) => ticket.status === "New").length}</span></div><button onClick={() => { setRequestFilter("Dead"); setActiveSection("Requests"); }}><ExclamationTriangleIcon /><span><strong>Dead request recovery</strong><small>{dead} request has breached its service window</small></span><ChevronRightIcon /></button><button onClick={() => setActiveSection("Feedback")}><HeartIcon /><span><strong>Guest follow-up</strong><small>{feedbackNeedsResponse} feedback items contain a concern or question</small></span><ChevronRightIcon /></button><button onClick={() => { setRequestFilter("New"); setActiveSection("Requests"); }}><ClockIcon /><span><strong>Unaccepted requests</strong><small>{tickets.filter((ticket) => ticket.status === "New").length} waiting for an owner</small></span><ChevronRightIcon /></button></article></section><section className="web-panel ops-compact-queue"><div className="web-panel-head"><div><span className="section-label">Priority workboard</span><h2>What teams should handle next</h2></div><button onClick={() => setActiveSection("Requests")}>View all requests <ChevronRightIcon /></button></div><div className="ops-request-table" role="table" aria-label="Priority requests"><div className="ops-request-head" role="row"><span>Request & guest</span><span>Team</span><span>Queue</span><span>Status</span><span>Owner</span><span>Next action</span></div>{tickets.filter((ticket) => ticket.status === "New" || ticket.status === "In progress" || ticket.status === "Dead").slice(0, 5).map((ticket) => <div className="ops-request-row" role="row" key={ticket.id}><span><strong>{ticket.title}</strong><small>{ticket.id} · {ticket.guestName} · Room {ticket.room}</small></span><span>{ticket.department}</span><span>{ticket.queueMinutes}m</span><span><i className={`status-pill ${statusClass(ticket.status)}`}>{ticket.status}</i></span><span>{ticket.owner}</span><span>{ticket.status === "New" ? <button onClick={() => changeStatus(ticket.id, "In progress")}>Accept</button> : ticket.status === "In progress" ? <button onClick={() => changeStatus(ticket.id, "Resolved")}>Resolve</button> : <button onClick={() => changeStatus(ticket.id, "In progress")}>Recover</button>}</span></div>)}</div></section></>}

      {activeSection === "Requests" && <section className="web-panel ops-workboard"><div className="ops-toolbar"><label><MagnifyingGlassIcon /><input value={requestSearch} onChange={(event) => setRequestSearch(event.target.value)} placeholder="Search request, guest, room or team" aria-label="Search hotel requests" /></label><div className="ops-filter-chips">{(["All", ...operationsStatuses] as const).map((status) => <button key={status} className={requestFilter === status ? "active" : ""} onClick={() => setRequestFilter(status)}>{status}</button>)}</div></div><div className="ops-request-table detailed" role="table" aria-label="All hotel requests"><div className="ops-request-head" role="row"><span>Request & guest</span><span>Team</span><span>Priority</span><span>Queue</span><span>Status</span><span>Owner</span><span>Actions</span></div>{filteredTickets.map((ticket) => <div className="ops-request-row" role="row" key={ticket.id}><span><strong>{ticket.title}</strong><small>{ticket.id} · {ticket.guestName} · Room {ticket.room}</small></span><span>{ticket.department}</span><span className={ticket.priority === "High" ? "ops-high" : ""}>{ticket.priority}</span><span>{ticket.queueMinutes}m</span><span><i className={`status-pill ${statusClass(ticket.status)}`}>{ticket.status}</i></span><span>{ticket.owner}</span><span className="ops-row-actions">{ticket.status === "New" && <button onClick={() => changeStatus(ticket.id, "In progress")}>Accept</button>}{(ticket.status === "In progress" || ticket.status === "Dead") && <button onClick={() => changeStatus(ticket.id, "Resolved")}>Resolve</button>}{ticket.status === "Resolved" && <button onClick={() => changeStatus(ticket.id, "Closed")}>Close</button>}{ticket.status !== "Closed" && ticket.status !== "N/A / Invalid" && <button className="subtle" onClick={() => changeStatus(ticket.id, "N/A / Invalid")}>Invalid</button>}</span></div>)}</div>{!filteredTickets.length && <div className="ops-empty"><CheckCircledIcon /><strong>No requests match this view.</strong><span>Change the status filter or search term.</span></div>}</section>}

      {activeSection === "Performance" && <><section className="ops-performance-hero"><article><span>First-time resolution</span><strong>{ftrRate}%</strong><p>{ftr} requests completed without a repeat visit or reopen.</p></article><article><span>Fastest resolution</span><strong>{fastest}m</strong><p>{tickets.find((ticket) => ticket.resolutionMinutes === fastest)?.title} set today's benchmark.</p></article><article><span>Average queue wait</span><strong>{averageQueue}m</strong><p>From guest submission until an operations owner accepts.</p></article><article><span>Guest sentiment</span><strong>{guestSentiment}</strong><p>{feedbackNeedsResponse} feedback items still require a response.</p></article></section><section className="ops-performance-grid"><article className="web-panel"><span className="section-label">Department load</span><h2>Requests and active work</h2><div className="ops-department-list">{departmentStats.map((item) => <div key={item.department}><span><strong>{item.department}</strong><small>{item.active} active of {item.count} raised</small></span><div><i style={{ width: `${Math.max(8, item.count / Math.max(1, ...departmentStats.map((row) => row.count)) * 100)}%` }} /></div><strong>{item.count}</strong></div>)}</div></article><article className="web-panel"><span className="section-label">AI performance brief</span><h2>Where to improve next</h2><div className="ops-insight-list"><div><ExclamationTriangleIcon /><span><strong>Recover Concierge SLA</strong><small>The airport transfer is the only dead request and drives today's longest queue.</small></span></div><div><HeartIcon /><span><strong>Close the communication gap</strong><small>Two guests asked for explanations. Replying today protects sentiment.</small></span></div><div><CheckCircledIcon /><span><strong>Reuse Housekeeping playbook</strong><small>Housekeeping leads first-time resolution with one-visit completions.</small></span></div></div><button className="ops-action-primary full" onClick={() => { setAiQuery("Summarize performance and recommended actions"); runAiAnalysis("Summarize performance and recommended actions"); setActiveSection("AI analyst"); }}>Ask AI for an action plan</button></article></section></>}

      {activeSection === "Feedback" && <section className="ops-feedback-layout"><div className="ops-feedback-list"><div className="ops-feedback-summary"><article><span>Average rating</span><strong>{guestSentiment}</strong><small>Across {feedback.length} responses</small></article><article className="alert"><span>Needs response</span><strong>{feedbackNeedsResponse}</strong><small>Questions or concerns detected</small></article><article><span>Responded</span><strong>{feedback.filter((item) => item.status === "Responded").length}</strong><small>Guest loop acknowledged</small></article></div>{feedback.map((item) => <article className={`ops-feedback-card ${selectedFeedback === item.id ? "selected" : ""}`} key={item.id}><div className="ops-feedback-card-head"><div><span className="ops-stars" aria-label={`${item.rating} out of 5 stars`}>{[1,2,3,4,5].map((star) => <StarIcon key={star} className={star <= item.rating ? "filled" : ""} />)}</span><strong>{item.type}</strong></div><span className={`feedback-state ${item.status === "Needs response" ? "needs" : ""}`}>{item.status || "New"}</span></div><blockquote>{item.comment || "No written comment."}</blockquote><div className="ops-feedback-meta"><span><PersonIcon />{item.guestName}</span><span><EnvelopeClosedIcon />{item.guestEmail || "Reservation email"}</span><span>{item.id}</span></div>{item.response && <div className="ops-response-sent"><CheckCircledIcon /><span><strong>Hotel response</strong><p>{item.response}</p></span></div>}<button className="ops-respond" onClick={() => { setSelectedFeedback(item.id); setResponseDraft(item.response || ""); }}>{item.response ? "Update response" : "Respond to guest"} <ChevronRightIcon /></button></article>)}</div><aside className="web-panel ops-response-panel">{selectedFeedback ? (() => { const item = feedback.find((entry) => entry.id === selectedFeedback)!; return <><span className="section-label">Direct guest response</span><h2>Reply to {item.guestName}</h2><p>Your response is delivered to {item.guestEmail || "the email on the reservation"} and appears in the guest notification center.</p><label><span>Response</span><textarea value={responseDraft} onChange={(event) => setResponseDraft(event.target.value)} rows={8} placeholder="Acknowledge the concern, explain the action, and offer a next step." /></label><div className="ops-response-actions"><button className="ops-action-primary" onClick={() => sendFeedbackResponse(item)}><EnvelopeClosedIcon /> Send response</button><button className="ops-action-secondary" onClick={() => { setSelectedFeedback(""); setResponseDraft(""); }}>Cancel</button></div><small>Production delivery requires the hotel's approved transactional email service.</small></>; })() : <div className="ops-response-empty"><HeartIcon /><h2>Select feedback to respond</h2><p>Questions and low ratings are automatically highlighted for hotel follow-up.</p></div>}</aside></section>}

      {activeSection === "Reports" && <><section className="ops-report-hero web-panel"><div><span className="section-label">Reporting window</span><h2>{period} management information system</h2><p>A decision-ready property report covering volume, lifecycle, service speed, quality, and guest voice.</p></div><div className="web-report-tabs">{reportPeriods.map((item) => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div><div className="ops-report-actions"><button className="ops-action-secondary" onClick={emailWebReport}><EnvelopeClosedIcon /> Email to leadership</button><button className="ops-action-primary" onClick={exportWebReport}><DownloadIcon /> Download CSV</button></div></section><section className="ops-report-grid"><article className="web-panel"><span className="section-label">Executive summary</span><h2>{hotel.name} at a glance</h2><dl><div><dt>Request volume</dt><dd>{raised}</dd></div><div><dt>Active workload</dt><dd>{inProgress + tickets.filter((ticket) => ticket.status === "New").length}</dd></div><div><dt>SLA breach rate</dt><dd>{Math.round(dead / raised * 100)}%</dd></div><div><dt>FTR</dt><dd>{ftrRate}%</dd></div><div><dt>Average wait</dt><dd>{averageQueue}m</dd></div><div><dt>Guest sentiment</dt><dd>{guestSentiment}/5</dd></div></dl></article><article className="web-panel"><span className="section-label">Lifecycle mix</span><h2>Operational outcomes</h2><div className="ops-bars compact">{statusVisual.map((item) => <div key={item.status}><span>{item.status}</span><div><i style={{ width: `${Math.max(7, item.count / maxStatusCount * 100)}%` }} className={`bar-${statusClass(item.status)}`} /></div><strong>{item.count}</strong></div>)}</div></article><article className="web-panel ops-report-notes"><span className="section-label">Leadership notes</span><h2>AI-prepared talking points</h2><ul><li>Housekeeping sets the strongest first-time-resolution benchmark.</li><li>One dead Concierge request needs service recovery and review.</li><li>{feedbackNeedsResponse} guest feedback items need an owner and direct response.</li><li>Average queue wait is {averageQueue} minutes; target the longest handoff first.</li></ul></article></section></>}

      {activeSection === "AI analyst" && <section className="ops-ai-layout"><article className="web-panel ops-ai-chat"><div className="ops-ai-intro"><span><LightningBoltIcon /></span><div><small>Property-aware operations AI</small><h2>Ask about {hotel.name}</h2><p>Answers are grounded in this hotel's requests, guests, feedback, and service metrics.</p></div></div><div className="ops-ai-answer"><span className="ai-avatar"><LightningBoltIcon /></span><p>{aiAnswer}</p></div><div className="ops-ai-prompts">{["Summarize today", "Show queue risks", "Review FTR", "What feedback needs a response?", "Summarize Maya Kapoor"].map((prompt) => <button key={prompt} onClick={() => runAiAnalysis(prompt)}>{prompt}</button>)}</div><div className="ops-ai-composer"><input value={aiQuery} onChange={(event) => setAiQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") runAiAnalysis(); }} placeholder="Ask for a guest, report, risk, or performance detail" aria-label="Ask Intellistay operations AI" /><button onClick={() => runAiAnalysis()}><PaperPlaneIcon /> Analyze</button></div></article><aside className="web-panel ops-ai-boundary"><span className="section-label">Safe operations boundary</span><h2>What the AI can do</h2><div className="web-control-list"><div><CheckCircledIcon /><span><strong>Analyze hotel data</strong><small>Requests, feedback, queues, and guest context for this property</small></span><em>Active</em></div><div><CheckCircledIcon /><span><strong>Prepare reports</strong><small>Summaries and exports remain visible to the signed-in hotel team</small></span><em>Active</em></div><div><CheckCircledIcon /><span><strong>Recommend actions</strong><small>Recovery, prioritization, staffing, and follow-up suggestions</small></span><em>Active</em></div><div><ClockIcon /><span><strong>External actions</strong><small>Email, compensation, dispatch, and cancellations require policy or approval</small></span><em className="pending">Gated</em></div></div></aside></section>}
    </main>{toast && <div className="ops-toast" role="status"><CheckCircledIcon />{toast}</div>}
  </div>;
}
