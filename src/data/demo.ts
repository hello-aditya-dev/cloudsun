/**
 * CloudSun Dental — demo data for Lumen Dental Care.
 * All data is fictional. No real patient information is used.
 */

import type {
  Appointment, AuditEntry, Automation, Call, Contact, Conversation,
  Integration, KnowledgeSource, Message, TeamMember, Workspace,
} from "@/types/domain";
import type { ChannelId } from "@/config/cloudsun";

export const workspace: Workspace = {
  id: "ws_lumen",
  name: "Lumen Dental Care",
  plan: "Practice",
  timezone: "Asia/Calcutta",
  demoMode: true,
};

export const team: TeamMember[] = [
  {
    id: "u_priya",
    name: "Priya Sharma",
    email: "priya@lumendental.example",
    role: "owner",
    avatarColor: "oklch(0.62 0.16 42)",
    initials: "PS",
    availability: "available",
    capacity: { current: 3, max: 8 },
    languages: ["English", "Hindi"],
    skills: ["Practice owner", "Dentist", "Implants"],
    department: "Clinical",
    callAvailable: true,
  },
  {
    id: "u_anita",
    name: "Anita Desai",
    email: "anita@lumendental.example",
    role: "manager",
    avatarColor: "oklch(0.45 0.08 155)",
    initials: "AD",
    availability: "busy",
    capacity: { current: 5, max: 6 },
    languages: ["English", "Hindi", "Marathi"],
    skills: ["Practice manager", "Scheduling", "Insurance"],
    department: "Administration",
    callAvailable: true,
  },
  {
    id: "u_meera",
    name: "Meera Iyer",
    email: "meera@lumendental.example",
    role: "agent",
    avatarColor: "oklch(0.50 0.10 250)",
    initials: "MI",
    availability: "available",
    capacity: { current: 2, max: 6 },
    languages: ["English", "Hindi", "Tamil"],
    skills: ["Front desk", "New-patient intake", "WhatsApp"],
    department: "Front desk",
    callAvailable: true,
  },
  {
    id: "u_rohan",
    name: "Rohan Mehta",
    email: "rohan@lumendental.example",
    role: "agent",
    avatarColor: "oklch(0.55 0.14 320)",
    initials: "RM",
    availability: "available",
    capacity: { current: 3, max: 6 },
    languages: ["English", "Hindi"],
    skills: ["Front desk", "Recall", "Treatment follow-up"],
    department: "Front desk",
    callAvailable: true,
  },
  {
    id: "u_leila",
    name: "Leila Fernandes",
    email: "leila@lumendental.example",
    role: "agent",
    avatarColor: "oklch(0.70 0.12 75)",
    initials: "LF",
    availability: "away",
    capacity: { current: 1, max: 6 },
    languages: ["English", "Portuguese"],
    skills: ["Treatment coordinator", "Financing"],
    department: "Treatment coordination",
    callAvailable: false,
  },
  {
    id: "u_dr_kapoor",
    name: "Dr. Anil Kapoor",
    email: "anil@lumendental.example",
    role: "read_only",
    avatarColor: "oklch(0.45 0.08 155)",
    initials: "AK",
    availability: "busy",
    capacity: { current: 0, max: 0 },
    languages: ["English", "Hindi"],
    skills: ["Dentist", "Root canals", "Crowns"],
    department: "Clinical",
    callAvailable: false,
  },
  {
    id: "u_dr_chen",
    name: "Dr. Mei Chen",
    email: "mei@lumendental.example",
    role: "read_only",
    avatarColor: "oklch(0.50 0.10 250)",
    initials: "MC",
    availability: "available",
    capacity: { current: 0, max: 0 },
    languages: ["English", "Mandarin"],
    skills: ["Dentist", "Cosmetic", "Invisalign"],
    department: "Clinical",
    callAvailable: false,
  },
  {
    id: "u_hyg_sara",
    name: "Sara Thomas",
    email: "sara@lumendental.example",
    role: "read_only",
    avatarColor: "oklch(0.55 0.14 150)",
    initials: "ST",
    availability: "offline",
    capacity: { current: 0, max: 0 },
    languages: ["English", "Malayalam"],
    skills: ["Hygienist", "Recall"],
    department: "Clinical",
    callAvailable: false,
  },
];

export const locations = [
  { id: "loc_central", name: "Lumen Dental Care — Central", address: "12 MG Road, Bengaluru", phone: "+91 80 4567 8900" },
  { id: "loc_north", name: "Lumen Dental Care — North", address: "45 Hebbal, Bengaluru", phone: "+91 80 4567 8901" },
  { id: "loc_riverside", name: "Lumen Dental Care — Riverside", address: "78 Indiranagar, Bengaluru", phone: "+91 80 4567 8902" },
];

const now = new Date("2026-07-12T10:00:00+05:30");
const iso = (d: Date) => d.toISOString();
const minsAgo = (m: number) => iso(new Date(now.getTime() - m * 60000));
const hoursAgo = (h: number) => iso(new Date(now.getTime() - h * 3600000));
const daysAgo = (d: number) => iso(new Date(now.getTime() - d * 86400000));

// ─── Patients & Leads (40+ fictional) ────────────────────────────────────────

function makePatient(
  id: string, name: string, patientType: "new" | "existing", leadStage: Contact["leadStage"],
  primaryChannel: ChannelId, phone: string, email: string, preferredLocation: string,
  preferredDentist: string, lastVisit: string | null, nextAppt: string | null,
  recallDue: string | null, insurance: string, treatmentInterest: string,
  tags: string[], notes: string, aiSummary: string, ownerId: string,
  sentiment: Contact["sentiment"] = "neutral", initials: string,
  avatarColor: string,
): Contact {
  // Derive typed dental fields from parameters
  const patientStatus: Contact["patientStatus"] =
    patientType === "new" ? (leadStage === "new" ? "new_lead" : "new_patient") : "existing_patient";

  const recallStatus: Contact["recallStatus"] = recallDue
    ? new Date(recallDue) < now
      ? tags.includes("recall-overdue")
        ? "overdue"
        : "due_now"
      : "due_soon"
    : "not_due";

  const waitlistStatus: Contact["waitlistStatus"] = tags.includes("waitlist")
    ? "waiting"
    : "not_on_waitlist";

  const treatmentFollowUpStatus: Contact["treatmentFollowUpStatus"] = tags.includes("treatment-follow-up")
    ? "follow_up_due"
    : "none";

  const paymentType: Contact["paymentType"] = insurance.startsWith("Self-pay")
    ? "self_pay"
    : "insured";

  return {
    id,
    name,
    company: undefined,
    identities: [
      { channel: "phone", handle: phone, verified: true },
      { channel: "email", handle: email, verified: patientType === "existing" },
    ],
    primaryChannel,
    lastInteraction: daysAgo(1),
    leadStage,
    ownerId,
    upcomingAppointmentId: nextAppt ?? undefined,
    sentiment,
    tags,
    notes,
    aiSummary,
    consent: { recorded: true, marketing: patientType === "existing" },
    avatarColor,
    initials,
    // Typed dental fields
    patientStatus,
    preferredName: name.split(" ")[0],
    preferredLocation,
    preferredDentist,
    lastVisitAt: lastVisit ?? undefined,
    nextAppointmentId: nextAppt ?? undefined,
    recallDueAt: recallDue ?? undefined,
    recallStatus,
    waitlistStatus,
    treatmentFollowUpStatus,
    insuranceProvider: insurance.startsWith("Self-pay") ? undefined : insurance.replace("Insured — ", ""),
    paymentType,
    dateOfBirthMasked: "XX/XX/XXXX",
    isMinor: false,
  };
}

