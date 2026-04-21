import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
	Bot,
	MessageSquare,
	Phone,
	Mail,
	Globe,
	User,
	ChevronDown,
	ChevronRight,
	Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConversationsPage() {
	const org = useQuery(api.organizations.getMine);
	const conversations = useQuery(
		api.conversations.listByOrg,
		org ? { orgId: org._id } : "skip",
	);

	const [search, setSearch] = useState("");
	const [channelFilter, setChannelFilter] = useState<string>("all");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const channelIcons: Record<string, React.ElementType> = {
		chat: MessageSquare,
		phone: Phone,
		email: Mail,
		sms: Globe,
	};

	const channelColors: Record<string, string> = {
		chat: "bg-blue-50 text-blue-700",
		phone: "bg-emerald-50 text-emerald-700",
		email: "bg-purple-50 text-purple-700",
		sms: "bg-amber-50 text-amber-700",
	};

	const outcomeColors: Record<string, string> = {
		resolved: "bg-emerald-50 text-emerald-700",
		escalated: "bg-red-50 text-red-700",
		sale_closed: "bg-blue-50 text-blue-700",
		appointment_booked: "bg-purple-50 text-purple-700",
		follow_up: "bg-amber-50 text-amber-700",
	};

	const filtered = (conversations ?? []).filter((c) => {
		if (channelFilter !== "all" && c.channel !== channelFilter) return false;
		if (search) {
			const q = search.toLowerCase();
			return (
				(c.contactName?.toLowerCase().includes(q)) ||
				(c.summary?.toLowerCase().includes(q)) ||
				(c.agentName?.toLowerCase().includes(q))
			);
		}
		return true;
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">
					Conversation Logs
				</h1>
				<p className="text-gray-500">
					Full history of every chat, call, and email your agents have handled.
				</p>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search conversations..."
						className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
					/>
				</div>
				<div className="flex gap-2">
					{["all", "chat", "phone", "email", "sms"].map((ch) => (
						<button
							key={ch}
							onClick={() => setChannelFilter(ch)}
							className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
								channelFilter === ch
									? "bg-slate-800 text-white"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							{ch === "all" ? "All" : ch.charAt(0).toUpperCase() + ch.slice(1)}
						</button>
					))}
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<Card className="border-gray-200">
					<CardContent className="p-4">
						<p className="text-xs text-gray-500">Total Conversations</p>
						<p className="text-2xl font-bold text-gray-900">
							{conversations?.length ?? 0}
						</p>
					</CardContent>
				</Card>
				<Card className="border-gray-200">
					<CardContent className="p-4">
						<p className="text-xs text-gray-500">Chats</p>
						<p className="text-2xl font-bold text-blue-700">
							{conversations?.filter((c) => c.channel === "chat").length ?? 0}
						</p>
					</CardContent>
				</Card>
				<Card className="border-gray-200">
					<CardContent className="p-4">
						<p className="text-xs text-gray-500">Phone Calls</p>
						<p className="text-2xl font-bold text-emerald-700">
							{conversations?.filter((c) => c.channel === "phone").length ?? 0}
						</p>
					</CardContent>
				</Card>
				<Card className="border-gray-200">
					<CardContent className="p-4">
						<p className="text-xs text-gray-500">Emails</p>
						<p className="text-2xl font-bold text-purple-700">
							{conversations?.filter((c) => c.channel === "email").length ?? 0}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Conversations List */}
			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-gray-900">
						<MessageSquare className="size-5 text-slate-800" />
						All Conversations
						<span className="text-sm font-normal text-gray-500">
							({filtered.length})
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{filtered.length > 0 ? (
						<div className="divide-y divide-gray-100">
							{filtered.map((conv) => {
								const ChannelIcon = channelIcons[conv.channel] ?? MessageSquare;
								const isExpanded = expandedId === conv._id;
								return (
									<div key={conv._id} className="py-3">
										<button
											onClick={() => setExpandedId(isExpanded ? null : conv._id)}
											className="w-full flex items-center gap-3 text-left"
										>
											<div className={`size-9 rounded-lg flex items-center justify-center flex-shrink-0 ${channelColors[conv.channel] ?? "bg-gray-100 text-gray-600"}`}>
												<ChannelIcon className="size-4" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<p className="text-sm font-medium text-gray-900 truncate">
														{conv.contactName ?? "Visitor"}
													</p>
													{conv.outcome && (
														<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${outcomeColors[conv.outcome] ?? "bg-gray-100 text-gray-600"}`}>
															{conv.outcome.replace("_", " ")}
														</span>
													)}
												</div>
												<p className="text-xs text-gray-500 truncate">
													{conv.agentName ?? "Agent"} · {conv.summary ?? "No summary"}
												</p>
											</div>
											<div className="flex items-center gap-3 flex-shrink-0">
												{conv.durationSeconds && (
													<span className="text-xs text-gray-400">
														{Math.floor(conv.durationSeconds / 60)}m {conv.durationSeconds % 60}s
													</span>
												)}
												<span className="text-xs text-gray-400">
													{new Date(conv.startedAt).toLocaleDateString()}
												</span>
												{isExpanded ? (
													<ChevronDown className="size-4 text-gray-400" />
												) : (
													<ChevronRight className="size-4 text-gray-400" />
												)}
											</div>
										</button>

										{/* Expanded transcript */}
										{isExpanded && (
											<div className="mt-3 ml-12 p-4 bg-gray-50 rounded-lg">
												<ConversationTranscript conversationId={conv._id} />
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
								<MessageSquare className="size-7 text-gray-400" />
							</div>
							<p className="text-sm font-medium text-gray-700">
								No conversations yet
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Conversations will appear here as your agents handle chats, calls, and emails.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function ConversationTranscript({ conversationId }: { conversationId: string }) {
	const messages = useQuery(
		api.messages.listByConversation,
		{ conversationId: conversationId as any },
	);

	if (!messages || messages.length === 0) {
		return (
			<p className="text-xs text-gray-500 italic">No transcript available</p>
		);
	}

	return (
		<div className="space-y-2">
			<p className="text-xs font-medium text-gray-700 mb-2">Transcript</p>
			{messages.map((msg, i) => (
				<div
					key={i}
					className={`flex gap-2 ${msg.role === "assistant" || msg.role === "agent" ? "" : "justify-end"}`}
				>
					{(msg.role === "assistant" || msg.role === "agent") && (
						<div className="size-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
							<Bot className="size-3 text-slate-600" />
						</div>
					)}
					<div
						className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
							msg.role === "assistant" || msg.role === "agent"
								? "bg-white border border-gray-200 text-gray-800"
								: "bg-blue-600 text-white"
						}`}
					>
						{msg.content}
					</div>
					{msg.role !== "assistant" && msg.role !== "agent" && (
						<div className="size-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
							<User className="size-3 text-blue-600" />
						</div>
					)}
				</div>
			))}
		</div>
	);
}
