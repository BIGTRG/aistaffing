import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "August 1, 2026";

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-white text-[#1A1D23]">
			<header className="border-b border-[#1A1D23]/10 px-6 py-4 flex items-center justify-between">
				<Link to="/" className="font-bold tracking-tight text-lg">
					AI STAFFING AGENCY
				</Link>
				<nav className="flex gap-6 text-sm text-[#1A1D23]/70">
					<Link to="/terms" className="hover:text-[#1A1D23]">Terms</Link>
					<Link to="/privacy" className="hover:text-[#1A1D23]">Privacy</Link>
				</nav>
			</header>
			<main className="max-w-3xl mx-auto px-6 py-14">
				<h1 className="text-3xl font-bold mb-2">{title}</h1>
				<p className="text-sm text-[#1A1D23]/60 mb-10">Effective date: {EFFECTIVE_DATE}</p>
				<div className="legal-body space-y-6 text-[15px] leading-7 text-[#1A1D23]/85 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-2 [&_h2]:text-[#1A1D23] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
					{children}
				</div>
			</main>
			<footer className="border-t border-[#1A1D23]/10 py-8 text-center text-xs text-[#1A1D23]/50">
				© {new Date().getFullYear()} AI Staffing Agency — A TRG Tech Link Company ·{" "}
				<a href="mailto:support@aistaffingagency.ai" className="underline">support@aistaffingagency.ai</a>
			</footer>
		</div>
	);
}

export function TermsPage() {
	return (
		<LegalLayout title="Terms of Service">
			<p>
				These Terms of Service ("Terms") govern your access to and use of the AI Staffing Agency platform,
				website at aistaffingagency.ai, and related services (collectively, the "Service"), operated by
				TRG Tech Link LLC ("TRG," "we," "us"). By creating an account or using the Service you agree to
				these Terms. If you use the Service on behalf of a business, you represent that you have authority
				to bind that business.
			</p>

			<h2>1. The Service</h2>
			<p>
				AI Staffing Agency provides software-based AI agents that perform business workflows such as
				answering calls and chats, sending messages, scheduling, and back-office automation. AI agents are
				software tools, not human employees, contractors, or a staffing agency in the employment-law sense.
				We do not place human workers and are not an employer of record.
			</p>

			<h2>2. Accounts</h2>
			<p>
				You must provide accurate information, keep credentials secure, and be at least 18 years old. You
				are responsible for all activity under your account.
			</p>

			<h2>3. Acceptable Use and Communications Compliance</h2>
			<p>You agree not to use the Service to violate any law, and specifically that you are solely responsible for:</p>
			<ul>
				<li>Obtaining all consents required for calls, texts, and emails your AI agents send on your behalf, including under the Telephone Consumer Protection Act (TCPA), state telemarketing laws, CAN-SPAM, and CASL;</li>
				<li>Honoring do-not-call lists, opt-outs, and quiet hours;</li>
				<li>Disclosing, where required by law, that a caller or chat participant is interacting with an automated or AI system (including under state bot-disclosure laws);</li>
				<li>Ensuring content generated or sent through your account is lawful, accurate, and non-deceptive.</li>
			</ul>
			<p>
				You may not use the Service for emergency services, for legal, medical, or financial advice delivered
				as professional services, or in any regulated activity that requires a license you do not hold.
			</p>

			<h2>4. AI Output Disclaimer</h2>
			<p>
				AI-generated output may be inaccurate or incomplete. You must review output before relying on it for
				consequential decisions. The Service does not provide legal, tax, accounting, or medical advice.
			</p>

			<h2>5. Fees and Billing</h2>
			<p>
				Paid plans are billed in advance on a recurring basis at the prices shown at purchase. Fees are
				non-refundable except where required by law. We may change pricing with at least 30 days' notice
				effective at your next renewal. You may cancel at any time, effective at the end of the current
				billing period.
			</p>

			<h2>6. Your Data</h2>
			<p>
				You retain ownership of data you submit ("Customer Data"). You grant us a license to process Customer
				Data to provide, secure, and improve the Service. Our handling of personal information is described
				in the <Link to="/privacy" className="underline">Privacy Policy</Link>. You are responsible for having a lawful basis to share any personal
				information of your own customers with us.
			</p>

			<h2>7. Intellectual Property</h2>
			<p>
				The Service, including software, models, agent templates, and branding, is owned by TRG or its
				licensors. We grant you a limited, non-exclusive, non-transferable right to use the Service during
				your subscription. You may not reverse engineer, resell, or use the Service to build a competing product.
			</p>

			<h2>8. Third-Party Services</h2>
			<p>
				The Service interoperates with third-party providers (for example telephony, payments, and AI model
				providers). Their terms govern your use of their services, and we are not responsible for them.
			</p>

			<h2>9. Warranty Disclaimer</h2>
			<p>
				THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
				IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
			</p>

			<h2>10. Limitation of Liability</h2>
			<p>
				TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRG WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
				CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS OR DATA. OUR TOTAL LIABILITY FOR ANY CLAIM IS
				LIMITED TO THE AMOUNTS YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM AROSE.
			</p>

			<h2>11. Indemnification</h2>
			<p>
				You will indemnify and hold TRG harmless from claims arising out of your Customer Data, your use of
				the Service in violation of these Terms, or your violation of law, including communications-law
				claims relating to messages your agents send.
			</p>

			<h2>12. Termination</h2>
			<p>
				You may stop using the Service at any time. We may suspend or terminate accounts that violate these
				Terms or create legal risk. Upon termination we will make Customer Data available for export for 30
				days, after which it may be deleted.
			</p>

			<h2>13. Governing Law; Disputes</h2>
			<p>
				These Terms are governed by the laws of the State of North Carolina, without regard to conflicts of
				law rules. Disputes will be resolved in the state or federal courts located in North Carolina, and
				each party consents to their jurisdiction. Either party may seek injunctive relief for misuse of
				intellectual property or confidential information.
			</p>

			<h2>14. Changes</h2>
			<p>
				We may update these Terms. Material changes will be announced by email or in-product notice at least
				14 days before taking effect. Continued use after the effective date constitutes acceptance.
			</p>

			<h2>15. Contact</h2>
			<p>
				TRG Tech Link LLC · AI Staffing Agency ·{" "}
				<a href="mailto:support@aistaffingagency.ai" className="underline">support@aistaffingagency.ai</a>
			</p>
		</LegalLayout>
	);
}