export const contacts: Contact[] = [
  makePatient("p_1", "Aarav Patel", "new", "qualified", "phone", "+91 98xxx 12345", "aarav.patel@example.com", "Central", "Dr. Priya Sharma", null, null, null, "Self-pay", "Whitening", ["new-patient", "whitening"], "Called about whitening options. Interested in pricing.", "New lead interested in whitening. AI captured contact details and offered consultation.", "u_meera", "neutral", "AP", "oklch(0.62 0.16 42)"),
  makePatient("p_2", "Diya Krishnan", "new", "opportunity", "whatsapp", "+91 98xxx 22345", "diya.k@example.com", "North", "Dr. Mei Chen", null, null, null, "Insured — Star Health", "Invisalign", ["new-patient", "invisalign"], "Wants Invisalign consultation. Has insurance.", "Qualified Invisalign lead. Insurance verified. Awaiting consultation slot.", "u_leila", "positive", "DK", "oklch(0.45 0.08 155)"),
  makePatient("p_3", "Rohan Gupta", "existing", "customer", "phone", "+91 98xxx 32345", "rohan.g@example.com", "Central", "Dr. Anil Kapoor", daysAgo(45), null, daysAgo(-15), "Insured — HDFC Ergo", "Hygiene", ["recall-due", "existing"], "Due for hygiene recall. Prefers mornings.", "Due for hygiene recall in 15 days. AI will send reminder sequence.", "u_rohan", "neutral", "RG", "oklch(0.50 0.10 250)"),
  makePatient("p_4", "Saanvi Reddy", "existing", "customer", "whatsapp", "+91 98xxx 42345", "saanvi.r@example.com", "Riverside", "Dr. Priya Sharma", daysAgo(90), null, daysAgo(-30), "Self-pay", "Implant", ["recall-overdue", "existing", "implant"], "Overdue for recall. Has pending implant consultation.", "Recall overdue by 30 days. AI attempted contact — no response. Needs human follow-up.", "u_rohan", "neutral", "SR", "oklch(0.55 0.14 150)"),
  makePatient("p_5", "Kabir Singh", "new", "qualified", "phone", "+91 98xxx 52345", "kabir.s@example.com", "Central", "Any dentist", null, null, null, "Self-pay", "Emergency", ["new-patient", "emergency"], "Called with tooth pain. Non-emergency. Booked exam.", "New patient with tooth pain. AI screened for emergencies, booked new-patient exam.", "u_meera", "negative", "KS", "oklch(0.70 0.12 75)"),
  makePatient("p_6", "Ananya Nair", "existing", "customer", "email", "+91 98xxx 62345", "ananya.n@example.com", "North", "Dr. Mei Chen", daysAgo(120), null, daysAgo(-60), "Insured — ICICI Lombard", "Cosmetic", ["recall-overdue", "existing", "cosmetic"], "Overdue recall. Previously discussed veneers.", "Recall overdue 60 days. Previously expressed interest in veneers. Treatment follow-up needed.", "u_leila", "neutral", "AN", "oklch(0.62 0.16 42)"),
  makePatient("p_7", "Vikram Joshi", "existing", "customer", "phone", "+91 98xxx 72345", "vikram.j@example.com", "Central", "Dr. Anil Kapoor", daysAgo(30), null, daysAgo(30), "Insured — Bajaj Allianz", "Root canal", ["treatment-follow-up", "existing"], "Had consultation for root canal. Hasn't scheduled.", "Treatment follow-up: root canal consultation done 30 days ago, not yet scheduled. AI sending follow-up.", "u_leila", "neutral", "VJ", "oklch(0.45 0.08 155)"),
  makePatient("p_8", "Fatima Khan", "new", "new", "webchat", "+91 98xxx 82345", "fatima.k@example.com", "Riverside", "Any dentist", null, null, null, "Self-pay", "Check-up", ["new-patient", "web"], "Came via website chat. Wants a check-up.", "New web lead. AI answered FAQ and captured phone number.", "u_meera", "neutral", "FK", "oklch(0.50 0.10 250)"),
  makePatient("p_9", "Arjun Malhotra", "existing", "customer", "phone", "+91 98xxx 92345", "arjun.m@example.com", "Central", "Dr. Priya Sharma", daysAgo(15), null, daysAgo(75), "Self-pay", "Implant", ["existing", "implant", "treatment-follow-up"], "Completed implant consultation. Awaiting decision.", "Implant consultation done. Treatment estimate sent. Patient requested time to decide.", "u_leila", "positive", "AM", "oklch(0.55 0.14 320)"),
  makePatient("p_10", "Sara Pinto", "existing", "customer", "whatsapp", "+91 98xxx 03456", "sara.p@example.com", "North", "Sara Thomas (hygienist)", daysAgo(180), null, daysAgo(-90), "Insured — Star Health", "Hygiene", ["recall-overdue", "existing"], "Very overdue for hygiene. Responds on WhatsApp.", "Recall overdue 90 days. Prefers WhatsApp. AI will send sequence.", "u_rohan", "neutral", "SP", "oklch(0.70 0.12 75)"),
  makePatient("p_11", "Daniel Okafor", "new", "qualified", "email", "+91 98xxx 13456", "daniel.o@example.com", "Central", "Dr. Mei Chen", null, null, null, "Self-pay", "Consultation", ["new-patient", "lead"], "Emailed about consultation. Wants to know costs.", "New lead via email. AI drafted reply with consultation options.", "u_meera", "neutral", "DO", "oklch(0.62 0.16 42)"),
  makePatient("p_12", "Hiroshi Tanaka", "new", "opportunity", "email", "+91 98xxx 23456", "h.tanaka@example.com", "Riverside", "Dr. Mei Chen", null, null, null, "Self-pay", "Cosmetic", ["new-patient", "cosmetic"], "Interested in cosmetic consultation. International patient.", "Cosmetic lead. AI suggested consultation. Awaiting confirmation.", "u_leila", "positive", "HT", "oklch(0.45 0.08 155)"),
  makePatient("p_13", "Meera Krishnan", "existing", "customer", "phone", "+91 98xxx 33456", "meera.k@example.com", "Central", "Dr. Anil Kapoor", daysAgo(7), null, daysAgo(83), "Insured — HDFC Ergo", "Crown", ["existing", "treatment-follow-up"], "Crown consultation done. Needs to schedule.", "Treatment follow-up: crown consultation done. AI sending follow-up with financing info.", "u_leila", "neutral", "MK", "oklch(0.50 0.10 250)"),
  makePatient("p_14", "Karthik Raj", "new", "qualified", "whatsapp", "+91 98xxx 43456", "karthik.r@example.com", "North", "Any dentist", null, null, null, "Self-pay", "Whitening", ["new-patient", "whitening"], "WhatsApp enquiry about whitening cost.", "New WhatsApp lead. AI answered pricing from knowledge base.", "u_meera", "neutral", "KR", "oklch(0.55 0.14 150)"),
  makePatient("p_15", "Elena Petrova", "new", "new", "webchat", "+91 98xxx 53456", "elena.p@example.com", "Central", "Any dentist", null, null, null, "Self-pay", "Check-up", ["new-patient", "web"], "Website chat enquiry about new-patient process.", "New web lead. AI explained new-patient process and captured email.", "u_meera", "neutral", "EP", "oklch(0.70 0.12 75)"),
  makePatient("p_16", "Marcus Bélanger", "existing", "customer", "phone", "+91 98xxx 63456", "marcus.b@example.com", "Central", "Dr. Priya Sharma", daysAgo(60), null, daysAgo(0), "Self-pay", "Implant", ["recall-due", "existing", "implant"], "Due for recall. Has implant. VIP patient.", "VIP recall due now. AI will prioritize and offer preferred slots.", "u_anita", "positive", "MB", "oklch(0.62 0.16 42)"),
  makePatient("p_17", "Saanvi Patel", "existing", "customer", "phone", "+91 98xxx 73456", "saanvi.p@example.com", "North", "Dr. Anil Kapoor", daysAgo(20), null, daysAgo(-20), "Insured — ICICI Lombard", "Filling", ["recall-due", "existing"], "Due for recall soon. Prefers evenings.", "Recall due in 20 days. AI will send evening-slot reminders.", "u_rohan", "neutral", "SP", "oklch(0.45 0.08 155)"),
  makePatient("p_18", "Dev Sharma", "existing", "churned", "email", "+91 98xxx 83456", "dev.s@example.com", "Central", "Any dentist", daysAgo(365), null, daysAgo(-275), "Self-pay", "Check-up", ["recall-overdue", "existing", "churned"], "Hasn't visited in a year. Reactivation target.", "Lapsed patient — no visit in 365 days. AI reactivation sequence started.", "u_rohan", "neutral", "DS", "oklch(0.50 0.10 250)"),
  makePatient("p_19", "Leila Ahmed", "new", "qualified", "phone", "+91 98xxx 93456", "leila.a@example.com", "Riverside", "Dr. Mei Chen", null, null, null, "Insured — Star Health", "Invisalign", ["new-patient", "invisalign"], "Called about Invisalign. Has insurance.", "Invisalign lead with insurance. AI offered consultation.", "u_leila", "positive", "LA", "oklch(0.55 0.14 320)"),
  makePatient("p_20", "Rahul Verma", "existing", "customer", "whatsapp", "+91 98xxx 04567", "rahul.v@example.com", "Central", "Dr. Anil Kapoor", daysAgo(10), null, daysAgo(80), "Self-pay", "Root canal", ["existing", "treatment-follow-up"], "Root canal done. Needs post-op review.", "Post-op recall due. AI will schedule post-operative review.", "u_rohan", "neutral", "RV", "oklch(0.70 0.12 75)"),
  // Additional patients to reach 40+
  makePatient("p_21", "Priya Reddy", "existing", "customer", "phone", "+91 98xxx 14567", "priya.r@example.com", "North", "Sara Thomas", daysAgo(50), null, daysAgo(-10), "Insured", "Hygiene", ["recall-due", "existing"], "Due soon. Regular hygiene patient.", "Recall due in 10 days.", "u_rohan", "neutral", "PR", "oklch(0.62 0.16 42)"),
  makePatient("p_22", "Imran Khan", "new", "new", "webchat", "+91 98xxx 24567", "imran.k@example.com", "Central", "Any dentist", null, null, null, "Self-pay", "Emergency", ["new-patient", "emergency"], "Tooth pain enquiry via chat.", "New emergency enquiry. AI screened and booked exam.", "u_meera", "negative", "IK", "oklch(0.45 0.08 155)"),
  makePatient("p_23", "Nisha Agarwal", "existing", "customer", "email", "+91 98xxx 34567", "nisha.a@example.com", "Riverside", "Dr. Mei Chen", daysAgo(75), null, daysAgo(15), "Insured", "Cosmetic", ["recall-overdue", "existing"], "Overdue recall. Interested in veneers.", "Recall overdue. Treatment interest noted.", "u_leila", "neutral", "NA", "oklch(0.50 0.10 250)"),
  makePatient("p_24", "Thomas George", "existing", "customer", "phone", "+91 98xxx 44567", "thomas.g@example.com", "Central", "Dr. Anil Kapoor", daysAgo(25), null, daysAgo(65), "Self-pay", "Crown", ["existing", "treatment-follow-up"], "Crown consultation. Awaiting decision.", "Treatment follow-up pending.", "u_leila", "neutral", "TG", "oklch(0.55 0.14 150)"),
  makePatient("p_25", "Anjali Menon", "new", "qualified", "whatsapp", "+91 98xxx 54567", "anjali.m@example.com", "North", "Any dentist", null, null, null, "Self-pay", "Check-up", ["new-patient", "lead"], "WhatsApp new-patient enquiry.", "New lead captured.", "u_meera", "neutral", "AM", "oklch(0.70 0.12 75)"),
  makePatient("p_26", "Rajesh Kumar", "existing", "customer", "phone", "+91 98xxx 64567", "rajesh.k@example.com", "Central", "Dr. Priya Sharma", daysAgo(100), null, daysAgo(-40), "Insured", "Hygiene", ["recall-overdue", "existing"], "Overdue 40 days.", "Recall overdue.", "u_rohan", "neutral", "RK", "oklch(0.62 0.16 42)"),
  makePatient("p_27", "Zara Sheikh", "new", "opportunity", "email", "+91 98xxx 74567", "zara.s@example.com", "Riverside", "Dr. Mei Chen", null, null, null, "Self-pay", "Whitening", ["new-patient", "whitening"], "Emailed about whitening.", "Whitening lead.", "u_meera", "neutral", "ZS", "oklch(0.45 0.08 155)"),
  makePatient("p_28", "Vivek Nair", "existing", "customer", "phone", "+91 98xxx 84567", "vivek.n@example.com", "North", "Dr. Anil Kapoor", daysAgo(40), null, daysAgo(50), "Self-pay", "Filling", ["recall-due", "existing"], "Due in 50 days.", "Recall due soon.", "u_rohan", "neutral", "VN", "oklch(0.50 0.10 250)"),
  makePatient("p_29", "Olivia Bennett", "new", "qualified", "webchat", "+91 98xxx 94567", "olivia.b@example.com", "Central", "Any dentist", null, null, null, "Self-pay", "Consultation", ["new-patient", "lead"], "Web chat consultation enquiry.", "New web lead.", "u_meera", "neutral", "OB", "oklch(0.55 0.14 320)"),
  makePatient("p_30", "Arnav Gupta", "existing", "customer", "whatsapp", "+91 98xxx 05678", "arnav.g@example.com", "Riverside", "Dr. Mei Chen", daysAgo(200), null, daysAgo(-110), "Insured", "Implant", ["recall-overdue", "existing", "churned"], "Very overdue. Reactivation.", "Lapsed patient.", "u_rohan", "neutral", "AG", "oklch(0.70 0.12 75)"),
  makePatient("p_31", "Kavya Rao", "new", "new", "phone", "+91 98xxx 15678", "kavya.r@example.com", "Central", "Any dentist", null, null, null, "Self-pay", "Check-up", ["new-patient"], "New phone enquiry.", "New lead.", "u_meera", "neutral", "KR", "oklch(0.62 0.16 42)"),
  makePatient("p_32", "Samuel D'Souza", "existing", "customer", "email", "+91 98xxx 25678", "samuel.d@example.com", "North", "Dr. Anil Kapoor", daysAgo(35), null, daysAgo(55), "Insured", "Crown", ["existing", "treatment-follow-up"], "Crown follow-up.", "Treatment follow-up.", "u_leila", "neutral", "SD", "oklch(0.45 0.08 155)"),
  makePatient("p_33", "Tara Krishnan", "existing", "customer", "phone", "+91 98xxx 35678", "tara.k@example.com", "Central", "Sara Thomas", daysAgo(65), null, daysAgo(25), "Self-pay", "Hygiene", ["recall-overdue", "existing"], "Overdue 25 days.", "Recall overdue.", "u_rohan", "neutral", "TK", "oklch(0.50 0.10 250)"),
  makePatient("p_34", "Rishi Kapoor", "new", "qualified", "whatsapp", "+91 98xxx 45678", "rishi.k@example.com", "Riverside", "Any dentist", null, null, null, "Self-pay", "Emergency", ["new-patient", "emergency"], "Tooth pain.", "Emergency enquiry.", "u_meera", "negative", "RK", "oklch(0.55 0.14 150)"),
  makePatient("p_35", "Maya Patel", "existing", "customer", "phone", "+91 98xxx 55678", "maya.p@example.com", "North", "Dr. Priya Sharma", daysAgo(15), null, daysAgo(75), "Insured", "Check-up", ["existing", "recall-due"], "Due in 75 days.", "Recall scheduled.", "u_rohan", "neutral", "MP", "oklch(0.70 0.12 75)"),
  makePatient("p_36", "Jordan Lee", "new", "new", "webchat", "+91 98xxx 65678", "jordan.l@example.com", "Central", "Any dentist", null, null, null, "Self-pay", "Consultation", ["new-patient"], "Web enquiry.", "New lead.", "u_meera", "neutral", "JL", "oklch(0.62 0.16 42)"),
  makePatient("p_37", "Ishaan Bose", "existing", "customer", "email", "+91 98xxx 75678", "ishaan.b@example.com", "Riverside", "Dr. Mei Chen", daysAgo(80), null, daysAgo(10), "Self-pay", "Cosmetic", ["recall-due", "existing"], "Due soon.", "Recall due.", "u_rohan", "neutral", "IB", "oklch(0.45 0.08 155)"),
  makePatient("p_38", "Nora Ferguson", "new", "opportunity", "phone", "+91 98xxx 85678", "nora.f@example.com", "Central", "Dr. Mei Chen", null, null, null, "Self-pay", "Invisalign", ["new-patient", "invisalign"], "Invisalign interest.", "Invisalign lead.", "u_leila", "positive", "NF", "oklch(0.50 0.10 250)"),
  makePatient("p_39", "Aditya Verma", "existing", "customer", "whatsapp", "+91 98xxx 95678", "aditya.v@example.com", "North", "Dr. Anil Kapoor", daysAgo(5), null, daysAgo(85), "Insured", "Filling", ["existing"], "Recent visit.", "Recent patient.", "u_meera", "positive", "AV", "oklch(0.55 0.14 320)"),
  makePatient("p_40", "Grace Mathew", "existing", "customer", "phone", "+91 98xxx 06789", "grace.m@example.com", "Central", "Sara Thomas", daysAgo(150), null, daysAgo(-60), "Self-pay", "Hygiene", ["recall-overdue", "existing"], "Very overdue.", "Recall overdue 60 days.", "u_rohan", "neutral", "GM", "oklch(0.70 0.12 75)"),
  makePatient("p_41", "Arnav Reddy", "new", "spam", "webchat", "+91 98xxx 16789", "arnav.r@example.com", "Central", "Any dentist", null, null, null, "Self-pay", "Other", ["spam"], "Suspicious enquiry.", "Marked as spam.", "u_meera", "neutral", "AR", "oklch(0.62 0.16 42)"),
  makePatient("p_42", "Lakshmi Iyer", "existing", "customer", "phone", "+91 98xxx 26789", "lakshmi.i@example.com", "Riverside", "Dr. Priya Sharma", daysAgo(12), null, daysAgo(78), "Insured", "Check-up", ["existing", "recall-due"], "Due in 78 days.", "Recall scheduled.", "u_rohan", "positive", "LI", "oklch(0.45 0.08 155)"),
];

