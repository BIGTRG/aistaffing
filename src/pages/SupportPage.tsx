// @ts-nocheck
import { Headphones, Mail, MessageSquare, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupportPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">Support</h1>
				<p className="text-gray-500">Get help with your AI agents and account.</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Card className="border-gray-200 hover:border-amber-300 transition-colors cursor-pointer">
					<CardHeader className="pb-3">
						<div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
							<MessageSquare className="size-5 text-amber-600" />
						</div>
						<CardTitle className="text-base">Live Chat</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-500">Chat with our support team in real-time. Average response time under 2 minutes.</p>
					</CardContent>
				</Card>

				<Card className="border-gray-200 hover:border-amber-300 transition-colors cursor-pointer">
					<CardHeader className="pb-3">
						<div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
							<Mail className="size-5 text-blue-600" />
						</div>
						<CardTitle className="text-base">Email Support</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-500">Send us an email at support@aistaffingagency.com. We reply within 4 hours.</p>
					</CardContent>
				</Card>

				<Card className="border-gray-200 hover:border-amber-300 transition-colors cursor-pointer">
					<CardHeader className="pb-3">
						<div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
							<Phone className="size-5 text-emerald-600" />
						</div>
						<CardTitle className="text-base">Phone</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-500">Call us at (800) 555-0199. Available Monday – Friday, 9am – 6pm EST.</p>
					</CardContent>
				</Card>
			</div>

			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Headphones className="size-5 text-amber-600" />
						Frequently Asked Questions
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="divide-y divide-gray-100">
						{[
							{ q: "How do I add a new AI agent?", a: "Go to 'My Agents' in the sidebar and click 'Browse Agent Roster' to explore available agent types. Deploy any agent with one click." },
							{ q: "Can I customize my agent's responses?", a: "Yes! Click 'Configure' on any deployed agent to set business hours, services, custom instructions, tone, and more." },
							{ q: "How do I view my agent's conversations?", a: "Visit 'Conversation Logs' in the sidebar to see every chat, call, and email your agents have handled." },
							{ q: "What if my agent escalates a call?", a: "When an agent escalates, you'll receive a notification and the caller will be transferred to your configured phone number." },
							{ q: "How does billing work?", a: "Each agent has a monthly rate. Visit 'Billing' to see your active contracts, invoices, and payment history." },
						].map((faq, i) => (
							<div key={i} className="py-4 first:pt-0 last:pb-0">
								<p className="font-medium text-sm text-gray-900">{faq.q}</p>
								<p className="text-sm text-gray-500 mt-1">{faq.a}</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
