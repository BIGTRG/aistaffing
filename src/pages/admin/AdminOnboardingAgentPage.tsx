import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Plus,
  Send,
  Trash2,
  User,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Rocket,
  ArrowRight,
  Brain,
  Settings2,
  Sparkles,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { toast } from "sonner";

// ── Status badge colors ──
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  intake: { label: "In Progress", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <MessageSquare className="size-3" /> },
  analyzing: { label: "Analyzing", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <Brain className="size-3 animate-pulse" /> },
  workflow_generated: { label: "Workflow Ready", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <Sparkles className="size-3" /> },
  deployed: { label: "Deployed", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: <Rocket className="size-3" /> },
  abandoned: { label: "Abandoned", color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: <AlertCircle className="size-3" /> },
};

// ── Step type icons ──
const STEP_ICONS: Record<string, React.ReactNode> = {
  action: <Zap className="size-4 text-blue-400" />,
  ai_agent: <Bot className="size-4 text-purple-400" />,
  api_call: <Settings2 className="size-4 text-cyan-400" />,
  condition: <ArrowRight className="size-4 text-amber-400" />,
  delay: <Clock className="size-4 text-orange-400" />,
  human_review: <User className="size-4 text-green-400" />,
};

export default function AdminOnboardingAgentPage() {
  const sessions = useApiQuery(() => api.onboardingAgent.listSessions(), []);
  const agentStats = useApiQuery(() => api.onboardingAgent.stats(), []);
  const [selectedSessionId, setSelectedSessionId] = useState<Id<"onboardingSessions"> | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="size-7 text-purple-400" />
              AI Workflow Builder Agent
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Onboard clients and auto-generate custom workflows for their business
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats */}
            {agentStats && (
              <div className="flex items-center gap-4 mr-4 text-sm">
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{agentStats.total}</span> sessions
                </span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-emerald-400">{agentStats.deployed}</span> deployed
                </span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-blue-400">{agentStats.inProgress}</span> active
                </span>
              </div>
            )}
            <NewSessionDialog open={showNewDialog} onOpenChange={setShowNewDialog} onCreated={setSelectedSessionId} />
          </div>
        </div>
      </div>

      {/* ── Main content: sidebar + chat ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Session list sidebar */}
        <div className="w-80 border-r border-border/50 flex flex-col bg-muted/30">
          <div className="p-3 border-b border-border/30">
            <Input
              placeholder="Search sessions..."
              className="h-8 text-sm bg-background/50"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {!sessions?.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Bot className="size-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No onboarding sessions yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Start a new session to onboard a client</p>
              </div>
            ) : (
              sessions.map((session) => {
                const status = STATUS_CONFIG[session.status] || STATUS_CONFIG.intake;
                const isSelected = selectedSessionId === session.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`w-full text-left p-3 border-b border-border/20 transition-colors hover:bg-muted/50 ${
                      isSelected ? "bg-purple-500/10 border-l-2 border-l-purple-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{session.clientName}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.color}`}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {session.detectedIndustry && (
                        <span className="capitalize">{session.detectedIndustry.replace("-", " ")}</span>
                      )}
                      {session.businessSize && (
                        <>
                          <span>·</span>
                          <span className="capitalize">{session.businessSize}</span>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(session.createdAt).toLocaleDateString()} {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {selectedSessionId ? (
            <ChatPanel sessionId={selectedSessionId} onDelete={() => setSelectedSessionId(null)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <Bot className="size-10 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI Workflow Builder</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Start a new onboarding session. The AI agent will ask about the client's business,
                identify their industry, and automatically generate a custom workflow.
              </p>
              <Button
                onClick={() => setShowNewDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="size-4 mr-2" />
                New Onboarding Session
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── New session dialog ──
function NewSessionDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: Id<"onboardingSessions">) => void;
}) {
  const createSession = async (...args: any[]) => api.onboardingAgent.createSession(...args);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const id = await createSession({
        clientName: name.trim(),
        clientEmail: email.trim() || undefined,
        clientPhone: phone.trim() || undefined,
      });
      onCreated(id);
      onOpenChange(false);
      setName("");
      setEmail("");
      setPhone("");
      toast.success("Session started!");
    } catch (e) {
      toast.error("Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="size-4 mr-2" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Onboarding Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-sm font-medium">Client Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John's Plumbing"
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {creating ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
            Start Onboarding
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Chat panel ──
function ChatPanel({
  sessionId,
  onDelete,
}: {
  sessionId: Id<"onboardingSessions">;
  onDelete: () => void;
}) {
  const session = useApiQuery(sessionId ? () => api.onboardingAgent.getSession(sessionId) : null, [sessionId]);
  const messages = useApiQuery(sessionId ? () => api.onboardingAgent.getSessionMessages(sessionId) : null, [sessionId]);
  const chat = async (...args: any[]) => api.onboardingAgent.chat(...args);
  const triggerGen = async (...args: any[]) => (api.onboardingAgent.triggerGeneration as any)(...args);
  const deployWorkflow = async (...args: any[]) => (api.onboardingAgent.deployWorkflow as any)(...args);
  const deleteSession = async (...args: any[]) => (api.onboardingAgent.deleteSession as any)(...args);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    setSending(true);
    try {
      await chat({ sessionId, userMessage: msg });
    } catch (e) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTriggerGeneration = async () => {
    setGenerating(true);
    try {
      await triggerGen({ sessionId });
      toast.success("Workflow generated!");
    } catch (e) {
      toast.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await deployWorkflow({ sessionId });
      toast.success("Workflow deployed!");
    } catch (e) {
      toast.error("Deploy failed");
    } finally {
      setDeploying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this session and all messages?")) return;
    try {
      await deleteSession({ id: sessionId });
      onDelete();
      toast.success("Session deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  if (!session || !messages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = STATUS_CONFIG[session.status] || STATUS_CONFIG.intake;
  const isReadOnly = session.status === "deployed";

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-background/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{session.clientName.charAt(0)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{session.clientName}</h3>
              <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {session.detectedIndustry && (
                <span className="capitalize">{session.detectedIndustry.replace(/-/g, " ")}</span>
              )}
              {session.businessSize && (
                <>
                  <span>·</span>
                  <span className="capitalize">{session.businessSize} team</span>
                </>
              )}
              {session.clientEmail && (
                <>
                  <span>·</span>
                  <span>{session.clientEmail}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.status === "intake" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerGeneration}
              disabled={generating}
              className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
            >
              {generating ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Brain className="size-3 mr-1" />}
              Generate Workflow
            </Button>
          )}
          {session.status === "workflow_generated" && (
            <Button
              size="sm"
              onClick={handleDeploy}
              disabled={deploying}
              className="bg-green-600 hover:bg-green-700"
            >
              {deploying ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Rocket className="size-3 mr-1" />}
              Deploy Workflow
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive/60 hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-muted/10">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
        ))}
        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="size-4 text-purple-400" />
            </div>
            <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 max-w-[70%]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Workflow preview (if generated) */}
      {session.generatedWorkflowPreview && session.status === "workflow_generated" && (
        <WorkflowPreview workflow={session.generatedWorkflowPreview} />
      )}

      {/* Input area */}
      {!isReadOnly && (
        <div className="px-4 py-3 border-t border-border/50 bg-background/80">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sending ? "Waiting for response..." : "Type client's response..."}
              disabled={sending || session.status === "analyzing"}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              size="icon"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="size-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Type the client's response. The AI agent will analyze and respond automatically.
          </p>
        </div>
      )}

      {isReadOnly && (
        <div className="px-4 py-3 border-t border-border/50 bg-green-500/5 text-center">
          <p className="text-sm text-green-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4" />
            Workflow deployed — view it in the Workflow Templates page
          </p>
        </div>
      )}
    </div>
  );
}

// ── Chat bubble ──
function ChatBubble({ role, content, timestamp }: { role: string; content: string; timestamp: number }) {
  const isAgent = role === "agent" || role === "system";

  // Simple markdown-like formatting
  const formatContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Step headers
      if (line.startsWith("**Step")) {
        return <p key={i} className="font-medium mt-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      if (line === "---") {
        return <hr key={i} className="my-2 border-border/30" />;
      }
      if (line.trim() === "") {
        return <br key={i} />;
      }
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className={`flex items-start gap-3 ${!isAgent ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAgent ? "bg-purple-500/20" : "bg-blue-500/20"
      }`}>
        {isAgent ? <Bot className="size-4 text-purple-400" /> : <User className="size-4 text-blue-400" />}
      </div>
      <div className={`rounded-2xl px-4 py-3 max-w-[70%] text-sm leading-relaxed ${
        isAgent
          ? "bg-card rounded-tl-sm border border-border/30"
          : "bg-purple-600/90 text-white rounded-tr-sm"
      }`}>
        <div className="space-y-0.5">{formatContent(content)}</div>
        <p className={`text-[10px] mt-2 ${isAgent ? "text-muted-foreground/50" : "text-white/50"}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ── Workflow preview bar ──
function WorkflowPreview({ workflow }: { workflow: any }) {
  const [expanded, setExpanded] = useState(false);

  if (!workflow?.steps) return null;

  return (
    <div className="border-t border-border/50 bg-card/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4 text-emerald-400" />
          <span className="font-medium">Generated Workflow: {workflow.name}</span>
          <Badge variant="outline" className="text-[10px]">{workflow.steps.length} steps</Badge>
        </div>
        <ArrowRight className={`size-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          <p className="text-xs text-muted-foreground">{workflow.description}</p>
          <div className="grid gap-1.5">
            {workflow.steps.map((step: any, i: number) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/30 text-sm">
                {STEP_ICONS[step.type] || <Zap className="size-4 text-gray-400" />}
                <span className="font-medium text-xs">{step.order}.</span>
                <span className="text-xs">{step.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{step.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