// ─── Conversations (60+) ──────────────────────────────────────────────────────

function makeConv(
  id: string, contactId: string, contactName: string, channel: ChannelId,
  subject: string, preview: string, lastAt: string, unread: number,
  status: Conversation["status"], priority: Conversation["priority"],
  assigneeId: string | undefined, aiHandling: boolean, slaMinutes: number,
  slaBreached: boolean, tags: string[], hasAppointment: boolean, hasLead: boolean,
  sentiment: Conversation["sentiment"], aiConfidence?: number,
): Conversation {
  return {
    id, contactId, contactName, channel, subject, preview, lastAt, unread,
    status, priority, assigneeId, aiHandling, slaMinutes, slaBreached,
    tags, hasAppointment, hasLead, sentiment, aiConfidence,
  };
}

export const conversations: Conversation[] = [
  makeConv("cv_1", "p_5", "Kabir Singh", "phone", "Tooth pain — new patient", "I've had tooth pain for two days and I'm not sure what to do.", minsAgo(8), 2, "waiting", "urgent", "u_meera", false, 4, false, ["emergency", "new-patient"], false, true, "negative", 0.42),
  makeConv("cv_2", "p_1", "Aarav Patel", "phone", "Whitening enquiry", "(AI) Captured contact details. Offered whitening consultation.", minsAgo(22), 0, "closed", "normal", "u_meera", true, 60, false, ["new-patient", "whitening"], true, true, "positive", 0.91),
  makeConv("cv_3", "p_3", "Rohan Gupta", "whatsapp", "Recall reminder response", "Yes, I'd like to book my cleaning. Mornings work best.", minsAgo(35), 1, "ai_handling", "normal", undefined, true, 30, false, ["recall", "existing"], true, false, "positive", 0.88),
  makeConv("cv_4", "p_2", "Diya Krishnan", "whatsapp", "Invisalign consultation", "Do you offer Invisalign? I have insurance with Star Health.", minsAgo(46), 1, "needs_approval", "high", "u_leila", true, 12, false, ["new-patient", "invisalign"], false, true, "neutral", 0.76),
  makeConv("cv_5", "p_7", "Vikram Joshi", "phone", "Root canal follow-up", "(AI) Follow-up sent for root canal consultation. Awaiting response.", hoursAgo(2), 0, "closed", "normal", "u_leila", true, 90, false, ["treatment-follow-up"], false, false, "neutral", 0.93),
  makeConv("cv_6", "p_4", "Saanvi Reddy", "whatsapp", "Recall — no response", "(AI) Recall sequence sent. No response after 3 attempts.", hoursAgo(3), 0, "mine", "normal", "u_rohan", false, 120, false, ["recall-overdue"], false, false, "neutral", 0.81),
  makeConv("cv_7", "p_9", "Arjun Malhotra", "phone", "Implant consultation follow-up", "(AI) Follow-up sent with financing information. Patient requested time.", hoursAgo(5), 0, "closed", "high", "u_leila", true, 60, false, ["treatment-follow-up", "implant"], false, false, "positive", 0.95),
  makeConv("cv_8", "p_8", "Fatima Khan", "webchat", "New-patient check-up", "Hi, I'd like to book a check-up. I'm a new patient.", hoursAgo(6), 0, "ai_handling", "normal", undefined, true, 180, false, ["new-patient", "web"], false, true, "neutral", 0.87),
  makeConv("cv_9", "p_10", "Sara Pinto", "whatsapp", "Recall — 90 days overdue", "(AI) Reactivation sequence started. WhatsApp preferred.", hoursAgo(7), 0, "closed", "normal", "u_rohan", true, 240, false, ["recall-overdue"], false, false, "neutral", 0.79),
  makeConv("cv_10", "p_11", "Daniel Okafor", "email", "Consultation pricing", "Could you send me your consultation fees?", hoursAgo(8), 0, "needs_approval", "normal", "u_meera", true, 300, true, ["new-patient", "email"], false, true, "neutral", 0.72),
  makeConv("cv_11", "p_12", "Hiroshi Tanaka", "email", "Cosmetic consultation", "(AI draft) Hello Hiroshi, thank you for your interest in cosmetic services...", daysAgo(1), 0, "needs_approval", "normal", "u_leila", true, 480, true, ["new-patient", "cosmetic"], false, true, "positive", 0.79),
  makeConv("cv_12", "p_13", "Meera Krishnan", "phone", "Crown follow-up", "(AI) Follow-up sent for crown consultation.", daysAgo(1), 0, "closed", "normal", "u_leila", true, 360, false, ["treatment-follow-up"], false, false, "neutral", 0.92),
  makeConv("cv_13", "p_14", "Karthik Raj", "whatsapp", "Whitening cost", "How much is whitening?", daysAgo(1), 0, "closed", "low", undefined, true, 360, false, ["new-patient", "whitening"], false, true, "neutral", 0.91),
  makeConv("cv_14", "p_15", "Elena Petrova", "webchat", "New-patient process", "What do I need to bring to my first appointment?", daysAgo(1), 0, "closed", "low", undefined, true, 360, false, ["new-patient", "web"], false, true, "positive", 0.89),
  makeConv("cv_15", "p_16", "Marcus Bélanger", "phone", "VIP recall", "(AI) Recall offered preferred morning slots. Patient confirmed.", daysAgo(1), 0, "closed", "high", "u_anita", true, 360, false, ["recall-due", "VIP"], true, false, "positive", 0.95),
  makeConv("cv_16", "p_17", "Saanvi Patel", "phone", "Recall scheduling", "(AI) Recall reminder sent. Patient prefers evening slots.", daysAgo(2), 0, "closed", "normal", "u_rohan", true, 480, false, ["recall-due"], true, false, "neutral", 0.93),
  makeConv("cv_17", "p_18", "Dev Sharma", "email", "Reactivation", "(AI) Reactivation email sent. No response yet.", daysAgo(2), 0, "open", "low", "u_rohan", false, 0, true, ["recall-overdue", "churned"], false, false, "neutral", 0.68),
  makeConv("cv_18", "p_19", "Leila Ahmed", "phone", "Invisalign with insurance", "(AI) Invisalign consultation offered. Insurance verified.", daysAgo(2), 0, "closed", "normal", "u_leila", true, 480, false, ["new-patient", "invisalign"], true, true, "positive", 0.90),
  makeConv("cv_19", "p_20", "Rahul Verma", "whatsapp", "Post-op check", "When should I come for my post-op review?", daysAgo(2), 0, "closed", "normal", undefined, true, 480, false, ["treatment-follow-up"], true, false, "neutral", 0.88),
  makeConv("cv_20", "p_22", "Imran Khan", "webchat", "Tooth pain — chat", "My tooth hurts and I'm not sure if it's an emergency.", minsAgo(15), 1, "ai_handling", "urgent", undefined, true, 30, false, ["emergency", "new-patient"], false, true, "negative", 0.65),
];

