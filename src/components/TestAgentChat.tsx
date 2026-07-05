import { useState, useRef, useEffect } from "react";
import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Bot,
	Send,
	MessageSquare,
	Clock,
	User,
	Loader2,
	RotateCcw,
	History,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface TestAgentChatProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deployment: {
		_id: Id<"deployments">;
		displayName: string;
		status: string;
		orgId: Id<"organizations">;
		templateId: Id<"agentTemplates">;
		template?: {
			name: string;
			department: string;
			description: string;
		} | null;
	};
	orgName: string;
	orgIndustry: string;
}

function generateSessionId() {
	return `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function TestAgentChat({
	open,
	onOpenChange,
	deployment,
	orgName,
	orgIndustry,
}: TestAgentChatProps) {
	const [sessionId, setSessionId] = useState(() => generateSessionId());
	const [input, setInput] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [activeTab, setActiveTab] = useState("chat");
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Real-time conversation messages
	const messages = useApiQuery(() => api.chatAgent.getConversation({
		deploymentId: deployment.id,
		sessionId,
	}), []);

	// Past conversations list
	const pastConversations = useApiQuery(() => api.chatAgent.listConversations({
		deploymentId: deployment.id,
	}), []);

	const getAiResponse = async (...args: any[]) => api.chatAgent.getAiResponse(...args);

	// Auto-scroll on new messages
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	// Focus input when dialog opens
	useEffect(() => {
		if (open && activeTab === "chat") {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [open, activeTab]);

	const handleSend = async () => {
		const trimmed = input.trim();
		if (!trimmed || isSending) return;

		setInput("");
		setIsSending(true);

		try {
			await getAiResponse({
				deploymentId: deployment.id,
				sessionId,
				userMessage: trimmed,
				businessName: orgName,
				businessDescription: orgIndustry,
				agentName: deployment.displayName,
				agentRole: deployment.template?.description ?? "AI Assistant",
			});
		} catch (err) {
			toast.error("Failed to get response. Please try again.");
		} finally {
			setIsSending(false);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const startNewSession = () => {
		setSessionId(generateSessionId());
		setInput("");
	};

	const viewPastSession = (sid: string) => {
		setSessionId(sid);
		setActiveTab("chat");
	};

	const agentInitials = deployment.displayName
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
				{/* Header */}
				<DialogHeader className="px-6 py-4 border-b flex-shrink-0">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
								{agentInitials}
							</div>
							<div>
								<DialogTitle className="text-base">
									Test {deployment.displayName}
								</DialogTitle>
								<p className="text-xs text-gray-500">
									{deployment.template?.department} · {deployment.template?.name}
								</p>
							</div>
						</div>
					</div>
				</DialogHeader>

				{/* Tabs */}
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex-1 flex flex-col min-h-0"
				>
					<div className="px-6 pt-2 flex-shrink-0">
						<TabsList className="w-full grid grid-cols-2">
							<TabsTrigger value="chat" className="gap-1.5">
								<MessageSquare className="size-3.5" />
								Live Chat
							</TabsTrigger>
							<TabsTrigger value="history" className="gap-1.5">
								<History className="size-3.5" />
								History
								{pastConversations && pastConversations.length > 0 && (
									<span className="ml-1 text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded-full">
										{pastConversations.length}
									</span>
								)}
							</TabsTrigger>
						</TabsList>
					</div>

					{/* Live Chat Tab */}
					<TabsContent
						value="chat"
						className="flex-1 flex flex-col min-h-0 mt-0 p-0 data-[state=active]:flex"
					>
						{/* Messages Area */}
						<div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
							{/* Welcome message */}
							{(!messages || messages.length === 0) && !isSending && (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
										<Bot className="size-8 text-slate-500" />
									</div>
									<h3 className="font-semibold text-gray-900 mb-1">
										Test {deployment.displayName}
									</h3>
									<p className="text-sm text-gray-500 max-w-sm">
										Chat with your agent just like a website visitor would.
										Type a message below to start the conversation.
									</p>
									<div className="flex flex-wrap gap-2 mt-4">
										{["Hi, I need help", "What services do you offer?", "I'd like to schedule a consultation"].map((suggestion) => (
											<button
												key={suggestion}
												onClick={() => {
													setInput(suggestion);
													setTimeout(() => inputRef.current?.focus(), 50);
												}}
												className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
											>
												{suggestion}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Message bubbles */}
							{messages?.map((msg) => (
								<div
									key={msg.id}
									className={`flex items-start gap-2.5 ${
										msg.role === "user" ? "flex-row-reverse" : ""
									}`}
								>
									<div
										className={`size-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
											msg.role === "user"
												? "bg-blue-100"
												: "bg-slate-800"
										}`}
									>
										{msg.role === "user" ? (
											<User className="size-3.5 text-blue-600" />
										) : (
											<Bot className="size-3.5 text-white" />
										)}
									</div>
									<div
										className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
											msg.role === "user"
												? "bg-blue-600 text-white"
												: "bg-gray-100 text-gray-900"
										}`}
									>
										<p className="text-sm whitespace-pre-wrap leading-relaxed">
											{msg.content}
										</p>
										<p
											className={`text-[10px] mt-1 ${
												msg.role === "user"
													? "text-blue-200"
													: "text-gray-400"
											}`}
										>
											{msg.timestamp
												? new Date(msg.timestamp).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})
												: ""}
										</p>
									</div>
								</div>
							))}

							{/* Typing indicator */}
							{isSending && (
								<div className="flex items-start gap-2.5">
									<div className="size-7 rounded-lg bg-slate-800 flex items-center justify-center">
										<Bot className="size-3.5 text-white" />
									</div>
									<div className="bg-gray-100 rounded-2xl px-4 py-3">
										<div className="flex gap-1">
											<span className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
											<span className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
											<span className="size-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Input Area */}
						<div className="border-t px-6 py-3 flex-shrink-0">
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="icon"
									className="flex-shrink-0 size-9"
									onClick={startNewSession}
									title="New conversation"
								>
									<RotateCcw className="size-4" />
								</Button>
								<div className="flex-1 relative">
									<input
										ref={inputRef}
										type="text"
										value={input}
										onChange={(e) => setInput(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder="Type a message as a visitor..."
										disabled={isSending}
										className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent pr-10 disabled:opacity-50"
									/>
								</div>
								<Button
									onClick={handleSend}
									disabled={!input.trim() || isSending}
									size="icon"
									className="flex-shrink-0 size-9 bg-slate-800 hover:bg-slate-900"
								>
									{isSending ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Send className="size-4" />
									)}
								</Button>
							</div>
							<p className="text-[10px] text-gray-400 mt-1.5 text-center">
								This is a test chat — messages are stored in conversation history
							</p>
						</div>
					</TabsContent>

					{/* History Tab */}
					<TabsContent
						value="history"
						className="flex-1 min-h-0 mt-0 p-0 data-[state=active]:flex data-[state=active]:flex-col"
					>
						<ScrollArea className="flex-1 px-6 py-4">
							{pastConversations && pastConversations.length > 0 ? (
								<div className="space-y-2">
									{pastConversations.map((conv) => (
										<button
											key={conv.sessionId}
											onClick={() => viewPastSession(conv.sessionId)}
											className={`w-full text-left p-3 rounded-xl border transition-colors ${
												conv.sessionId === sessionId
													? "border-slate-800 bg-slate-50"
													: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
											}`}
										>
											<div className="flex items-center justify-between mb-1">
												<div className="flex items-center gap-2">
													<MessageSquare className="size-3.5 text-gray-400" />
													<span className="text-sm font-medium text-gray-900">
														{conv.visitorName || "Anonymous Visitor"}
													</span>
												</div>
												<span className="text-[10px] text-gray-400 flex items-center gap-1">
													<Clock className="size-3" />
													{new Date(conv.lastTime).toLocaleDateString()}
												</span>
											</div>
											<p className="text-xs text-gray-500 line-clamp-1 ml-5.5">
												{conv.lastMessage}
											</p>
											<div className="flex items-center gap-3 mt-1.5 ml-5.5">
												<span className="text-[10px] text-gray-400">
													{conv.messageCount} messages
												</span>
												{conv.visitorEmail && (
													<span className="text-[10px] text-gray-400">
														{conv.visitorEmail}
													</span>
												)}
											</div>
										</button>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
										<History className="size-7 text-gray-400" />
									</div>
									<p className="text-sm font-medium text-gray-700">
										No conversations yet
									</p>
									<p className="text-xs text-gray-500 mt-1">
										Start a test chat to see conversation history here.
									</p>
								</div>
							)}
						</ScrollArea>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