export function PrivacyPage() {
	return (
		<LegalLayout title="Privacy Policy">
			<p>
				This Privacy Policy explains how TRG Tech Link LLC ("we," "us") collects, uses, and shares personal
				information in connection with the AI Staffing Agency platform and website at aistaffingagency.ai
				(the "Service").
			</p>

			<h2>1. Information We Collect</h2>
			<ul>
				<li><strong>Account information</strong> — name, business name, email, phone, billing details.</li>
				<li><strong>Service content</strong> — conversations, call transcripts, messages, and workflow data processed by your AI agents, which may include personal information of your customers.</li>
				<li><strong>Usage data</strong> — log data, device and browser information, pages viewed, and feature usage.</li>
				<li><strong>Cookies</strong> — session and analytics cookies. You can control cookies through your browser.</li>
			</ul>

			<h2>2. How We Use Information</h2>
			<ul>
				<li>Provide, operate, and secure the Service;</li>
				<li>Process payments and send transactional communications;</li>
				<li>Improve the Service, including quality assurance of AI agent performance;</li>
				<li>Comply with law and enforce our Terms.</li>
			</ul>
			<p>
				We do not sell personal information, and we do not use your private business conversations to train
				generalized AI models for other customers.
			</p>

			<h2>3. Processor Role for Client Data</h2>
			<p>
				When your AI agents process personal information belonging to your customers, we act as a service
				provider/processor on your instructions. You are the controller/business responsible for providing
				privacy notices to and obtaining any required consents from your customers, including consent to
				call or text and any required disclosure that they are interacting with an AI system.
			</p>

			<h2>4. Sharing</h2>
			<p>We share personal information only with:</p>
			<ul>
				<li>Service providers under contract (hosting, telephony, payments, AI model providers) who may use it only to provide services to us;</li>
				<li>Authorities when required by law or to protect rights and safety;</li>
				<li>A successor entity in a merger, acquisition, or asset sale.</li>
			</ul>

			<h2>5. Retention</h2>
			<p>
				We retain personal information for as long as your account is active and as needed to comply with
				legal obligations, then delete or de-identify it. Conversation data can be deleted on request or via
				account closure (export window: 30 days).
			</p>

			<h2>6. Security</h2>
			<p>
				We use administrative, technical, and physical safeguards appropriate to the sensitivity of the data,
				including encryption in transit, access controls, and audit logging. No system is perfectly secure;
				report concerns to <a href="mailto:support@aistaffingagency.ai" className="underline">support@aistaffingagency.ai</a>.
			</p>

			<h2>7. Your Rights</h2>
			<p>
				Depending on where you live (including under the GDPR, CCPA/CPRA, and similar state laws), you may
				have rights to access, correct, delete, or export your personal information, to opt out of certain
				processing, and to non-discrimination for exercising those rights. Submit requests to{" "}
				<a href="mailto:support@aistaffingagency.ai" className="underline">support@aistaffingagency.ai</a>. We will verify your identity and respond within the time
				required by law. If you are in the EEA or UK, our lawful bases are contract performance, legitimate
				interests, consent, and legal obligation, and you may lodge a complaint with your supervisory authority.
			</p>

			<h2>8. Call Recording and Transcription</h2>
			<p>
				AI voice agents may record and transcribe calls to deliver the Service. Clients are responsible for
				complying with call-recording consent laws in their jurisdictions (some states require all-party
				consent) and for playing any required disclosures at the start of calls.
			</p>

			<h2>9. Children</h2>
			<p>The Service is for business use and is not directed to children under 16. We do not knowingly collect their data.</p>

			<h2>10. Changes</h2>
			<p>
				We will post updates here and revise the effective date. Material changes will be notified by email
				or in-product notice.
			</p>

			<h2>11. Contact</h2>
			<p>
				TRG Tech Link LLC · AI Staffing Agency ·{" "}
				<a href="mailto:support@aistaffingagency.ai" className="underline">support@aistaffingagency.ai</a>
			</p>
		</LegalLayout>
	);
}