// Add more conversations to reach 60
for (let i = 21; i <= 60; i++) {
  const patient = contacts[i % contacts.length];
  conversations.push(
    makeConv(
      `cv_${i}`, patient.id, patient.name, "email",
      `Follow-up — ${patient.tags[0] ?? "general"}`,
      "(AI) Automated follow-up sent.",
      daysAgo(i % 7),
      0, "closed", "normal", "u_rohan", true,
      480, false, patient.tags, false, false, "neutral", 0.85,
    ),
  );
}

// ─── Messages ──────────────────────────────────────────────────────────────────

export const messagesByConversation: Record<string, Message[]> = {
  cv_1: [
    { id: "m1", conversationId: "cv_1", author: "customer", channel: "phone", authorName: "Kabir Singh", body: "Hi, I've had tooth pain for two days. Can I see someone today?", createdAt: minsAgo(20), status: "read" },
    { id: "m2", conversationId: "cv_1", author: "ai", channel: "phone", authorName: "CloudSun AI (simulated)", body: "I'm sorry to hear about your pain. Before we book, I need to check: are you experiencing any severe swelling, difficulty breathing, or uncontrolled bleeding?", createdAt: minsAgo(19), aiConfidence: 0.88, status: "read", kind: "message" },
    { id: "m3", conversationId: "cv_1", author: "customer", channel: "phone", authorName: "Kabir Singh", body: "No, nothing like that. Just pain when I chew.", createdAt: minsAgo(18), status: "read" },
    { id: "m4", conversationId: "cv_1", author: "ai", channel: "phone", authorName: "CloudSun AI (simulated)", body: "Thank you. That doesn't sound like an emergency, but I'd like to get you seen. Are you a new or existing patient?", createdAt: minsAgo(17), aiConfidence: 0.91, status: "read", kind: "message" },
    { id: "m5", conversationId: "cv_1", author: "customer", channel: "phone", authorName: "Kabir Singh", body: "New patient.", createdAt: minsAgo(8), status: "delivered" },
  ],
  cv_2: [
    { id: "m1", conversationId: "cv_2", author: "customer", channel: "phone", authorName: "Aarav Patel", body: "Hi, I'm interested in teeth whitening. How much does it cost?", createdAt: minsAgo(30), status: "read" },
    { id: "m2", conversationId: "cv_2", author: "ai", channel: "phone", authorName: "CloudSun AI (simulated)", body: "Hi Aarav! Our whitening treatment is $350 for a single session or $600 for a full package. Would you like to book a whitening appointment? I'll just need your phone number and preferred location.", createdAt: minsAgo(28), aiConfidence: 0.91, status: "read", kind: "message" },
    { id: "m3", conversationId: "cv_2", author: "customer", channel: "phone", authorName: "Aarav Patel", body: "Yes please. Central location. My number is +91 98xxx 12345.", createdAt: minsAgo(25), status: "read" },
    { id: "m4", conversationId: "cv_2", author: "ai", channel: "phone", authorName: "CloudSun AI (simulated)", body: "Booked! I've scheduled your whitening consultation at Lumen Dental Care — Central. A confirmation has been sent to your phone. We look forward to seeing you!", createdAt: minsAgo(22), aiConfidence: 0.93, status: "read", kind: "message" },
  ],
  cv_3: [
    { id: "m1", conversationId: "cv_3", author: "ai", channel: "whatsapp", authorName: "CloudSun AI (simulated)", body: "Hi Rohan! You're due for your hygiene cleaning. Would you like to book? We have morning slots available this week.", createdAt: minsAgo(60), aiConfidence: 0.92, status: "read", kind: "message" },
    { id: "m2", conversationId: "cv_3", author: "customer", channel: "whatsapp", authorName: "Rohan Gupta", body: "Yes, I'd like to book my cleaning. Mornings work best.", createdAt: minsAgo(35), status: "delivered" },
  ],
  cv_20: [
    { id: "m1", conversationId: "cv_20", author: "customer", channel: "webchat", authorName: "Imran Khan", body: "My tooth hurts and I'm not sure if it's an emergency.", createdAt: minsAgo(18), status: "read" },
    { id: "m2", conversationId: "cv_20", author: "ai", channel: "webchat", authorName: "CloudSun AI (simulated)", body: "I understand tooth pain can be worrying. Let me check: are you experiencing severe facial swelling, difficulty breathing, uncontrolled bleeding, or a major injury?", createdAt: minsAgo(17), aiConfidence: 0.85, status: "read", kind: "message" },
    { id: "m3", conversationId: "cv_20", author: "customer", channel: "webchat", authorName: "Imran Khan", body: "No, just pain. But it's getting worse.", createdAt: minsAgo(15), status: "delivered" },
  ],
};

