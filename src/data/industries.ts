/* ═══════════════════════════════════════════════════════
   AI STAFFING AGENCY — INDUSTRY DATA
   25 verticals with tailored messaging, stats, and ROI
   ═══════════════════════════════════════════════════════ */

export interface IndustryData {
  name: string;
  slug: string;
  icon: string;
  headline: string;
  subheadline: string;
  description: string;
  stats: { value: string; label: string; detail: string }[];
  recommendedAgents: { name: string; description: string }[];
  useCases: { title: string; description: string }[];
  painPoints: { title: string; description: string }[];
  roiExample: {
    title: string;
    calculation: string;
    monthlyLoss: string;
    withAgent: string;
  };
}

export const INDUSTRIES: IndustryData[] = [
  /* ──────────────────────── 1. LEGAL FIRMS ──────────────────────── */
  {
    name: "Legal Firms",
    slug: "legal-firms",
    icon: "⚖️",
    headline: "AI Agents Built for Law Firms",
    subheadline: "Stop losing clients to missed calls and slow intake processes",
    description:
      "Law firms lose tens of thousands in potential revenue every month from unanswered calls and delayed follow-ups. Our AI agents handle client intake 24/7, qualify leads, schedule consultations, and ensure no potential case falls through the cracks.",
    stats: [
      { value: "42%", label: "Calls Missed After Hours", detail: "of law firm calls go unanswered after 5 PM" },
      { value: "$3,200", label: "Avg Case Value Lost", detail: "per missed intake opportunity" },
      { value: "68%", label: "Clients Call Once", detail: "of potential clients won't leave a voicemail" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "24/7 call answering with legal intake scripts and conflict checks" },
      { name: "Appointment Setter", description: "Automated consultation scheduling synced to attorney calendars" },
      { name: "Follow-Up Agent", description: "Nurtures leads who didn't book, re-engages cold prospects" },
      { name: "Contract Review Assistant", description: "Preliminary contract analysis and clause flagging" },
      { name: "Email Support Agent", description: "Manages client inquiries, document requests, and status updates" },
      { name: "Data Entry Clerk", description: "Case file data entry, court date tracking, document management" },
    ],
    useCases: [
      { title: "24/7 Legal Intake", description: "Never miss a potential client—AI answers calls at 2 AM and qualifies the case before your team arrives." },
      { title: "Consultation Scheduling", description: "Automatically book free consults based on attorney availability and practice area match." },
      { title: "Client Follow-Up Automation", description: "Systematic follow-up sequences for leads who inquired but haven't retained yet." },
      { title: "Document Request Management", description: "Handle routine document requests and status inquiries so paralegals focus on casework." },
    ],
    painPoints: [
      { title: "After-Hours Client Loss", description: "Potential clients call at nights and weekends when no one answers. They call your competitor next." },
      { title: "Slow Intake Processing", description: "Manual intake forms and phone tag delay the client onboarding process by days." },
      { title: "Paralegal Burnout", description: "Staff spend hours on routine calls and scheduling instead of billable casework." },
    ],
    roiExample: {
      title: "Typical Solo Practice ROI",
      calculation: "12 missed calls/month × 30% conversion × $3,200 avg case value",
      monthlyLoss: "$11,520 in lost revenue",
      withAgent: "Virtual Receptionist at $400/mo captures 80%+ of those leads",
    },
  },

  /* ──────────────────────── 2. MEDICAL & HEALTHCARE ──────────────────────── */
  {
    name: "Medical & Healthcare",
    slug: "medical-healthcare",
    icon: "🏥",
    headline: "AI Agents for Medical Practices",
    subheadline: "Reduce no-shows, fill cancellations, and let your staff focus on patient care",
    description:
      "Healthcare practices lose thousands monthly to no-shows and last-minute cancellations. Our AI agents handle appointment scheduling, patient reminders, insurance verification follow-ups, and after-hours triage routing—so your front desk can focus on in-office patients.",
    stats: [
      { value: "23%", label: "Average No-Show Rate", detail: "of scheduled appointments result in no-shows" },
      { value: "$200", label: "Revenue Per No-Show", detail: "average lost revenue per missed appointment" },
      { value: "67%", label: "Hold Time Complaints", detail: "of patients cite long hold times as top frustration" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "HIPAA-aware call handling, appointment scheduling, and patient routing" },
      { name: "Appointment Setter", description: "Automated scheduling with provider calendar integration and waitlist management" },
      { name: "Follow-Up Agent", description: "Appointment reminders, no-show re-engagement, and post-visit follow-ups" },
      { name: "Phone Triage Agent", description: "After-hours call routing based on urgency and on-call provider schedules" },
      { name: "Email Support Agent", description: "Patient portal inquiries, prescription refill requests, and billing questions" },
    ],
    useCases: [
      { title: "Automated Appointment Reminders", description: "Multi-channel reminders via call, text, and email reduce no-shows by up to 40%." },
      { title: "After-Hours Patient Triage", description: "AI routes urgent calls to on-call providers and handles routine inquiries without waking your team." },
      { title: "Cancellation Backfill", description: "When a patient cancels, AI immediately contacts the waitlist to fill the slot within minutes." },
      { title: "Insurance Pre-Verification", description: "Collect insurance details before visits so front desk staff aren't scrambling at check-in." },
    ],
    painPoints: [
      { title: "Chronic No-Shows", description: "Patients forget appointments, and your staff doesn't have time to call every single one." },
      { title: "Front Desk Overwhelm", description: "Phones ring constantly while staff try to check in patients, pull charts, and verify insurance." },
      { title: "After-Hours Call Chaos", description: "Answering services are expensive and impersonal—patients get frustrated and switch providers." },
    ],
    roiExample: {
      title: "Typical Primary Care Practice ROI",
      calculation: "30 no-shows/month × $200 avg visit value × 40% recovery rate",
      monthlyLoss: "$6,000 in unfilled appointment slots",
      withAgent: "Follow-Up Agent at $600/mo recovers $2,400+ monthly in saved appointments",
    },
  },

  /* ──────────────────────── 3. INSURANCE ──────────────────────── */
  {
    name: "Insurance",
    slug: "insurance",
    icon: "🛡️",
    headline: "AI Agents for Insurance Agencies",
    subheadline: "Quote faster, follow up instantly, and never let a lead go cold",
    description:
      "Insurance is a speed game—the first agency to respond wins the client. Our AI agents ensure every lead gets an instant response, every quote follow-up happens on schedule, and every renewal gets attention before it lapses.",
    stats: [
      { value: "78%", label: "First Responder Wins", detail: "of insurance buyers go with the first agent who responds" },
      { value: "5 min", label: "Response Time Target", detail: "leads contacted within 5 minutes are 21x more likely to convert" },
      { value: "35%", label: "Renewal Churn Risk", detail: "of policy renewals are at risk without proactive outreach" },
    ],
    recommendedAgents: [
      { name: "Lead Gen Specialist", description: "Prospect identification and outreach campaigns for new policy opportunities" },
      { name: "Follow-Up Agent", description: "Automated quote follow-ups, renewal reminders, and re-engagement sequences" },
      { name: "Virtual Receptionist", description: "24/7 call handling for claims, policy questions, and new inquiries" },
      { name: "Appointment Setter", description: "Schedule policy review meetings and consultation calls automatically" },
      { name: "Email Support Agent", description: "Handle routine policy questions, document requests, and endorsement processing" },
      { name: "Data Entry Clerk", description: "Application data entry, policy updates, and CRM maintenance" },
    ],
    useCases: [
      { title: "Instant Lead Response", description: "AI contacts new leads within 60 seconds of form submission—before they call your competitor." },
      { title: "Renewal Retention Campaigns", description: "Proactive outreach 60, 30, and 15 days before renewal with personalized messaging." },
      { title: "Quote Follow-Up Automation", description: "Systematic follow-up on outstanding quotes until the prospect decides, not until your team forgets." },
      { title: "Claims Status Updates", description: "Handle routine claims status inquiries so agents focus on selling, not servicing." },
    ],
    painPoints: [
      { title: "Slow Quote Response", description: "By the time your team follows up, the prospect already bought from a faster competitor." },
      { title: "Renewal Lapses", description: "Policies lapse because no one had time to make the renewal call." },
      { title: "Agent Time Wasted on Service", description: "Producers spend 60% of their time on service calls instead of selling new policies." },
    ],
    roiExample: {
      title: "Typical Insurance Agency ROI",
      calculation: "20 lost leads/month × 15% close rate × $1,500 avg annual premium",
      monthlyLoss: "$4,500 in lost first-year commissions",
      withAgent: "Lead Gen + Follow-Up Agents at $1,400/mo capture 60%+ of those leads",
    },
  },

  /* ──────────────────────── 4. DENTAL OFFICES ──────────────────────── */
  {
    name: "Dental Offices",
    slug: "dental-offices",
    icon: "🦷",
    headline: "AI Agents for Dental Practices",
    subheadline: "Fill your chairs, reduce no-shows, and keep your schedule packed",
    description:
      "Dental practices live and die by their schedule. Empty chairs mean lost revenue. Our AI agents handle patient scheduling, recall campaigns, insurance verification, and after-hours booking to keep every chair filled every day.",
    stats: [
      { value: "$600", label: "Empty Chair Cost", detail: "average revenue lost per unfilled appointment slot" },
      { value: "28%", label: "Recall Non-Compliance", detail: "of patients miss their 6-month recall appointment" },
      { value: "15 min", label: "Avg Hold Time", detail: "patients wait on hold, leading 30% to hang up" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Patient call handling, new patient intake, and emergency routing" },
      { name: "Appointment Setter", description: "Automated scheduling with hygienist and provider calendar management" },
      { name: "Follow-Up Agent", description: "Recall campaigns, treatment plan follow-ups, and reactivation outreach" },
      { name: "Phone Triage Agent", description: "After-hours emergency call handling and routing" },
      { name: "Email Support Agent", description: "Insurance questions, billing inquiries, and appointment confirmations" },
    ],
    useCases: [
      { title: "6-Month Recall Automation", description: "AI contacts patients at their recall interval and books their cleaning before they forget." },
      { title: "Treatment Plan Follow-Up", description: "Patients who accepted treatment but haven't scheduled get automated outreach to book." },
      { title: "Same-Day Cancellation Fill", description: "When a patient cancels, AI instantly contacts the short-notice list to fill the slot." },
      { title: "New Patient Online Booking", description: "24/7 scheduling for new patients with insurance verification and intake form collection." },
    ],
    painPoints: [
      { title: "Empty Chair Syndrome", description: "No-shows and cancellations leave expensive operatory time unfilled." },
      { title: "Recall Program Gaps", description: "Staff can't keep up with outbound recall calls while handling the front desk." },
      { title: "Phone System Bottleneck", description: "One receptionist can't answer phones, check in patients, and verify insurance simultaneously." },
    ],
    roiExample: {
      title: "Typical Dental Practice ROI",
      calculation: "8 empty chairs/month × $600 avg production per chair",
      monthlyLoss: "$4,800 in unfilled production",
      withAgent: "Appointment Setter + Follow-Up Agent at $1,100/mo fills 60%+ of those slots",
    },
  },

  /* ──────────────────────── 5. VETERINARY CLINICS ──────────────────────── */
  {
    name: "Veterinary Clinics",
    slug: "veterinary-clinics",
    icon: "🐾",
    headline: "AI Agents for Veterinary Clinics",
    subheadline: "Care for more pets without burning out your front desk",
    description:
      "Veterinary clinics are overwhelmed—pet ownership surged while staffing stayed flat. Our AI agents handle appointment scheduling, medication refill requests, vaccination reminders, and after-hours triage so your team can focus on animal care.",
    stats: [
      { value: "70%", label: "Staff Burnout Rate", detail: "of vet clinic staff report feeling overwhelmed" },
      { value: "45%", label: "Calls During Surgery", detail: "of calls come in when the team is in procedures" },
      { value: "$150", label: "Avg Visit Value", detail: "per wellness appointment missed due to recall gaps" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Pet parent call handling with species-specific scheduling and intake" },
      { name: "Appointment Setter", description: "Wellness visit scheduling, surgery prep calls, and follow-up booking" },
      { name: "Follow-Up Agent", description: "Vaccination reminders, annual wellness recalls, and post-surgery check-ins" },
      { name: "Phone Triage Agent", description: "After-hours emergency routing and symptom-based urgency classification" },
    ],
    useCases: [
      { title: "Vaccination Reminder Campaigns", description: "AI contacts pet owners when vaccines are due, with easy one-click booking." },
      { title: "After-Hours Emergency Triage", description: "Classify urgency and route true emergencies to the on-call vet, handle routine questions via AI." },
      { title: "Medication Refill Processing", description: "Pet owners request refills via phone or text, AI verifies and queues for vet approval." },
      { title: "New Client Intake", description: "Collect pet history, vaccination records, and insurance info before the first visit." },
    ],
    painPoints: [
      { title: "Front Desk Meltdown", description: "Two receptionists handling check-ins, check-outs, and nonstop phones leads to errors and burnout." },
      { title: "Missed Wellness Revenue", description: "Without proactive recall, pets miss annual visits and clinics miss $150+ per appointment." },
      { title: "After-Hours Call Volume", description: "Pet emergencies don't follow business hours, but your answering service is impersonal and slow." },
    ],
    roiExample: {
      title: "Typical Vet Clinic ROI",
      calculation: "25 missed wellness visits/month × $150 avg visit value",
      monthlyLoss: "$3,750 in lost wellness revenue",
      withAgent: "Follow-Up + Appointment Setter at $1,100/mo recovers 50%+ of those visits",
    },
  },

  /* ──────────────────────── 6. REAL ESTATE ──────────────────────── */
  {
    name: "Real Estate",
    slug: "real-estate",
    icon: "🏠",
    headline: "AI Agents for Real Estate Professionals",
    subheadline: "Respond to every lead instantly — even at midnight on a Saturday",
    description:
      "In real estate, speed kills the competition. The first agent to respond to an inquiry wins the client 78% of the time. Our AI agents ensure instant lead response, automated showing scheduling, and relentless follow-up on every prospect.",
    stats: [
      { value: "78%", label: "First Responder Wins", detail: "of buyers work with the first agent who responds" },
      { value: "5 min", label: "Golden Window", detail: "response time for maximum lead conversion" },
      { value: "$8,400", label: "Avg Commission Lost", detail: "per buyer lead that goes to a competitor" },
    ],
    recommendedAgents: [
      { name: "Lead Gen Specialist", description: "Qualify Zillow, Realtor.com, and website leads instantly" },
      { name: "Follow-Up Agent", description: "12-month nurture sequences for leads not ready to buy/sell today" },
      { name: "Appointment Setter", description: "Schedule showings, listing appointments, and buyer consultations" },
      { name: "Virtual Receptionist", description: "Handle inbound calls from sign riders, ads, and referral sources" },
      { name: "Social Media Manager", description: "Post listings, market updates, and community content across platforms" },
      { name: "Email Support Agent", description: "Respond to property inquiries and transaction document requests" },
    ],
    useCases: [
      { title: "Instant Lead Response", description: "New leads from any source get a personalized response in under 60 seconds, 24/7." },
      { title: "Long-Term Lead Nurture", description: "AI maintains contact with leads over months/years until they're ready to transact." },
      { title: "Showing Coordination", description: "Automatically schedule and confirm showings, send prep details, and collect feedback." },
      { title: "Open House Follow-Up", description: "Every sign-in sheet contact gets personalized follow-up within hours of the event." },
    ],
    painPoints: [
      { title: "Lead Response Lag", description: "You're in a showing and miss 3 new leads. By the time you call back, they've found another agent." },
      { title: "Follow-Up Fatigue", description: "Agents start strong on follow-ups then taper off—right when many leads are ready to buy." },
      { title: "Weekend & Evening Gaps", description: "Most real estate inquiries come after hours when agents are unavailable." },
    ],
    roiExample: {
      title: "Typical Solo Agent ROI",
      calculation: "8 lost leads/month × 10% close rate × $8,400 avg commission",
      monthlyLoss: "$6,720 in lost commission income",
      withAgent: "Lead Gen + Follow-Up Agents at $1,400/mo capture those opportunities",
    },
  },

  /* ──────────────────────── 7. AUTO DEALERSHIPS ──────────────────────── */
  {
    name: "Auto Dealerships",
    slug: "auto-dealerships",
    icon: "🚗",
    headline: "AI Agents for Auto Dealerships",
    subheadline: "Turn every internet lead into a showroom visit",
    description:
      "Auto dealerships receive hundreds of online leads monthly but only connect with a fraction. Our AI agents handle instant lead response, BDC follow-up, service appointment scheduling, and customer retention—maximizing every opportunity.",
    stats: [
      { value: "60%", label: "Leads Never Contacted", detail: "of dealership internet leads never receive a follow-up call" },
      { value: "$1,200", label: "Avg Gross Per Unit", detail: "in front-end gross profit per vehicle sold" },
      { value: "3x", label: "Service Revenue", detail: "lifetime service revenue vs. initial vehicle sale profit" },
    ],
    recommendedAgents: [
      { name: "Lead Gen Specialist", description: "Internet lead qualification and outreach across all lead sources" },
      { name: "Follow-Up Agent", description: "BDC-style follow-up sequences for sales and service" },
      { name: "Appointment Setter", description: "Schedule test drives, service appointments, and trade-in appraisals" },
      { name: "Virtual Receptionist", description: "Inbound call routing to sales, service, parts, and finance" },
      { name: "Email Support Agent", description: "Respond to inventory inquiries, financing questions, and trade-in requests" },
    ],
    useCases: [
      { title: "Internet Lead Follow-Up", description: "Every AutoTrader, Cars.com, and website lead gets instant, persistent follow-up." },
      { title: "Service Retention Campaigns", description: "AI contacts customers when service is due, re-engaging lapsed service customers." },
      { title: "Equity Mining Outreach", description: "Contact owners with positive equity positions about upgrade opportunities." },
      { title: "Post-Sale CSI Follow-Up", description: "Automated satisfaction surveys and issue resolution before manufacturer CSI surveys." },
    ],
    painPoints: [
      { title: "BDC Staffing Costs", description: "Full BDC departments cost $15K+/month in salaries alone, with high turnover." },
      { title: "Internet Lead Waste", description: "Salespeople cherry-pick leads and ignore the rest. 60% of leads never get a call." },
      { title: "Service Department Leakage", description: "Customers defect to independents because no one reminded them service was due." },
    ],
    roiExample: {
      title: "Typical Dealership ROI",
      calculation: "15 unworked leads/month × 8% close rate × $1,200 front-end gross",
      monthlyLoss: "$1,440 in lost vehicle gross + lifetime service revenue",
      withAgent: "Lead Gen + Follow-Up + Appointment Setter at $1,900/mo pays for itself in 2 extra deals",
    },
  },

  /* ──────────────────────── 8. RESTAURANTS & HOSPITALITY ──────────────────────── */
  {
    name: "Restaurants & Hospitality",
    slug: "restaurants-hospitality",
    icon: "🍽️",
    headline: "AI Agents for Restaurants & Hospitality",
    subheadline: "Never miss a reservation, catering inquiry, or customer complaint again",
    description:
      "Restaurants operate on razor-thin margins where every cover counts. Our AI agents handle reservations, catering inquiries, online review management, and customer feedback—letting your team focus on delivering great food and service.",
    stats: [
      { value: "35%", label: "Calls Go Unanswered", detail: "of restaurant calls go to voicemail during peak hours" },
      { value: "$4,500", label: "Avg Catering Order", detail: "average catering order value that goes to whoever answers first" },
      { value: "72%", label: "Choose Based on Reviews", detail: "of diners check reviews before choosing a restaurant" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Handle reservations, hours/directions, and catering inquiries 24/7" },
      { name: "Appointment Setter", description: "Book reservations, private events, and catering consultations" },
      { name: "Social Media Manager", description: "Post food photos, respond to reviews, and manage online reputation" },
      { name: "Follow-Up Agent", description: "Post-dining feedback collection and loyalty program re-engagement" },
    ],
    useCases: [
      { title: "24/7 Reservation Handling", description: "AI books reservations by phone and online, even during your busiest dinner rush." },
      { title: "Catering Lead Capture", description: "Catering inquiries get instant quotes and follow-up, not a voicemail box." },
      { title: "Review Response Management", description: "AI monitors and responds to Google, Yelp, and TripAdvisor reviews within hours." },
      { title: "Event & Private Dining Booking", description: "Manage inquiries for private events, handle menu customization requests, and confirm bookings." },
    ],
    painPoints: [
      { title: "Peak-Hour Phone Chaos", description: "During dinner rush, no one can answer the phone—costing you reservations and catering orders." },
      { title: "Online Reputation Neglect", description: "Bad reviews sit unanswered for weeks, driving away potential customers." },
      { title: "Catering Revenue Leakage", description: "High-value catering inquiries go to voicemail and never get returned." },
    ],
    roiExample: {
      title: "Typical Restaurant ROI",
      calculation: "4 missed catering leads/month × 50% close rate × $4,500 avg order",
      monthlyLoss: "$9,000 in lost catering revenue",
      withAgent: "Virtual Receptionist at $400/mo captures those opportunities around the clock",
    },
  },

  /* ──────────────────────── 9. POOL SERVICES ──────────────────────── */
  {
    name: "Pool Services",
    slug: "pool-services",
    icon: "🏊",
    headline: "AI Agents for Pool Service Companies",
    subheadline: "Book more pools, dispatch faster, and stop losing leads to voicemail",
    description:
      "Pool service companies are busiest when leads are calling — which means phones go unanswered. Our AI agents handle new customer inquiries, service scheduling, route optimization support, and seasonal upselling so you can focus on the water.",
    stats: [
      { value: "40%", label: "Seasonal Lead Loss", detail: "of spring pool opening leads go unanswered" },
      { value: "$2,400", label: "Annual Customer Value", detail: "average recurring revenue per weekly pool service customer" },
      { value: "85%", label: "Local Search Driven", detail: "of pool service customers find you through local search" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Capture new customer inquiries and handle service requests while you're in the field" },
      { name: "Appointment Setter", description: "Schedule pool openings, closings, repairs, and recurring service start dates" },
      { name: "Follow-Up Agent", description: "Seasonal reactivation campaigns and new lead follow-up" },
      { name: "Lead Gen Specialist", description: "Outreach to new homeowners and neighborhoods without pool service" },
    ],
    useCases: [
      { title: "Seasonal Opening Blitz", description: "AI handles the spring rush of pool opening calls, qualifying and scheduling without delays." },
      { title: "New Customer Onboarding", description: "Collect pool specs, access info, and service preferences before the first visit." },
      { title: "Upsell Campaigns", description: "Contact existing customers about equipment upgrades, remodeling, and add-on services." },
      { title: "Emergency Service Dispatch", description: "Handle urgent green pool or equipment failure calls and schedule priority visits." },
    ],
    painPoints: [
      { title: "Spring Rush Overwhelm", description: "You get 200 calls in two weeks for pool openings and can only answer 60%." },
      { title: "Field-Based Operations", description: "You're knee-deep in a pool while leads are calling and going to competitors." },
      { title: "Seasonal Revenue Gaps", description: "No proactive outreach means customers drift to competitors each season." },
    ],
    roiExample: {
      title: "Typical Pool Service Company ROI",
      calculation: "10 lost leads/month (spring) × 40% close rate × $2,400 annual value",
      monthlyLoss: "$9,600 in lost annual recurring revenue",
      withAgent: "Virtual Receptionist + Appointment Setter at $900/mo pays for itself in 1 new customer",
    },
  },

  /* ──────────────────────── 10. PLUMBING & HVAC ──────────────────────── */
  {
    name: "Plumbing & HVAC",
    slug: "plumbing-hvac",
    icon: "🔧",
    headline: "AI Agents for Plumbing & HVAC Companies",
    subheadline: "Capture every emergency call and fill your technicians' schedules",
    description:
      "When a pipe bursts or an AC dies, homeowners call the first company they find. If you don't answer, they move on in seconds. Our AI agents ensure 24/7 call coverage, emergency dispatching, and maintenance plan follow-ups to maximize every technician hour.",
    stats: [
      { value: "90 sec", label: "Decision Window", detail: "homeowners wait before calling the next company" },
      { value: "$350", label: "Avg Service Call", detail: "average revenue per residential service call" },
      { value: "30%", label: "Maintenance Plan Gap", detail: "of customers with plans don't schedule their visits" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "24/7 emergency call handling and service request intake" },
      { name: "Phone Triage Agent", description: "Classify urgency—emergency dispatch vs. next-day scheduling" },
      { name: "Appointment Setter", description: "Schedule service calls, maintenance visits, and estimate appointments" },
      { name: "Follow-Up Agent", description: "Maintenance plan reminders, estimate follow-ups, and review requests" },
      { name: "Lead Gen Specialist", description: "New homeowner outreach and seasonal campaign management" },
    ],
    useCases: [
      { title: "24/7 Emergency Dispatch", description: "AI answers emergency calls instantly, gathers details, and dispatches the on-call technician." },
      { title: "Maintenance Plan Management", description: "Proactive scheduling for maintenance plan members to keep retention high." },
      { title: "Estimate Follow-Up", description: "Automated follow-up on outstanding estimates until the customer decides." },
      { title: "Seasonal Campaign Outreach", description: "Pre-season AC tune-up and heater check campaigns to fill shoulder-season schedules." },
    ],
    painPoints: [
      { title: "Missed Emergency Calls", description: "After-hours emergencies go to voicemail—customers call the next company immediately." },
      { title: "Estimate Ghosting", description: "You spend time quoting jobs that never close because no one followed up." },
      { title: "Seasonal Schedule Gaps", description: "Spring and fall shoulder seasons have empty schedules without proactive outreach." },
    ],
    roiExample: {
      title: "Typical HVAC Company ROI",
      calculation: "15 missed emergency calls/month × $350 avg service value",
      monthlyLoss: "$5,250 in lost service revenue",
      withAgent: "Virtual Receptionist + Phone Triage at $1,000/mo captures 80%+ of those calls",
    },
  },

  /* ──────────────────────── 11. LANDSCAPING ──────────────────────── */
  {
    name: "Landscaping",
    slug: "landscaping",
    icon: "🌿",
    headline: "AI Agents for Landscaping Companies",
    subheadline: "Grow your customer base without growing your office staff",
    description:
      "Landscaping companies are outside working—not sitting by a phone. Our AI agents handle incoming leads, schedule estimates, manage recurring service customers, and run seasonal campaigns so your crews stay busy and your pipeline stays full.",
    stats: [
      { value: "50%", label: "Spring Leads Lost", detail: "of spring landscaping leads go unanswered" },
      { value: "$3,600", label: "Avg Annual Contract", detail: "per residential lawn maintenance customer" },
      { value: "25%", label: "Customer Churn", detail: "annual churn rate without proactive engagement" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Capture leads while your crew is in the field mowing and mulching" },
      { name: "Appointment Setter", description: "Schedule estimates, seasonal clean-ups, and design consultations" },
      { name: "Follow-Up Agent", description: "Estimate follow-up, seasonal reactivation, and review requests" },
      { name: "Social Media Manager", description: "Before/after project photos and seasonal content to attract new clients" },
    ],
    useCases: [
      { title: "Spring Lead Capture", description: "Handle the flood of spring calls for clean-ups, mulching, and new maintenance contracts." },
      { title: "Estimate Follow-Up Automation", description: "Every estimate gets systematic follow-up until the customer signs or declines." },
      { title: "Seasonal Service Reminders", description: "Proactive outreach for fall clean-ups, winterization, and spring prep." },
      { title: "Customer Retention Campaigns", description: "Re-engage customers who haven't renewed their annual contract." },
    ],
    painPoints: [
      { title: "Field-Based Phone Problem", description: "You're running a mower and can't hear the phone—leads go to voicemail and call someone else." },
      { title: "Estimate Follow-Up Failure", description: "You quote 30 jobs a week but only follow up on 10. The other 20 go to competitors." },
      { title: "Seasonal Feast or Famine", description: "Spring is chaos, winter is dead—no system to smooth out the revenue curve." },
    ],
    roiExample: {
      title: "Typical Landscaping Company ROI",
      calculation: "12 lost leads/month × 25% close rate × $3,600 annual value",
      monthlyLoss: "$10,800 in lost annual revenue",
      withAgent: "Virtual Receptionist + Follow-Up at $1,000/mo captures those contracts",
    },
  },

  /* ──────────────────────── 12. CONSTRUCTION ──────────────────────── */
  {
    name: "Construction",
    slug: "construction",
    icon: "🏗️",
    headline: "AI Agents for Construction Companies",
    subheadline: "Win more bids and keep projects on track without office overhead",
    description:
      "Construction companies juggle active projects, incoming leads, subcontractor coordination, and client updates. Our AI agents handle lead qualification, estimate follow-ups, project status communications, and subcontractor scheduling.",
    stats: [
      { value: "$45K", label: "Avg Project Value", detail: "average residential construction project value" },
      { value: "40%", label: "Estimates Go Cold", detail: "of construction estimates never receive follow-up" },
      { value: "3 hrs", label: "Daily Admin Time", detail: "spent on calls, emails, and scheduling instead of building" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Handle new project inquiries and route calls while you're on the job site" },
      { name: "Follow-Up Agent", description: "Persistent estimate follow-up and project milestone communications" },
      { name: "Project Manager", description: "Task tracking, deadline management, and subcontractor coordination" },
      { name: "Appointment Setter", description: "Schedule site visits, consultations, and project meetings" },
      { name: "Data Entry Clerk", description: "Permit tracking, document management, and compliance record keeping" },
    ],
    useCases: [
      { title: "Lead Qualification", description: "AI screens incoming project inquiries for budget, timeline, and scope before your team invests time." },
      { title: "Estimate Follow-Up", description: "Systematic follow-up on outstanding estimates—some worth $50K+ each." },
      { title: "Client Progress Updates", description: "Automated weekly project status updates to keep clients informed without phone tag." },
      { title: "Subcontractor Coordination", description: "Schedule and confirm sub visits, handle change orders, and track completion." },
    ],
    painPoints: [
      { title: "On-Site Communication Gap", description: "You're on a ladder and miss 5 calls from potential clients worth $200K in projects." },
      { title: "Estimate Black Hole", description: "You spend hours creating detailed estimates that never get followed up on." },
      { title: "Client Communication Complaints", description: "Clients feel out of the loop on project progress, leading to frustration and scope creep." },
    ],
    roiExample: {
      title: "Typical GC / Remodeler ROI",
      calculation: "5 unfollowed estimates/month × 20% close rate × $45,000 avg project",
      monthlyLoss: "$45,000 in potential project revenue",
      withAgent: "Follow-Up Agent + Virtual Receptionist at $1,000/mo wins 1 extra project per quarter",
    },
  },

  /* ──────────────────────── 13. PROPERTY MANAGEMENT ──────────────────────── */
  {
    name: "Property Management",
    slug: "property-management",
    icon: "🏢",
    headline: "AI Agents for Property Management",
    subheadline: "Manage more doors without adding more staff",
    description:
      "Property managers juggle tenant inquiries, maintenance requests, lease renewals, and owner communications. Our AI agents handle the high-volume, repetitive tasks—so your team can manage more properties without hiring more people.",
    stats: [
      { value: "150+", label: "Monthly Tenant Calls", detail: "average inbound calls per 100 managed units" },
      { value: "60%", label: "Maintenance Requests", detail: "of calls are routine maintenance requests" },
      { value: "$1,500", label: "Turnover Cost", detail: "average cost per unit turnover (vacancy + make-ready)" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "24/7 tenant call handling for maintenance, payments, and general inquiries" },
      { name: "Phone Triage Agent", description: "Emergency maintenance routing vs. standard work order creation" },
      { name: "Follow-Up Agent", description: "Lease renewal campaigns, rent reminders, and vendor follow-ups" },
      { name: "Email Support Agent", description: "Tenant portal support, application status updates, and owner reports" },
      { name: "Data Entry Clerk", description: "Work order entry, lease data management, and inspection documentation" },
    ],
    useCases: [
      { title: "24/7 Maintenance Request Intake", description: "Tenants report issues anytime. AI creates work orders and dispatches for emergencies." },
      { title: "Lease Renewal Automation", description: "Proactive outreach 90 days before expiration with renewal terms and follow-up." },
      { title: "Rent Collection Follow-Up", description: "Automated payment reminders and late payment follow-up sequences." },
      { title: "Owner Reporting & Communication", description: "Automated monthly owner updates on occupancy, maintenance, and financials." },
    ],
    painPoints: [
      { title: "Phone Volume Overload", description: "Tenant calls about maintenance, payments, and lockouts overwhelm your team daily." },
      { title: "Lease Renewal Gaps", description: "Tenants leave because no one reached out about renewal until it was too late." },
      { title: "After-Hours Emergencies", description: "Pipe bursts at midnight—someone needs to answer and coordinate the response." },
    ],
    roiExample: {
      title: "Typical 200-Unit Portfolio ROI",
      calculation: "5 preventable turnovers/year × $1,500 per turnover ÷ 12 months",
      monthlyLoss: "$625/month in avoidable turnover costs + staff overtime",
      withAgent: "Virtual Receptionist + Follow-Up at $1,000/mo reduces turnover and saves 20+ staff hours/month",
    },
  },

  /* ──────────────────────── 14. SALONS & SPAS ──────────────────────── */
  {
    name: "Salons & Spas",
    slug: "salons-spas",
    icon: "💇",
    headline: "AI Agents for Salons & Spas",
    subheadline: "Keep your chairs full and your stylists focused on clients",
    description:
      "Salons and spas thrive on appointments—every empty slot is lost revenue. Our AI agents handle booking, confirmations, no-show follow-ups, and rebooking campaigns so your team never has to choose between answering phones and serving clients.",
    stats: [
      { value: "30%", label: "Phone-to-Book Rate", detail: "of callers who can't get through book elsewhere" },
      { value: "$85", label: "Avg Service Ticket", detail: "average revenue per salon appointment" },
      { value: "20%", label: "No-Show Rate", detail: "of appointments result in no-shows without reminders" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Handle booking calls, service inquiries, and product questions" },
      { name: "Appointment Setter", description: "Online and phone booking with stylist/therapist preference matching" },
      { name: "Follow-Up Agent", description: "Appointment reminders, rebooking campaigns, and birthday promotions" },
      { name: "Social Media Manager", description: "Post transformations, promotions, and engage with followers" },
    ],
    useCases: [
      { title: "24/7 Online & Phone Booking", description: "Clients book their next appointment anytime, with real-time availability checking." },
      { title: "Rebooking Automation", description: "AI contacts clients who haven't booked in 6+ weeks to schedule their next visit." },
      { title: "No-Show Recovery", description: "Automated reminders reduce no-shows; AI re-engages those who still miss." },
      { title: "Product Recommendation Follow-Up", description: "Post-visit follow-ups with personalized product recommendations and reorder reminders." },
    ],
    painPoints: [
      { title: "Front Desk Bottleneck", description: "Stylists can't answer phones mid-service, and the receptionist is checking out another client." },
      { title: "Rebooking Gaps", description: "Clients walk out without rebooking and don't come back for months." },
      { title: "No-Show Revenue Loss", description: "A single no-show costs $85+ and the slot usually can't be refilled on short notice." },
    ],
    roiExample: {
      title: "Typical Salon ROI",
      calculation: "20 no-shows/month × $85 avg ticket + 15 missed rebookings × $85",
      monthlyLoss: "$2,975 in lost appointment revenue",
      withAgent: "Appointment Setter + Follow-Up at $1,100/mo fills 60%+ of those gaps",
    },
  },

  /* ──────────────────────── 15. TECHNOLOGY COMPANIES ──────────────────────── */
  {
    name: "Technology Companies",
    slug: "technology-companies",
    icon: "💻",
    headline: "AI Agents for Technology Companies",
    subheadline: "Scale your operations without scaling your headcount",
    description:
      "Tech companies need to move fast and stay lean. Our AI agents handle customer support, lead qualification, content creation, and operational tasks—so your engineers and product team stay focused on building, not on admin.",
    stats: [
      { value: "45%", label: "Support Ticket Volume", detail: "of support tickets are repetitive and automatable" },
      { value: "$5,000", label: "Avg Deal Size", detail: "average SaaS annual contract value" },
      { value: "12 hrs", label: "Avg First Response", detail: "typical first response time for B2B SaaS support" },
    ],
    recommendedAgents: [
      { name: "Live Chat Agent", description: "24/7 technical support and product questions via chat" },
      { name: "Email Support Agent", description: "Ticket triage, response drafting, and escalation management" },
      { name: "Lead Gen Specialist", description: "Qualify inbound demo requests and outbound prospect identification" },
      { name: "Content Writer", description: "Blog posts, documentation, release notes, and marketing copy" },
      { name: "SEO Specialist", description: "Technical SEO audits, keyword research, and content optimization" },
      { name: "IT Help Desk", description: "Internal IT support for employee tech issues and onboarding" },
    ],
    useCases: [
      { title: "Tier-1 Support Automation", description: "AI handles common questions, password resets, and billing issues—escalating only complex cases." },
      { title: "Demo Request Qualification", description: "Every inbound demo request gets qualified and scheduled within minutes, not days." },
      { title: "Content Production Pipeline", description: "AI drafts blog posts, help docs, and release notes for human review and publishing." },
      { title: "Internal IT Support", description: "Handle employee tech requests, provisioning, and troubleshooting without dedicated IT staff." },
    ],
    painPoints: [
      { title: "Support Scalability", description: "Hiring support reps for $50K+/year each doesn't scale with your SaaS customer growth." },
      { title: "Engineer Distraction", description: "Engineers get pulled into customer issues, costing thousands in development productivity." },
      { title: "Content Bottleneck", description: "Marketing needs constant content but writing takes time away from product work." },
    ],
    roiExample: {
      title: "Typical SaaS Company ROI",
      calculation: "10 qualified leads lost/month × 15% close rate × $5,000 ACV",
      monthlyLoss: "$7,500 in lost annual recurring revenue",
      withAgent: "Lead Gen + Live Chat at $1,300/mo captures those leads while cutting support costs",
    },
  },

  /* ──────────────────────── 16. E-COMMERCE ──────────────────────── */
  {
    name: "E-Commerce",
    slug: "e-commerce",
    icon: "🛒",
    headline: "AI Agents for E-Commerce Businesses",
    subheadline: "Convert more browsers into buyers with instant, 24/7 support",
    description:
      "E-commerce never sleeps, and neither should your support. Our AI agents handle pre-sale questions, order tracking, returns processing, and abandoned cart recovery—turning hesitant browsers into loyal customers around the clock.",
    stats: [
      { value: "70%", label: "Cart Abandonment Rate", detail: "of online shopping carts are abandoned before purchase" },
      { value: "53%", label: "Expect Instant Answers", detail: "of shoppers abandon purchases if they can't get quick answers" },
      { value: "15%", label: "Recovery Rate", detail: "of abandoned carts recoverable with timely follow-up" },
    ],
    recommendedAgents: [
      { name: "Live Chat Agent", description: "Real-time product questions, sizing help, and purchase assistance" },
      { name: "Email Support Agent", description: "Order tracking, returns processing, and customer inquiries" },
      { name: "Follow-Up Agent", description: "Abandoned cart recovery, post-purchase follow-up, and review requests" },
      { name: "Social Media Manager", description: "Product showcases, UGC management, and DM customer support" },
      { name: "Content Writer", description: "Product descriptions, email campaigns, and landing page copy" },
      { name: "SEO Specialist", description: "Product page optimization, category structure, and technical SEO" },
    ],
    useCases: [
      { title: "Abandoned Cart Recovery", description: "AI contacts shoppers who left items in cart with personalized messages and incentives." },
      { title: "Pre-Sale Product Questions", description: "Instant answers about sizing, compatibility, shipping, and availability via chat." },
      { title: "Returns & Exchange Processing", description: "Handle return requests, generate labels, and process exchanges without human intervention." },
      { title: "Post-Purchase Review Collection", description: "Timely follow-ups after delivery to collect reviews and encourage repeat purchases." },
    ],
    painPoints: [
      { title: "Cart Abandonment Epidemic", description: "70% of shoppers leave without buying—most could be saved with a timely nudge." },
      { title: "24/7 Support Expectation", description: "Online shoppers expect instant answers at 11 PM, not a 24-hour email response." },
      { title: "Return Processing Overhead", description: "Manual return handling eats into margins and frustrates customers." },
    ],
    roiExample: {
      title: "Typical E-Commerce Store ROI",
      calculation: "500 abandoned carts/month × 10% recovery × $75 avg order value",
      monthlyLoss: "$3,750 in recoverable revenue sitting in abandoned carts",
      withAgent: "Follow-Up + Live Chat at $1,100/mo recovers that revenue and boosts conversion",
    },
  },

  /* ──────────────────────── 17. FINANCIAL SERVICES ──────────────────────── */
  {
    name: "Financial Services",
    slug: "financial-services",
    icon: "📊",
    headline: "AI Agents for Financial Services",
    subheadline: "Serve more clients without sacrificing the personal touch",
    description:
      "Financial advisors, CPAs, and wealth managers are limited by time. Our AI agents handle appointment scheduling, client onboarding, document collection, and nurture campaigns—so you can serve more clients without working more hours.",
    stats: [
      { value: "$250K", label: "Avg AUM Per Client", detail: "average assets under management per advisory client" },
      { value: "40%", label: "Onboarding Drop-Off", detail: "of prospects drop off during lengthy onboarding" },
      { value: "8 hrs/wk", label: "Admin Time", detail: "advisors spend on scheduling and paperwork" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Professional call handling for client inquiries and new prospect intake" },
      { name: "Appointment Setter", description: "Schedule reviews, planning sessions, and tax appointments" },
      { name: "Follow-Up Agent", description: "Nurture prospects through the long decision cycle with timely touchpoints" },
      { name: "Email Support Agent", description: "Document requests, account inquiries, and meeting prep materials" },
      { name: "CFO Advisor", description: "Financial analysis, cash flow management, and profitability tracking" },
      { name: "Data Entry Clerk", description: "Client data entry, account updates, and compliance documentation" },
    ],
    useCases: [
      { title: "Client Onboarding Automation", description: "AI guides new clients through document collection, account setup, and meeting scheduling." },
      { title: "Annual Review Scheduling", description: "Proactive outreach to schedule annual reviews so no client falls through the cracks." },
      { title: "Prospect Nurture Campaigns", description: "Long-term follow-up for prospects who aren't ready to commit yet." },
      { title: "Tax Season Scheduling", description: "Manage the tax season appointment rush with automated scheduling and document collection." },
    ],
    painPoints: [
      { title: "Long Sales Cycle Management", description: "Prospects take 6-12 months to decide—without systematic follow-up, they forget about you." },
      { title: "Compliance Documentation", description: "Regulatory requirements mean mountains of paperwork that eats into client-facing time." },
      { title: "Client Communication Expectations", description: "High-net-worth clients expect white-glove service that's hard to deliver at scale." },
    ],
    roiExample: {
      title: "Typical Financial Advisor ROI",
      calculation: "3 lost prospects/quarter × $250K AUM × 1% management fee",
      monthlyLoss: "$625/month in lost ongoing fee revenue",
      withAgent: "Follow-Up + Appointment Setter at $1,100/mo converts those prospects over time",
    },
  },

  /* ──────────────────────── 18. EDUCATION ──────────────────────── */
  {
    name: "Education",
    slug: "education",
    icon: "📚",
    headline: "AI Agents for Education & Training",
    subheadline: "Enroll more students and support them better — without adding staff",
    description:
      "Schools, tutoring centers, and training programs struggle with enrollment management, student support, and parent communication. Our AI agents handle inquiries, enrollment follow-ups, and routine support so educators can focus on teaching.",
    stats: [
      { value: "35%", label: "Inquiry-to-Enrollment", detail: "of program inquiries never receive follow-up" },
      { value: "$3,000", label: "Avg Enrollment Value", detail: "per student for tutoring or certification programs" },
      { value: "60%", label: "Parent Questions", detail: "of inbound calls are routine scheduling or policy questions" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Handle enrollment inquiries, class schedules, and parent questions" },
      { name: "Follow-Up Agent", description: "Enrollment follow-ups, re-enrollment campaigns, and student check-ins" },
      { name: "Appointment Setter", description: "Schedule campus tours, placement tests, and parent-teacher meetings" },
      { name: "Email Support Agent", description: "Application status updates, financial aid questions, and course information" },
      { name: "Content Writer", description: "Course descriptions, marketing materials, and newsletter content" },
    ],
    useCases: [
      { title: "Enrollment Pipeline Management", description: "Every inquiry gets instant follow-up and systematic nurturing through the decision process." },
      { title: "Re-Enrollment Campaigns", description: "Proactive outreach to families for next semester, term, or year registration." },
      { title: "Parent Communication Hub", description: "AI handles routine parent questions about schedules, policies, and events." },
      { title: "Student Engagement Tracking", description: "Automated check-ins with students who miss classes or show declining engagement." },
    ],
    painPoints: [
      { title: "Enrollment Leakage", description: "Interested families call once, don't enroll immediately, and never hear from you again." },
      { title: "Administrative Overwhelm", description: "Office staff spend all day answering the same questions instead of supporting students." },
      { title: "Re-Enrollment Drop-Off", description: "Existing students leave because no one proactively managed the re-enrollment process." },
    ],
    roiExample: {
      title: "Typical Tutoring Center ROI",
      calculation: "8 lost enrollments/month × $3,000 avg enrollment value",
      monthlyLoss: "$24,000 in potential enrollment revenue",
      withAgent: "Virtual Receptionist + Follow-Up at $1,000/mo captures 3-4 additional enrollments",
    },
  },

  /* ──────────────────────── 19. LOGISTICS & SHIPPING ──────────────────────── */
  {
    name: "Logistics & Shipping",
    slug: "logistics-shipping",
    icon: "🚛",
    headline: "AI Agents for Logistics & Shipping",
    subheadline: "Coordinate loads, track shipments, and communicate with drivers — automatically",
    description:
      "Logistics companies handle hundreds of calls daily about load status, ETAs, and scheduling. Our AI agents manage inbound inquiries, driver check-ins, customer updates, and dispatch coordination to keep freight moving efficiently.",
    stats: [
      { value: "200+", label: "Daily Inbound Calls", detail: "average calls per day for a mid-size logistics company" },
      { value: "35%", label: "Status Check Calls", detail: "of calls are simple shipment status inquiries" },
      { value: "$2,500", label: "Avg Load Value", detail: "average revenue per truckload shipment" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Handle shipper and carrier calls, load inquiries, and rate requests" },
      { name: "Phone Triage Agent", description: "Route calls by urgency—service failures, delays, and routine status" },
      { name: "Follow-Up Agent", description: "Carrier follow-ups, customer status updates, and payment reminders" },
      { name: "Data Entry Clerk", description: "Load entry, BOL processing, and rate confirmation documentation" },
      { name: "Email Support Agent", description: "Customer and carrier email management, rate quotes, and document handling" },
    ],
    useCases: [
      { title: "Automated Status Updates", description: "Customers get proactive shipment updates without calling your team." },
      { title: "Carrier Check-In Calls", description: "AI contacts drivers for location updates and appointment confirmations." },
      { title: "Load Board Lead Response", description: "Respond to load inquiries from carriers and brokers instantly." },
      { title: "Claims & Issue Triage", description: "Classify and route damage claims, delays, and service failures to the right team." },
    ],
    painPoints: [
      { title: "Phone Volume Overload", description: "Dispatchers can't move freight when they're answering 50+ status check calls a day." },
      { title: "Carrier Communication Gaps", description: "Drivers don't check in, loads go dark, and customers lose confidence." },
      { title: "Manual Data Entry Backlog", description: "Load entry, BOL processing, and rate confirmations pile up during peak periods." },
    ],
    roiExample: {
      title: "Typical Logistics Company ROI",
      calculation: "5 lost loads/month × $2,500 avg load value × 15% margin",
      monthlyLoss: "$1,875 in lost margin from missed load opportunities",
      withAgent: "Virtual Receptionist + Data Entry at $700/mo frees dispatchers to book more freight",
    },
  },

  /* ──────────────────────── 20. CLEANING SERVICES ──────────────────────── */
  {
    name: "Cleaning Services",
    slug: "cleaning-services",
    icon: "🧹",
    headline: "AI Agents for Cleaning Companies",
    subheadline: "Book more jobs, reduce callbacks, and grow without office staff",
    description:
      "Cleaning companies operate in the field all day—missing calls from new customers and existing clients. Our AI agents handle booking, scheduling, quality follow-ups, and recurring service management to grow your revenue without growing your overhead.",
    stats: [
      { value: "55%", label: "Calls Missed in Field", detail: "of cleaning company calls go unanswered during work hours" },
      { value: "$180", label: "Avg Job Value", detail: "average revenue per residential cleaning job" },
      { value: "$2,160", label: "Annual Client Value", detail: "per recurring bi-weekly cleaning customer" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Capture new client inquiries and handle service requests while you're cleaning" },
      { name: "Appointment Setter", description: "Schedule estimates, first cleanings, and recurring service start dates" },
      { name: "Follow-Up Agent", description: "Quality follow-ups after cleanings, re-engagement for lapsed clients" },
      { name: "Lead Gen Specialist", description: "New mover outreach and neighborhood saturation campaigns" },
    ],
    useCases: [
      { title: "Instant Quote & Booking", description: "New customers get a ballpark quote and booking within minutes of their first call." },
      { title: "Post-Clean Quality Check", description: "AI follows up after every cleaning to ensure satisfaction and catch issues early." },
      { title: "Recurring Service Reminders", description: "Automated scheduling confirmations and reminders to reduce same-day cancellations." },
      { title: "Seasonal Deep Clean Campaigns", description: "Proactive outreach for spring deep cleans, holiday prep, and move-in/move-out services." },
    ],
    painPoints: [
      { title: "Missed Call Revenue Drain", description: "You're vacuuming while $180 jobs call and hang up. They book with the next Google result." },
      { title: "No-Show Clients", description: "Customers forget scheduled cleanings, and you've already blocked time and sent a crew." },
      { title: "Client Churn Without Warning", description: "Customers stop booking without telling you why—no feedback loop to improve." },
    ],
    roiExample: {
      title: "Typical Cleaning Company ROI",
      calculation: "15 missed leads/month × 30% close rate × $2,160 annual value",
      monthlyLoss: "$9,720 in lost annual recurring revenue",
      withAgent: "Virtual Receptionist + Appointment Setter at $900/mo pays for itself with 1 new recurring client",
    },
  },

  /* ──────────────────────── 21. ROOFING ──────────────────────── */
  {
    name: "Roofing",
    slug: "roofing",
    icon: "🏠",
    headline: "AI Agents for Roofing Companies",
    subheadline: "Close more estimates and dominate storm season without office chaos",
    description:
      "Roofing companies face massive call spikes after storms and steady lead flow year-round. Our AI agents handle lead qualification, estimate follow-ups, insurance coordination communication, and referral campaigns—so you sell more roofs.",
    stats: [
      { value: "$8,500", label: "Avg Roof Job", detail: "average residential roof replacement value" },
      { value: "50%", label: "Estimates Go Cold", detail: "of roofing estimates never receive systematic follow-up" },
      { value: "300%", label: "Storm Season Spike", detail: "call volume increase during storm events" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Handle storm damage calls, inspection requests, and general inquiries" },
      { name: "Follow-Up Agent", description: "Persistent estimate follow-up and insurance supplement tracking" },
      { name: "Appointment Setter", description: "Schedule inspections, estimate presentations, and project start dates" },
      { name: "Lead Gen Specialist", description: "Door-knocking follow-up, neighborhood canvassing lead management" },
      { name: "Social Media Manager", description: "Before/after project photos, review solicitation, and storm response content" },
    ],
    useCases: [
      { title: "Storm Season Surge Management", description: "Handle 3x normal call volume after a hail event without hiring temporary staff." },
      { title: "Estimate Follow-Up Machine", description: "Every estimate gets 7+ touches until the homeowner decides—not just one call." },
      { title: "Insurance Process Communication", description: "Keep homeowners informed about claim status, supplement updates, and project timelines." },
      { title: "Neighborhood Canvassing Follow-Up", description: "Door-hanger and canvassing leads get automated follow-up calls and scheduling." },
    ],
    painPoints: [
      { title: "Storm Call Tsunami", description: "After a hail event, you get 100+ calls in a day. Half go to voicemail and hire someone else." },
      { title: "Long Sales Cycle Drop-Off", description: "Insurance jobs take weeks—homeowners forget or get poached by competitors who follow up." },
      { title: "Seasonal Revenue Volatility", description: "Without proactive outreach, winter months are dead with no pipeline." },
    ],
    roiExample: {
      title: "Typical Roofing Company ROI",
      calculation: "8 lost estimates/month × 25% close rate × $8,500 avg job value",
      monthlyLoss: "$17,000 in lost roofing revenue",
      withAgent: "Follow-Up + Virtual Receptionist at $1,000/mo closes 2+ extra jobs per month",
    },
  },

  /* ──────────────────────── 22. FITNESS & GYMS ──────────────────────── */
  {
    name: "Fitness & Gyms",
    slug: "fitness-gyms",
    icon: "💪",
    headline: "AI Agents for Fitness & Gyms",
    subheadline: "Convert more leads, reduce member churn, and fill your classes",
    description:
      "Gyms and fitness studios live on membership sales and retention. Our AI agents handle lead follow-up, class booking, membership renewal outreach, and win-back campaigns to grow your member base and keep it.",
    stats: [
      { value: "80%", label: "Leads Go Cold", detail: "of gym tour inquiries never get proper follow-up" },
      { value: "$50", label: "Avg Monthly Membership", detail: "average monthly membership fee" },
      { value: "30%", label: "Annual Churn Rate", detail: "typical gym membership cancellation rate" },
    ],
    recommendedAgents: [
      { name: "Lead Gen Specialist", description: "Follow up with website inquiries, trial sign-ups, and referral leads" },
      { name: "Follow-Up Agent", description: "Membership renewal campaigns, class attendance tracking, and win-backs" },
      { name: "Virtual Receptionist", description: "Handle calls about pricing, schedules, personal training, and memberships" },
      { name: "Appointment Setter", description: "Schedule gym tours, fitness assessments, and personal training sessions" },
      { name: "Social Media Manager", description: "Member spotlights, class promos, and challenge campaigns" },
    ],
    useCases: [
      { title: "Tour & Trial Follow-Up", description: "Every tour and free trial gets systematic follow-up until they join or say no." },
      { title: "Attendance Drop-Off Intervention", description: "AI contacts members whose attendance drops—before they cancel." },
      { title: "Class Waitlist Management", description: "Automated waitlist notifications when spots open in popular classes." },
      { title: "Win-Back Campaigns", description: "Re-engage cancelled members with targeted offers based on their usage history." },
    ],
    painPoints: [
      { title: "Lead Follow-Up Failure", description: "Front desk staff are too busy checking in members to follow up with new leads." },
      { title: "Silent Quitters", description: "Members stop coming but don't cancel. By the time they do, it's too late to save them." },
      { title: "Class Capacity Management", description: "Popular classes are full while others are empty—no system to balance demand." },
    ],
    roiExample: {
      title: "Typical Gym / Studio ROI",
      calculation: "20 lost leads/month × 25% conversion × $50/mo × 12 months",
      monthlyLoss: "$3,000 in lost annual membership revenue per month",
      withAgent: "Lead Gen + Follow-Up at $1,400/mo captures 5+ new members monthly",
    },
  },

  /* ──────────────────────── 23. ACCOUNTING FIRMS ──────────────────────── */
  {
    name: "Accounting Firms",
    slug: "accounting-firms",
    icon: "📋",
    headline: "AI Agents for Accounting Firms",
    subheadline: "Scale your practice without drowning in admin during tax season",
    description:
      "Accounting firms face extreme seasonality—overwhelmed during tax season, underutilized otherwise. Our AI agents handle client scheduling, document collection, prospect follow-up, and routine inquiries so accountants maximize billable hours year-round.",
    stats: [
      { value: "65%", label: "Revenue in Tax Season", detail: "of annual revenue concentrated in Jan–April" },
      { value: "$2,500", label: "Avg Client Value", detail: "average annual revenue per accounting client" },
      { value: "15 hrs/wk", label: "Non-Billable Admin", detail: "spent on scheduling, reminders, and document chasing" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Professional call handling during peak season when everyone's heads-down" },
      { name: "Appointment Setter", description: "Tax appointment scheduling, quarterly review meetings, and advisory sessions" },
      { name: "Follow-Up Agent", description: "Document collection reminders, new client nurture, and referral campaigns" },
      { name: "Email Support Agent", description: "Client inquiries, document requests, and deadline reminders" },
      { name: "Data Entry Clerk", description: "Client data organization, document categorization, and CRM updates" },
    ],
    useCases: [
      { title: "Tax Season Appointment Blitz", description: "AI handles the January rush of scheduling calls so your team focuses on returns." },
      { title: "Document Collection Automation", description: "Systematic follow-up with clients who haven't submitted their tax documents." },
      { title: "Advisory Service Upselling", description: "Identify and contact clients who could benefit from payroll, bookkeeping, or advisory services." },
      { title: "Year-Round Client Engagement", description: "Quarterly touchpoints to provide value and stay top-of-mind outside of tax season." },
    ],
    painPoints: [
      { title: "Tax Season Chaos", description: "200+ clients need appointments in 3 months and your 2-person office can't keep up." },
      { title: "Document Chasing", description: "You send reminders, clients ignore them, and you're scrambling at the deadline." },
      { title: "Off-Season Revenue Gaps", description: "May through December is quiet because you don't have time to market advisory services." },
    ],
    roiExample: {
      title: "Typical Accounting Firm ROI",
      calculation: "10 lost prospects/year ÷ 12 × $2,500 annual value",
      monthlyLoss: "$2,083 in lost annual client revenue",
      withAgent: "Virtual Receptionist + Follow-Up at $1,000/mo captures clients during your busiest periods",
    },
  },

  /* ──────────────────────── 24. CONSULTING ──────────────────────── */
  {
    name: "Consulting",
    slug: "consulting",
    icon: "🎯",
    headline: "AI Agents for Consulting Firms",
    subheadline: "Spend more time consulting and less time chasing leads and admin",
    description:
      "Consultants sell their time—every hour spent on admin is revenue lost. Our AI agents handle lead qualification, meeting scheduling, proposal follow-ups, and client communication so you focus on delivering high-value advisory work.",
    stats: [
      { value: "$200/hr", label: "Avg Billable Rate", detail: "typical management consulting hourly rate" },
      { value: "35%", label: "Time on Admin", detail: "of a consultant's time is spent on non-billable admin" },
      { value: "60%", label: "Proposals Ghost", detail: "of proposals don't receive follow-up within 7 days" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Professional call handling for client and prospect inquiries" },
      { name: "Appointment Setter", description: "Discovery calls, strategy sessions, and project kickoff meetings" },
      { name: "Follow-Up Agent", description: "Proposal follow-ups, referral requests, and client check-ins" },
      { name: "Lead Gen Specialist", description: "Identify and reach out to ideal client profiles" },
      { name: "Content Writer", description: "Thought leadership articles, case studies, and white papers" },
      { name: "CEO Advisor", description: "Strategic business analysis and competitive intelligence" },
    ],
    useCases: [
      { title: "Discovery Call Scheduling", description: "AI qualifies prospects and schedules discovery calls without back-and-forth email." },
      { title: "Proposal Follow-Up Automation", description: "Every proposal gets systematic follow-up until the prospect decides." },
      { title: "Client Engagement Reporting", description: "Automated project updates and milestone communications to clients." },
      { title: "Thought Leadership Pipeline", description: "AI drafts blog posts and LinkedIn content based on your expertise areas." },
    ],
    painPoints: [
      { title: "Feast-or-Famine Pipeline", description: "When you're busy with clients, marketing stops. When projects end, the pipeline is dry." },
      { title: "Proposal Black Hole", description: "You spend days writing proposals that never get followed up on." },
      { title: "Admin Time Sink", description: "Scheduling, invoicing, and email eat 15+ hours/week of potential $200/hr billable time." },
    ],
    roiExample: {
      title: "Typical Solo Consultant ROI",
      calculation: "8 hrs/week saved from admin × $200/hr billable rate × 4 weeks",
      monthlyLoss: "$6,400 in potential billable hours lost to admin",
      withAgent: "Virtual Receptionist + Follow-Up at $1,000/mo frees 8+ billable hours weekly",
    },
  },

  /* ──────────────────────── 25. NONPROFITS ──────────────────────── */
  {
    name: "Nonprofits",
    slug: "nonprofits",
    icon: "🤝",
    headline: "AI Agents for Nonprofit Organizations",
    subheadline: "Maximize your impact without maximizing your budget",
    description:
      "Nonprofits do more with less — but that shouldn't mean ignoring donors, missing volunteer coordination, or letting grant deadlines slip. Our AI agents handle donor communication, event coordination, and operational tasks so your team focuses on mission-critical work.",
    stats: [
      { value: "60%", label: "Donor Retention Rate", detail: "average first-year donor retention (40% never give again)" },
      { value: "$500", label: "Avg Donor Value", detail: "average annual donation from recurring donors" },
      { value: "20 hrs/wk", label: "Admin Per Staff", detail: "spent on emails, calls, and coordination instead of programs" },
    ],
    recommendedAgents: [
      { name: "Virtual Receptionist", description: "Handle donor calls, volunteer inquiries, and service requests" },
      { name: "Follow-Up Agent", description: "Donor stewardship, thank-you sequences, and re-engagement campaigns" },
      { name: "Email Support Agent", description: "Volunteer communication, event logistics, and donor inquiries" },
      { name: "Social Media Manager", description: "Impact stories, event promotion, and community engagement" },
      { name: "Content Writer", description: "Grant applications, newsletters, annual reports, and impact stories" },
      { name: "Data Entry Clerk", description: "Donor database maintenance, grant tracking, and reporting" },
    ],
    useCases: [
      { title: "Donor Stewardship Automation", description: "Every donor gets personalized thank-yous, impact updates, and renewal reminders." },
      { title: "Volunteer Coordination", description: "AI handles volunteer scheduling, shift reminders, and follow-up communications." },
      { title: "Event Registration & Follow-Up", description: "Manage RSVPs, send reminders, and follow up with attendees post-event." },
      { title: "Grant Deadline Tracking", description: "Automated reminders for upcoming grant deadlines with status tracking." },
    ],
    painPoints: [
      { title: "Donor Communication Gaps", description: "First-time donors never hear from you again and 40% never give a second time." },
      { title: "Volunteer Management Chaos", description: "Coordinating dozens of volunteers via phone and email is a full-time job." },
      { title: "Staff Stretched Too Thin", description: "A 3-person team can't run programs, manage donors, coordinate events, and write grants." },
    ],
    roiExample: {
      title: "Typical Nonprofit ROI",
      calculation: "50 lapsed first-year donors × 20% saveable × $500 avg annual gift",
      monthlyLoss: "$5,000 in lost annual donations from donor churn",
      withAgent: "Follow-Up + Email Support at $1,000/mo recovers donors and frees 20+ staff hours/week",
    },
  },
];

/* ─── LOOKUP HELPERS ─── */
export const INDUSTRY_MAP = new Map(INDUSTRIES.map((i) => [i.slug, i]));
export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return INDUSTRY_MAP.get(slug);
}