// ─── Calls ──────────────────────────────────────────────────────────────────────

export const calls: Call[] = [
  {
    id: "call_1", contactId: "p_5", contactName: "Kabir Singh", phone: "+91 98xxx 52345",
    direction: "incoming", status: "live", handler: "ai", startedAt: minsAgo(3), durationSec: 184,
    sentiment: "negative", hasRecording: true, consent: true,
    transcript: [
      { id: "t1", speaker: "ai", text: "Thank you for calling Lumen Dental Care, this is Sunny. How can I help you today?", at: minsAgo(3), confidence: 0.94 },
      { id: "t2", speaker: "caller", text: "I've had tooth pain for two days.", at: minsAgo(2), confidence: 0.89 },
      { id: "t3", speaker: "ai", text: "I'm sorry to hear that. Before we book, are you experiencing severe swelling, difficulty breathing, or uncontrolled bleeding?", at: minsAgo(2), confidence: 0.91 },
      { id: "t4", speaker: "caller", text: "No, nothing like that.", at: minsAgo(1), confidence: 0.95 },
      { id: "t5", speaker: "ai", text: "Thank you. That doesn't sound like an emergency. Are you a new or existing patient?", at: minsAgo(1), confidence: 0.93 },
    ],
    topics: ["tooth pain", "new patient", "emergency screening"],
    qualityFlags: ["AI confidence dropping on pain description"],
  },
  {
    id: "call_2", contactId: "p_2", contactName: "Diya Krishnan", phone: "+91 98xxx 22345",
    direction: "incoming", status: "completed", handler: "ai", startedAt: hoursAgo(2), durationSec: 312,
    outcome: "Consultation booked", sentiment: "positive", hasRecording: true, consent: true,
    aiSummary: "New patient called about Invisalign. AI screened for emergencies, verified insurance, booked consultation.",
    transcript: [
      { id: "t1", speaker: "ai", text: "Thank you for calling Lumen Dental Care, this is Sunny.", at: hoursAgo(2), confidence: 0.95 },
      { id: "t2", speaker: "caller", text: "I'd like to know about Invisalign.", at: hoursAgo(2), confidence: 0.93 },
      { id: "t3", speaker: "ai", text: "We offer Invisalign consultations. Do you have dental insurance?", at: hoursAgo(2), confidence: 0.92 },
    ],
    topics: ["invisalign", "new patient", "insurance"],
  },
  {
    id: "call_3", contactId: "p_9", contactName: "Arjun Malhotra", phone: "+91 98xxx 92345",
    direction: "incoming", status: "completed", handler: "ai", startedAt: hoursAgo(5), durationSec: 264,
    outcome: "Follow-up scheduled", sentiment: "positive", hasRecording: true, consent: true,
    aiSummary: "Implant consultation follow-up. AI sent financing information. Patient requested time to decide.",
    transcript: [], topics: ["implant", "follow-up"],
  },
  {
    id: "call_4", contactId: "p_16", contactName: "Marcus Bélanger", phone: "+91 98xxx 63456",
    direction: "incoming", status: "completed", handler: "ai", startedAt: daysAgo(1), durationSec: 198,
    outcome: "Recall booked", sentiment: "positive", hasRecording: true, consent: true,
    aiSummary: "VIP recall. AI offered morning slots. Patient confirmed.",
    transcript: [], topics: ["recall", "VIP"],
  },
  {
    id: "call_5", contactId: "p_11", contactName: "Daniel Okafor", phone: "+91 98xxx 13456",
    direction: "missed", status: "missed", handler: "ai", startedAt: hoursAgo(9), durationSec: 0,
    sentiment: "unknown", hasRecording: false, consent: false,
    aiSummary: "Missed call. AI sent WhatsApp follow-up.",
    transcript: [], topics: ["missed", "follow-up"],
  },
];

// ─── Appointments ──────────────────────────────────────────────────────────────

const today = new Date("2026-07-12T10:00:00+05:30");
const at = (dayOffset: number, h: number, m = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return iso(d);
};

export const appointments: Appointment[] = [
  { id: "ap_1", contactId: "p_1", contactName: "Aarav Patel", title: "Whitening consultation", startAt: at(2, 11, 0), endAt: at(2, 12, 30), status: "confirmed", source: "phone", assigneeId: "u_dr_chen", channel: "phone", timezone: "Asia/Calcutta", type: "Whitening", location: "Lumen Dental Care — Central" },
  { id: "ap_2", contactId: "p_5", contactName: "Kabir Singh", title: "New-patient examination", startAt: at(1, 14, 0), endAt: at(1, 14, 45), status: "requested", source: "phone", assigneeId: "u_priya", channel: "phone", timezone: "Asia/Calcutta", type: "New-patient exam", location: "Lumen Dental Care — Central", notes: "Tooth pain. Non-emergency." },
  { id: "ap_3", contactId: "p_2", contactName: "Diya Krishnan", title: "Invisalign consultation", startAt: at(3, 15, 0), endAt: at(3, 16, 0), status: "confirmed", source: "phone", assigneeId: "u_dr_chen", channel: "phone", timezone: "Asia/Calcutta", type: "Invisalign consultation", location: "Lumen Dental Care — North" },
  { id: "ap_4", contactId: "p_3", contactName: "Rohan Gupta", title: "Hygiene cleaning", startAt: at(5, 9, 30), endAt: at(5, 10, 30), status: "confirmed", source: "whatsapp", assigneeId: "u_hyg_sara", channel: "whatsapp", timezone: "Asia/Calcutta", type: "Hygiene cleaning", location: "Lumen Dental Care — Central" },
  { id: "ap_5", contactId: "p_16", contactName: "Marcus Bélanger", title: "Recall — implant check", startAt: at(4, 10, 0), endAt: at(4, 11, 0), status: "confirmed", source: "phone", assigneeId: "u_priya", channel: "phone", timezone: "Asia/Calcutta", type: "Existing-patient exam", location: "Lumen Dental Care — Central" },
  { id: "ap_6", contactId: "p_19", contactName: "Leila Ahmed", title: "Invisalign consultation", startAt: at(6, 11, 0), endAt: at(6, 12, 0), status: "requested", source: "phone", assigneeId: "u_dr_chen", channel: "phone", timezone: "Asia/Calcutta", type: "Invisalign consultation", location: "Lumen Dental Care — Riverside" },
  { id: "ap_7", contactId: "p_20", contactName: "Rahul Verma", title: "Post-operative review", startAt: at(2, 16, 0), endAt: at(2, 16, 20), status: "requested", source: "whatsapp", assigneeId: "u_dr_kapoor", channel: "whatsapp", timezone: "Asia/Calcutta", type: "Post-op review", location: "Lumen Dental Care — Central" },
  { id: "ap_8", contactId: "p_17", contactName: "Saanvi Patel", title: "Recall — hygiene", startAt: at(7, 17, 0), endAt: at(7, 18, 0), status: "requested", source: "phone", assigneeId: "u_hyg_sara", channel: "phone", timezone: "Asia/Calcutta", type: "Hygiene cleaning", location: "Lumen Dental Care — North" },
];

// ─── Recall cases ──────────────────────────────────────────────────────────────

export interface RecallCase {
  id: string;
  patientId: string;
  patientName: string;
  status: "due_now" | "due_30" | "overdue_30" | "overdue_90" | "contacted" | "responded" | "booked" | "declined" | "do_not_contact";
  recallDue: string;
  lastContact: string | null;
  channel: ChannelId;
  assigneeId: string;
  outcome: string;
  nextAction: string;
}

export const recallCases: RecallCase[] = [
  { id: "rc_1", patientId: "p_4", patientName: "Saanvi Reddy", status: "overdue_30", recallDue: daysAgo(30), lastContact: daysAgo(7), channel: "whatsapp", assigneeId: "u_rohan", outcome: "No response", nextAction: "Human call task" },
  { id: "rc_2", patientId: "p_3", patientName: "Rohan Gupta", status: "due_30", recallDue: daysAgo(-15), lastContact: daysAgo(1), channel: "whatsapp", assigneeId: "u_rohan", outcome: "Reminder sent", nextAction: "Awaiting response" },
  { id: "rc_3", patientId: "p_6", patientName: "Ananya Nair", status: "overdue_60" as any, recallDue: daysAgo(60), lastContact: daysAgo(14), channel: "email", assigneeId: "u_leila", outcome: "Email sent, no response", nextAction: "Phone call" },
  { id: "rc_4", patientId: "p_10", patientName: "Sara Pinto", status: "overdue_90", recallDue: daysAgo(90), lastContact: daysAgo(3), channel: "whatsapp", assigneeId: "u_rohan", outcome: "Reactivation sequence", nextAction: "Human call task" },
  { id: "rc_5", patientId: "p_16", patientName: "Marcus Bélanger", status: "booked", recallDue: daysAgo(0), lastContact: daysAgo(1), channel: "phone", assigneeId: "u_anita", outcome: "Booked", nextAction: "Complete" },
  { id: "rc_6", patientId: "p_17", patientName: "Saanvi Patel", status: "booked", recallDue: daysAgo(-20), lastContact: daysAgo(2), channel: "phone", assigneeId: "u_rohan", outcome: "Booked evening slot", nextAction: "Complete" },
  { id: "rc_7", patientId: "p_18", patientName: "Dev Sharma", status: "overdue_90", recallDue: daysAgo(275), lastContact: daysAgo(30), channel: "email", assigneeId: "u_rohan", outcome: "Reactivation attempt", nextAction: "Do-not-contact review" },
  { id: "rc_8", patientId: "p_21", patientName: "Priya Reddy", status: "due_30", recallDue: daysAgo(-10), lastContact: null, channel: "phone", assigneeId: "u_rohan", outcome: "Not yet contacted", nextAction: "Send reminder" },
  { id: "rc_9", patientId: "p_23", patientName: "Nisha Agarwal", status: "overdue_30", recallDue: daysAgo(40), lastContact: daysAgo(5), channel: "email", assigneeId: "u_leila", outcome: "Email sent", nextAction: "Follow-up call" },
  { id: "rc_10", patientId: "p_26", patientName: "Rajesh Kumar", status: "overdue_30", recallDue: daysAgo(40), lastContact: daysAgo(10), channel: "phone", assigneeId: "u_rohan", outcome: "No response", nextAction: "WhatsApp" },
  { id: "rc_11", patientId: "p_28", patientName: "Vivek Nair", status: "due_30", recallDue: daysAgo(-50), lastContact: null, channel: "phone", assigneeId: "u_rohan", outcome: "Not contacted", nextAction: "Send reminder" },
  { id: "rc_12", patientId: "p_33", patientName: "Tara Krishnan", status: "overdue_30", recallDue: daysAgo(25), lastContact: daysAgo(8), channel: "phone", assigneeId: "u_rohan", outcome: "No response", nextAction: "Human call" },
];

// ─── Waitlist entries ─────────────────────────────────────────────────────────

export interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  preferredLocation: string;
  preferredProvider: string;
  appointmentType: string;
  availability: string;
  contactPreference: ChannelId;
  lastOutreach: string | null;
  acceptanceState: "waiting" | "invited" | "accepted" | "declined" | "filled";
  matchReason: string;
}

export const waitlistEntries: WaitlistEntry[] = [
  { id: "wl_1", patientId: "p_3", patientName: "Rohan Gupta", preferredLocation: "Central", preferredProvider: "Any", appointmentType: "Hygiene cleaning", availability: "Mornings, weekdays", contactPreference: "whatsapp", lastOutreach: daysAgo(2), acceptanceState: "invited", matchReason: "Same appointment type and location" },
  { id: "wl_2", patientId: "p_10", patientName: "Sara Pinto", preferredLocation: "North", preferredProvider: "Sara Thomas", appointmentType: "Hygiene cleaning", availability: "Any", contactPreference: "whatsapp", lastOutreach: daysAgo(3), acceptanceState: "waiting", matchReason: "Preferred hygienist" },
  { id: "wl_3", patientId: "p_21", patientName: "Priya Reddy", preferredLocation: "North", preferredProvider: "Any", appointmentType: "Hygiene cleaning", availability: "Evenings", contactPreference: "phone", lastOutreach: null, acceptanceState: "waiting", matchReason: "Same location" },
  { id: "wl_4", patientId: "p_8", patientName: "Fatima Khan", preferredLocation: "Riverside", preferredProvider: "Any", appointmentType: "New-patient exam", availability: "Weekends", contactPreference: "webchat", lastOutreach: daysAgo(1), acceptanceState: "invited", matchReason: "New-patient slot" },
  { id: "wl_5", patientId: "p_14", patientName: "Karthik Raj", preferredLocation: "Central", preferredProvider: "Any", appointmentType: "Whitening", availability: "Any", contactPreference: "whatsapp", lastOutreach: null, acceptanceState: "waiting", matchReason: "Same type" },
  { id: "wl_6", patientId: "p_25", patientName: "Anjali Menon", preferredLocation: "North", preferredProvider: "Any", appointmentType: "Check-up", availability: "Mornings", contactPreference: "whatsapp", lastOutreach: daysAgo(4), acceptanceState: "declined", matchReason: "Same location" },
  { id: "wl_7", patientId: "p_29", patientName: "Olivia Bennett", preferredLocation: "Central", preferredProvider: "Any", appointmentType: "Consultation", availability: "Any", contactPreference: "webchat", lastOutreach: null, acceptanceState: "waiting", matchReason: "Same type" },
  { id: "wl_8", patientId: "p_36", patientName: "Jordan Lee", preferredLocation: "Central", preferredProvider: "Any", appointmentType: "Consultation", availability: "Evenings", contactPreference: "webchat", lastOutreach: daysAgo(1), acceptanceState: "invited", matchReason: "Same location" },
  { id: "wl_9", patientId: "p_40", patientName: "Grace Mathew", preferredLocation: "Central", preferredProvider: "Sara Thomas", appointmentType: "Hygiene cleaning", availability: "Any", contactPreference: "phone", lastOutreach: null, acceptanceState: "waiting", matchReason: "Preferred hygienist" },
  { id: "wl_10", patientId: "p_42", patientName: "Lakshmi Iyer", preferredLocation: "Riverside", preferredProvider: "Dr. Priya Sharma", appointmentType: "Check-up", availability: "Mornings", contactPreference: "phone", lastOutreach: daysAgo(2), acceptanceState: "accepted", matchReason: "Same provider" },
];

// ─── Treatment follow-up cases ─────────────────────────────────────────────────

export interface TreatmentFollowUp {
  id: string;
  patientId: string;
  patientName: string;
  treatmentType: string;
  estimatedValue: number;
  stage: "follow_up_due" | "first_message" | "patient_responded" | "question_pending" | "coordinator_required" | "appointment_booked" | "not_ready" | "declined" | "closed";
  lastContact: string | null;
  nextAction: string;
  assigneeId: string;
}

export const treatmentFollowUps: TreatmentFollowUp[] = [
  { id: "tf_1", patientId: "p_7", patientName: "Vikram Joshi", treatmentType: "Root canal", estimatedValue: 1200, stage: "first_message", lastContact: daysAgo(2), nextAction: "Awaiting response", assigneeId: "u_leila" },
  { id: "tf_2", patientId: "p_9", patientName: "Arjun Malhotra", treatmentType: "Implant", estimatedValue: 4500, stage: "question_pending", lastContact: daysAgo(1), nextAction: "Answer financing question", assigneeId: "u_leila" },
  { id: "tf_3", patientId: "p_13", patientName: "Meera Krishnan", treatmentType: "Crown", estimatedValue: 1400, stage: "follow_up_due", lastContact: daysAgo(7), nextAction: "Send first follow-up", assigneeId: "u_leila" },
  { id: "tf_4", patientId: "p_24", patientName: "Thomas George", treatmentType: "Crown", estimatedValue: 1300, stage: "coordinator_required", lastContact: daysAgo(3), nextAction: "Leila to call patient", assigneeId: "u_leila" },
  { id: "tf_5", patientId: "p_6", patientName: "Ananya Nair", treatmentType: "Veneers", estimatedValue: 3200, stage: "patient_responded", lastContact: daysAgo(2), nextAction: "Offer consultation", assigneeId: "u_leila" },
  { id: "tf_6", patientId: "p_32", patientName: "Samuel D'Souza", treatmentType: "Crown", estimatedValue: 1500, stage: "follow_up_due", lastContact: null, nextAction: "Send first follow-up", assigneeId: "u_leila" },
  { id: "tf_7", patientId: "p_37", patientName: "Ishaan Bose", treatmentType: "Cosmetic", estimatedValue: 2800, stage: "not_ready", lastContact: daysAgo(14), nextAction: "Pause — patient not ready", assigneeId: "u_leila" },
  { id: "tf_8", patientId: "p_12", patientName: "Hiroshi Tanaka", treatmentType: "Cosmetic", estimatedValue: 3000, stage: "first_message", lastContact: daysAgo(1), nextAction: "Awaiting response", assigneeId: "u_leila" },
  { id: "tf_9", patientId: "p_9", patientName: "Arjun Malhotra", treatmentType: "Implant", estimatedValue: 4500, stage: "appointment_booked", lastContact: daysAgo(1), nextAction: "Complete", assigneeId: "u_leila" },
  { id: "tf_10", patientId: "p_4", patientName: "Saanvi Reddy", treatmentType: "Implant", estimatedValue: 4200, stage: "coordinator_required", lastContact: daysAgo(5), nextAction: "Leila to call", assigneeId: "u_leila" },
  { id: "tf_11", patientId: "p_15", patientName: "Elena Petrova", treatmentType: "Consultation", estimatedValue: 200, stage: "closed", lastContact: daysAgo(10), nextAction: "Closed — not interested", assigneeId: "u_leila" },
  { id: "tf_12", patientId: "p_38", patientName: "Nora Ferguson", treatmentType: "Invisalign", estimatedValue: 5000, stage: "follow_up_due", lastContact: null, nextAction: "Send first follow-up", assigneeId: "u_leila" },
];

// ─── Knowledge sources ──────────────────────────────────────────────────────────

export const knowledgeSources: KnowledgeSource[] = [
  { id: "k_1", name: "Lumen Dental website", type: "website", status: "synced", lastSync: hoursAgo(4), records: 142, owner: "Anita Desai", channels: ["phone", "email", "whatsapp", "webchat"] },
  { id: "k_2", name: "Services & fees", type: "pdf", status: "synced", lastSync: daysAgo(2), records: 24, owner: "Anita Desai", channels: ["phone", "webchat"] },
  { id: "k_3", name: "FAQ — common patient questions", type: "faq", status: "synced", lastSync: hoursAgo(20), records: 64, owner: "Meera Iyer", channels: ["phone", "email", "whatsapp", "webchat"] },
  { id: "k_4", name: "Insurance policy", type: "text", status: "synced", lastSync: daysAgo(5), records: 8, owner: "Anita Desai", channels: ["phone", "email"] },
  { id: "k_5", name: "Cancellation policy", type: "text", status: "synced", lastSync: daysAgo(5), records: 4, owner: "Anita Desai", channels: ["phone", "email"] },
  { id: "k_6", name: "Emergency guidance", type: "text", status: "synced", lastSync: daysAgo(1), records: 6, owner: "Priya Sharma", channels: ["phone", "whatsapp", "webchat"] },
  { id: "k_7", name: "New-patient information", type: "text", status: "synced", lastSync: daysAgo(3), records: 12, owner: "Meera Iyer", channels: ["phone", "email", "webchat"] },
  { id: "k_8", name: "Dentist biographies", type: "url", status: "synced", lastSync: daysAgo(7), records: 8, owner: "Anita Desai", channels: ["webchat"] },
  { id: "k_9", name: "Location information", type: "text", status: "synced", lastSync: daysAgo(7), records: 9, owner: "Anita Desai", channels: ["phone", "email", "webchat"] },
  { id: "k_10", name: "Financing information", type: "text", status: "synced", lastSync: daysAgo(10), records: 5, owner: "Leila Fernandes", channels: ["phone", "email"] },
  { id: "k_11", name: "Opening hours", type: "text", status: "synced", lastSync: daysAgo(7), records: 3, owner: "Anita Desai", channels: ["phone", "email", "whatsapp", "webchat"] },
  { id: "k_12", name: "Parking & transport", type: "text", status: "synced", lastSync: daysAgo(7), records: 3, owner: "Anita Desai", channels: ["phone", "webchat"] },
];

// ─── Automations ──────────────────────────────────────────────────────────────

export const automations: Automation[] = [
  {
    id: "a_1", name: "Missed-call recovery", description: "When a call is missed, send a WhatsApp follow-up within 60 seconds.",
    status: "enabled", trigger: "Call missed", runs: 38, lastRun: hoursAgo(9),
    steps: [
      { kind: "trigger", label: "Call missed" },
      { kind: "action", label: "Send WhatsApp follow-up" },
      { kind: "action", label: "Create follow-up task" },
    ],
  },
  {
    id: "a_2", name: "New-patient enquiry", description: "Collect information, suggest appointment type, offer availability.",
    status: "enabled", trigger: "New enquiry", runs: 142, lastRun: minsAgo(22),
    steps: [
      { kind: "trigger", label: "New enquiry" },
      { kind: "ai", label: "Collect patient info" },
      { kind: "action", label: "Suggest appointment type" },
      { kind: "action", label: "Offer availability" },
      { kind: "action", label: "Create lead" },
    ],
  },
  {
    id: "a_3", name: "Cancellation recovery", description: "Find matching waitlist patients when an appointment is cancelled.",
    status: "enabled", trigger: "Appointment cancelled", runs: 12, lastRun: hoursAgo(3),
    steps: [
      { kind: "trigger", label: "Appointment cancelled" },
      { kind: "action", label: "Create open slot" },
      { kind: "ai", label: "Find matching waitlist patients" },
      { kind: "approval", label: "Staff approval" },
      { kind: "action", label: "Send simulated invitation" },
      { kind: "action", label: "Fill slot" },
    ],
  },
  {
    id: "a_4", name: "Appointment reminders", description: "Send reminder, confirmation request, and rescheduling option.",
    status: "enabled", trigger: "Appointment approaching", runs: 256, lastRun: minsAgo(15),
    steps: [
      { kind: "trigger", label: "Appointment in 24h" },
      { kind: "action", label: "Send reminder" },
      { kind: "action", label: "Request confirmation" },
    ],
  },
  {
    id: "a_5", name: "Recall sequence", description: "Approved reminder sequence when recall becomes due.",
    status: "enabled", trigger: "Recall due", runs: 47, lastRun: hoursAgo(2),
    steps: [
      { kind: "trigger", label: "Recall due" },
      { kind: "action", label: "Send reminder" },
      { kind: "delay", label: "Wait 3 days" },
      { kind: "action", label: "Follow-up message" },
      { kind: "delay", label: "Wait 4 days" },
      { kind: "action", label: "Alternative channel" },
      { kind: "action", label: "Human call task" },
    ],
  },
  {
    id: "a_6", name: "Treatment follow-up", description: "Follow up on consultations that didn't result in a booking.",
    status: "enabled", trigger: "Consultation without booking", runs: 19, lastRun: hoursAgo(5),
    steps: [
      { kind: "trigger", label: "Consultation completed" },
      { kind: "delay", label: "Wait 2 days" },
      { kind: "action", label: "Send follow-up" },
      { kind: "ai", label: "Answer admin questions" },
      { kind: "action", label: "Offer coordinator call" },
    ],
  },
  {
    id: "a_7", name: "No-show recovery", description: "Respectful follow-up after no-show.",
    status: "disabled", trigger: "No-show recorded", runs: 8, lastRun: daysAgo(4),
    steps: [
      { kind: "trigger", label: "No-show" },
      { kind: "action", label: "Send respectful follow-up" },
      { kind: "action", label: "Offer rescheduling" },
    ],
  },
  {
    id: "a_8", name: "Review request", description: "Send review request after completed appointment (with consent).",
    status: "disabled", trigger: "Appointment completed", runs: 0, lastRun: daysAgo(30),
    steps: [
      { kind: "trigger", label: "Appointment completed" },
      { kind: "condition", label: "Consent given" },
      { kind: "action", label: "Send review request" },
    ],
  },
];

// ─── Audit log ──────────────────────────────────────────────────────────────────

export const auditLog: AuditEntry[] = [
  { id: "al_1", actor: "CloudSun AI", actorType: "ai", action: "Booked appointment", resource: "Appointment ap_2", at: minsAgo(22), ip: "ai-worker-3", result: "success", details: "New patient Kabir Singh. Confidence 0.93." },
  { id: "al_2", actor: "Meera Iyer", actorType: "human", action: "Took over conversation", resource: "Conversation cv_1", at: minsAgo(17), ip: "203.0.113.42", result: "success", details: "AI handoff accepted." },
  { id: "al_3", actor: "CloudSun AI", actorType: "ai", action: "Emergency screening", resource: "Conversation cv_1", at: minsAgo(19), ip: "ai-worker-1", result: "success", details: "No red flags detected. Confidence 0.91." },
  { id: "al_4", actor: "CloudSun AI", actorType: "ai", action: "Started recall sequence", resource: "RecallCase rc_4", at: hoursAgo(3), ip: "ai-worker-2", result: "success", details: "90-day overdue reactivation." },
  { id: "al_5", actor: "Rohan Mehta", actorType: "human", action: "Updated knowledge source", resource: "KnowledgeSource k_3", at: hoursAgo(20), ip: "203.0.113.18", result: "success" },
  { id: "al_6", actor: "CloudSun AI", actorType: "ai", action: "Sent treatment follow-up", resource: "TreatmentFollowUp tf_1", at: hoursAgo(5), ip: "ai-worker-2", result: "success", details: "Root canal follow-up. Confidence 0.88." },
  { id: "al_7", actor: "Leila Fernandes", actorType: "human", action: "Changed AI confidence threshold", resource: "AIConfiguration", at: daysAgo(2), ip: "203.0.113.7", result: "success", details: "Minimum confidence raised to 0.72." },
  { id: "al_8", actor: "CloudSun AI", actorType: "ai", action: "Clinical question handoff", resource: "Conversation cv_11", at: daysAgo(1), ip: "ai-worker-1", result: "success", details: "Question about diagnosis. Handed off to human." },
  { id: "al_9", actor: "System", actorType: "system", action: "Waitlist invitation sent", resource: "WaitlistEntry wl_1", at: daysAgo(2), ip: "internal", result: "success", details: "Cancellation recovery automation." },
  { id: "al_10", actor: "CloudSun AI", actorType: "ai", action: "Missed call follow-up", resource: "Call call_5", at: hoursAgo(9), ip: "ai-worker-3", result: "success", details: "WhatsApp sent to Daniel Okafor." },
  { id: "al_11", actor: "Anita Desai", actorType: "human", action: "Cancelled appointment", resource: "Appointment ap_3", at: hoursAgo(3), ip: "203.0.113.91", result: "success", details: "Patient cancelled. Waitlist triggered." },
  { id: "al_12", actor: "CloudSun AI", actorType: "ai", action: "Filled cancellation from waitlist", resource: "Appointment ap_3", at: hoursAgo(2), ip: "ai-worker-2", result: "success", details: "Lakshmi Iyer accepted. Confidence 0.90." },
];

// ─── Integrations ──────────────────────────────────────────────────────────────

export const integrations: Integration[] = [
  { id: "i_1", name: "Dentrix", category: "Practice Management", status: "not_connected", icon: "Database" },
  { id: "i_2", name: "Open Dental", category: "Practice Management", status: "not_connected", icon: "Database" },
  { id: "i_3", name: "Eaglesoft", category: "Practice Management", status: "not_connected", icon: "Database" },
  { id: "i_4", name: "Twilio telephony", category: "Communication", status: "not_connected", icon: "Phone" },
  { id: "i_5", name: "Gmail", category: "Communication", status: "not_connected", icon: "Mail" },
  { id: "i_6", name: "WhatsApp Business", category: "Communication", status: "not_connected", icon: "MessageCircle" },
  { id: "i_7", name: "Website chat widget", category: "Communication", status: "demo", icon: "MessageSquare", lastSync: minsAgo(2) },
  { id: "i_8", name: "Google Calendar", category: "Calendar", status: "not_connected", icon: "Calendar" },
  { id: "i_9", name: "Zoom", category: "Meetings", status: "not_connected", icon: "Video" },
  { id: "i_10", name: "Payment provider", category: "Payments", status: "not_connected", icon: "CreditCard" },
  { id: "i_11", name: "Financing provider", category: "Payments", status: "not_connected", icon: "CreditCard" },
  { id: "i_12", name: "Patient forms", category: "Payments", status: "not_connected", icon: "FileText" },
  { id: "i_13", name: "Webhooks", category: "Automation", status: "demo", icon: "Webhook", lastSync: minsAgo(1) },
];

// ─── Analytics ──────────────────────────────────────────────────────────────────

export const analytics = {
  overview: {
    newPatientEnquiries: 38,
    appointmentsRequested: 52,
    appointmentsBooked: 41,
    missedCallsRecovered: 14,
    cancellationsToday: 3,
    waitlistOpportunities: 10,
    recallPatientsDue: 12,
    treatmentFollowUpsPending: 12,
    humanHandoffs: 8,
    avgResponseTime: 1.4,
    channelVolume: [
      { channel: "phone", count: 142, label: "Phone" },
      { channel: "email", count: 98, label: "Email" },
      { channel: "whatsapp", count: 176, label: "WhatsApp" },
      { channel: "webchat", count: 64, label: "Web chat" },
    ],
  },
  conversationVolume: [18, 22, 25, 19, 28, 31, 24, 27, 33, 29, 35, 41, 38, 42],
  aiHandledRate: [62, 65, 68, 64, 71, 73, 70, 72, 75, 78, 76, 79, 81, 84],
  channelMix: [
    { name: "WhatsApp", value: 38, color: "oklch(0.55 0.14 150)" },
    { name: "Phone", value: 31, color: "oklch(0.62 0.16 42)" },
    { name: "Email", value: 21, color: "oklch(0.45 0.08 155)" },
    { name: "Web chat", value: 10, color: "oklch(0.50 0.10 250)" },
  ],
  hourlyVolume: [4, 8, 14, 22, 28, 31, 26, 19, 24, 33, 29, 21, 12],
  responseTimeSeries: [2.1, 1.9, 1.8, 1.6, 1.7, 1.5, 1.4],
  revenueInfluenced: [42, 58, 71, 64, 88, 102],
  costPerConversation: 6.4,
  costPerAppointment: 31.2,
  monthlyCost: [
    { category: "Phone", amount: 1240 },
    { category: "AI usage", amount: 880 },
    { category: "WhatsApp", amount: 410 },
    { category: "Storage", amount: 120 },
  ],
  // New-patient pipeline
  newPatientPipeline: {
    new_enquiry: 38,
    qualified: 24,
    appointment_offered: 18,
    appointment_booked: 14,
    attended: 9,
    did_not_book: 6,
    requires_human: 4,
  },
  // Schedule recovery
  scheduleRecovery: {
    cancellations: 8,
    waitlistInvitations: 22,
    slotsRefilled: 6,
    chairTimeRecovered: 4.5, // hours
    noShows: 3,
    rescheduled: 5,
  },
};

export function contactById(id: string) {
  return contacts.find((c) => c.id === id);
}
export function teamById(id?: string) {
  return team.find((t) => t.id === id);
}
