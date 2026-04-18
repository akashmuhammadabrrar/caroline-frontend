/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useCreateConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendReplyMutation,
} from "@/redux/features/chat/chatApi";
import { useGetPlayerByIdQuery } from "@/redux/features/scout/playerDiscoverApi";
import { useGetClubQuery } from "@/redux/features/scout/clubDireactoryApi";
import { useGetScoutProfileByIdQuery } from "@/redux/features/scout/scoutDirectoryApi";
import { useAppSelector } from "@/redux/hooks";
import {
  Loader2,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { toast } from "react-hot-toast";
import { ChatMessage, Conversation } from "../../../types/chat/chatType";

const MessagingContent = () => {
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId");
  const urlPlayerId = searchParams.get("playerId");
  const urlRole = searchParams.get("role"); // 'PLAYER', 'CLUB_ACADEMY', 'SCOUT_AGENT'
  const targetConvId = searchParams.get("id");

  const [selectedConvId, setSelectedConvId] = useState<number | string | null>(
    null,
  );
  const [targetUserId, setTargetUserId] = useState<string | null>(urlUserId);
  const [playerId, setPlayerId] = useState<string | null>(urlPlayerId);

  // FIX: Use sessionStorage to avoid stale cache across tab sessions.
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? sessionStorage.getItem("scout_lastMessagingState")
        : null;
    const parsed = saved ? JSON.parse(saved) : null;

    if (urlUserId || urlPlayerId || targetConvId) {
      if (urlUserId) setTargetUserId(urlUserId);
      if (urlPlayerId) setPlayerId(urlPlayerId);
      if (targetConvId) setSelectedConvId(Number(targetConvId));
    } else if (parsed?.selectedConvId) {
      setSelectedConvId(parsed.selectedConvId);
      // We don't restore targetUserId/playerId from cache to avoid race conditions with existing conversations
    }
  }, [urlUserId, urlPlayerId, targetConvId]);

  // Save persistence
  useEffect(() => {
    if (selectedConvId && typeof window !== "undefined") {
      sessionStorage.setItem(
        "scout_lastMessagingState",
        JSON.stringify({
          selectedConvId,
        }),
      );
    }
  }, [selectedConvId]);

  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSelectionDone = useRef(false);
  const currentUser = useAppSelector((state) => state.auth.user);

  // FIX: Separate strict matching logic for users
  const normalizeUserId = useCallback(
    (id: string | number | undefined | null) => {
      if (id === undefined || id === null) return "";
      const s = String(id).trim();
      if (s.startsWith("USR-")) return s.replace("USR-", "").replace(/^0+/, "");
      return s.replace(/^0+/, "");
    },
    [],
  );

  const {
    data: convsData,
    isLoading: loadingConvs,
    refetch,
  } = useGetConversationsQuery();
  const [createConversation, { isLoading: isCreating }] =
    useCreateConversationMutation();

  const rawConversations: Conversation[] = useMemo(() => {
    if (Array.isArray(convsData)) return convsData;
    if (convsData?.conversations) return convsData.conversations;
    if ((convsData as any)?.results) return (convsData as any).results;
    return [];
  }, [convsData]);

  // Fetching based on role
  const effectiveUserId = useMemo(() => {
    // If we have an existing conversation selected, use its participant ID
    if (
      selectedConvId &&
      typeof selectedConvId === "number" &&
      selectedConvId > 0
    ) {
      const conv = rawConversations.find((c) => c.id === selectedConvId);
      if (conv) return conv.other_participant?.id;
    }
    // Otherwise, fallback to the targetUserId from URL (for new/virtual chats)
    if (targetUserId) return targetUserId;
    return null;
  }, [targetUserId, selectedConvId, rawConversations]);

  const effectiveRole = useMemo(() => {
    // If we have an existing conversation selected, use its participant role
    if (
      selectedConvId &&
      typeof selectedConvId === "number" &&
      selectedConvId > 0
    ) {
      const conv = rawConversations.find((c) => c.id === selectedConvId);
      if (conv) return conv.other_participant?.role;
    }
    // Otherwise, fallback to urlRole
    if (urlRole) return urlRole;
    return "PLAYER"; // Default fallback
  }, [urlRole, selectedConvId, rawConversations]);

  const { data: targetPlayerData, isLoading: loadingTargetPlayer } =
    useGetPlayerByIdQuery(
      Number(playerId) ||
        Number(String(effectiveUserId).replace("USR-", "")) ||
        0,
      {
        skip: effectiveRole !== "PLAYER" || (!playerId && !effectiveUserId),
      },
    );

  const { data: targetClubData, isLoading: loadingTargetClub } =
    useGetClubQuery(Number(String(effectiveUserId).replace("USR-", "")) || 0, {
      skip: effectiveRole !== "CLUB_ACADEMY" || !effectiveUserId,
    });

  const { data: targetScoutData, isLoading: loadingTargetScout } =
    useGetScoutProfileByIdQuery(
      Number(String(effectiveUserId).replace("USR-", "")) || 0,
      {
        skip: effectiveRole !== "SCOUT_AGENT" || !effectiveUserId,
      },
    );

  const targetData = useMemo(() => {
    if (effectiveRole === "PLAYER")
      return targetPlayerData
        ? {
            id: targetPlayerData.user?.id || effectiveUserId,
            name: `${targetPlayerData.first_name || ""} ${targetPlayerData.last_name || ""}`,
            profile_image: targetPlayerData.profile_image,
            role: "PLAYER",
            email: (targetPlayerData as any).email || "",
          }
        : null;

    if (effectiveRole === "CLUB_ACADEMY")
      return targetClubData
        ? {
            id: (targetClubData as any).user?.id || effectiveUserId,
            name: targetClubData.club_name,
            profile_image: targetClubData.club_logo,
            role: "CLUB_ACADEMY",
            email: (targetClubData as any).email || "",
          }
        : null;

    if (effectiveRole === "SCOUT_AGENT")
      return targetScoutData
        ? {
            id: (targetScoutData as any).user?.id || effectiveUserId,
            name: targetScoutData.scout_name,
            profile_image: targetScoutData.profile_image,
            role: "SCOUT_AGENT",
            email: targetScoutData.email || "",
          }
        : null;

    return null;
  }, [
    effectiveRole,
    effectiveUserId,
    targetPlayerData,
    targetClubData,
    targetScoutData,
  ]);

  const isLoadingTarget =
    loadingTargetPlayer || loadingTargetClub || loadingTargetScout;

  const { data: messagesData, isLoading: loadingMessages } =
    useGetMessagesQuery(selectedConvId as number, {
      skip:
        !selectedConvId ||
        (typeof selectedConvId === "number" && selectedConvId < 0),
    });
  const [sendReply, { isLoading: isSending }] = useSendReplyMutation();

  // Logic for Virtual Conversation
  const conversations = useMemo(() => {
    const list = [...rawConversations];
    if (
      targetUserId &&
      targetData &&
      !list.some((c) => {
        const cid = normalizeUserId(c.other_participant?.id);
        const tid = normalizeUserId(targetUserId);
        // Match by normalized ID OR by exact name if IDs are ambiguous
        return (
          cid === tid ||
          (cid !== "" &&
            tid !== "" &&
            c.other_participant?.name === targetData.name)
        );
      })
    ) {
      const virtualConv: Conversation = {
        id: -Date.now(),
        other_participant: {
          id: targetData.id || targetUserId, // Use the resolved ID for delivery
          name: targetData.name || "Unknown User",
          profile_image: targetData.profile_image || null,
          role: targetData.role as any,
          email: targetData.email,
        },
        unread_count: 0,
        updated_at: new Date().toISOString(),
      };
      return [virtualConv, ...list];
    }
    return list;
  }, [rawConversations, targetUserId, targetData, normalizeUserId]);

  const messages: ChatMessage[] = useMemo(() => {
    let msgs: ChatMessage[] = [];
    if (Array.isArray(messagesData)) msgs = messagesData;
    else if (messagesData?.messages) msgs = messagesData.messages;
    else if ((messagesData as any)?.results)
      msgs = (messagesData as any).results;

    return [...msgs].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateA - dateB;
    });
  }, [messagesData]);

  const selectedConv = useMemo(() => {
    return conversations.find((c) => {
      if (typeof selectedConvId === "number" && selectedConvId < 0)
        return c.id === selectedConvId;
      return selectedConvId !== null && String(c.id) === String(selectedConvId);
    });
  }, [conversations, selectedConvId]);

  const filteredConvs = conversations.filter((conv) =>
    (conv.other_participant?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Reset URL params once a selection is made to avoid stale data
  useEffect(() => {
    if (
      selectedConvId &&
      typeof selectedConvId === "number" &&
      selectedConvId > 0 &&
      (targetUserId || playerId)
    ) {
      setTargetUserId(null);
      setPlayerId(null);
      // Optional: Update URL to remove search params without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("userId");
      url.searchParams.delete("playerId");
      url.searchParams.delete("role");
      window.history.replaceState({}, "", url.toString());
    }
  }, [selectedConvId, targetUserId, playerId]);

  useEffect(() => {
    if (conversations.length > 0 && !initialSelectionDone.current) {
      let nextId: number | string | null = null;
      let foundTarget = false;

      if (targetConvId) {
        const found = conversations.find(
          (c) => String(c.id) === String(targetConvId),
        );
        if (found) {
          nextId = found.id;
          foundTarget = true;
        }
      } else if (targetUserId) {
        const found = conversations.find(
          (c: Conversation) =>
            normalizeUserId(c.other_participant?.id) ===
            normalizeUserId(targetUserId),
        );
        if (found) {
          nextId = found.id;
          foundTarget = true;
        }
      }

      // If no specific target, default to the first conversation
      if (nextId === null && !targetConvId && !targetUserId) {
        nextId = conversations[0].id;
      }

      if (nextId !== null) {
        setSelectedConvId(nextId as any);
        // Only mark "done" if we found the target OR if there was no target to find
        if (foundTarget || (!targetConvId && !targetUserId)) {
          initialSelectionDone.current = true;
        }
      }
    }
  }, [
    conversations,
    selectedConvId,
    targetConvId,
    targetUserId,
    normalizeUserId,
  ]);

  useEffect(() => {
    if (messages.length > 0) {
      const scroll = () => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      };
      const timer = setTimeout(scroll, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, loadingMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedConv) return;

    try {
      if (
        typeof selectedConv.id === "number" &&
        selectedConv.id < 0 &&
        targetData
      ) {
        const response = await createConversation({
          receiver_id: targetData.id || targetUserId, // Correct delivery ID
          message: inputValue.trim(),
        }).unwrap();
        const newConvId = response.conversationId;
        if (newConvId) {
          setSelectedConvId(newConvId);
        }
        refetch();
      } else {
        // Find receiver ID from other_participant OR by looking at messages
        let receiverId: string | number | undefined = selectedConv?.other_participant?.id;

        if (!receiverId && messages.length > 0) {
          const otherMsg = messages.find((m) => {
            const s = m.sender || m.senderId;
            return s && normalizeUserId(s) !== normalizeUserId(currentUser?.id);
          });
          receiverId = (otherMsg?.sender || otherMsg?.senderId) as string | number | undefined;
        }

        if (!receiverId) {
          toast.error("Cannot identify message recipient");
          return;
        }

        // Narrowing type for TS
        const rid: string | number = receiverId;

        await sendReply({
          conversation_id: selectedConv.id as number,
          message: inputValue.trim(),
          receiver_id: rid,
        }).unwrap();
      }
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full overflow-hidden relative bg-[#0E1129] p-4 md:p-6 font-inter text-white">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight bg-linear-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent px-2 font-inter">
        Messaging
      </h1>

      <div className="flex flex-1 overflow-hidden bg-[#161C39]/80 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative">
        {/* Decorative Glow Elements */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-400/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Left Sidebar - Chat List */}
        <div
          className={cn(
            "flex flex-col border-r border-white/5 shrink-0 transition-all bg-[#0E1129]/30",
            "w-full md:w-80 lg:w-[400px]",
            selectedConvId && "hidden md:flex",
          )}
        >
          <div className="p-5 border-b border-white/5 shrink-0">
            <h2 className="text-xl font-bold text-white mb-6 tracking-wide">
              Messages
            </h2>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Search messages..."
                className="pl-11 bg-[#080B1A]/60 border-white/5 text-white placeholder:text-white/30 rounded-2xl h-12 focus-visible:ring-1 focus-visible:ring-teal-400/50 focus-visible:border-teal-400/50 shadow-inner transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loadingConvs ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400/60" />
                <p className="text-[10px] text-teal-400/40 font-bold uppercase tracking-[0.2em]">
                  Syncing Feed...
                </p>
              </div>
            ) : filteredConvs.length === 0 && !isLoadingTarget ? (
              <div className="flex flex-col items-center justify-center p-10 h-64 text-center opacity-40">
                <div className="w-16 h-16 rounded-3xl bg-[#2A3560]/40 flex items-center justify-center mb-4 border border-white/5">
                  <MessageCircle className="h-8 w-8 text-white/20" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">
                  No transmissions
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {isLoadingTarget &&
                  !filteredConvs.some(
                    (c) => typeof c.id === "number" && c.id < 0,
                  ) && (
                    <div className="p-4 flex items-center gap-4 bg-[#2A3560]/20 rounded-2xl animate-pulse border border-white/5">
                      <div className="h-14 w-14 rounded-2xl bg-[#2A3560]/60" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-1/2 bg-[#2A3560]/60 rounded-lg" />
                        <div className="h-3 w-3/4 bg-[#2A3560]/40 rounded-lg" />
                      </div>
                    </div>
                  )}
                {filteredConvs.map((conv: Conversation) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 cursor-pointer transition-all rounded-xl relative group overflow-hidden mb-1",
                      selectedConvId === conv.id
                        ? "bg-linear-to-r from-[#2A3560]/80 to-transparent border-l-4 border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.05)]"
                        : "hover:bg-white/5 border-l-4 border-transparent",
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        className={cn(
                          "h-14 w-14 transition-all duration-300",
                          selectedConvId === conv.id
                            ? "ring-2 ring-teal-400 p-[2px] bg-[#161C39]"
                            : "ring-0",
                        )}
                      >
                        <AvatarImage
                          src={
                            conv.other_participant?.profile_image ||
                            conv.other_participant?.avatar ||
                            (conv.other_participant as any)?.logo ||
                            (conv.other_participant as any)?.scout_logo ||
                            (conv.other_participant as any)?.club_logo ||
                            (conv.other_participant as any)?.image ||
                            undefined
                          }
                          className="object-cover rounded-2xl"
                        />
                        <AvatarFallback className="bg-[#1A2049] text-white font-bold text-xl rounded-2xl">
                          {(conv.other_participant?.name || "U")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-linear-to-br from-fuchsia-500 to-purple-600 rounded-full text-[10px] font-bold text-white border-2 border-[#161C39] shadow-[0_0_10px_rgba(192,38,211,0.5)]">
                          {conv.unread_count}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p
                          className={cn(
                            "font-bold truncate text-[15px]",
                            selectedConvId === conv.id
                              ? "text-white"
                              : "text-white/80",
                          )}
                        >
                          {conv.other_participant?.name}
                        </p>
                       
                        <span className="text-[11px] text-white/40 whitespace-nowrap font-medium">
                          {typeof conv.id === "number" && conv.id < 0
                            ? "just now"
                            : conv.last_message?.created_at
                              ? new Date(
                                  conv.last_message.created_at,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                        </span>
                      </div>
                      <p className="text-[13px] text-white/60 truncate">
                        {typeof conv.id === "number" && conv.id < 0
                          ? "Start a conversation..."
                          : conv.last_message?.content || ""}
                      </p>
                      <div className="mt-1 flex gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-teal-900/40 text-teal-400 text-[10px] font-bold uppercase">
                          {conv.other_participant?.role?.toLowerCase() ||
                            "user"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div
          className={cn(
            "flex-1 flex flex-col relative z-0 h-full overflow-hidden bg-transparent",
            !selectedConvId && "hidden md:flex",
          )}
        >
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-[#161C39]/90 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden p-2 text-white/70"
                  >
                    <MoreVertical className="h-5 w-5 rotate-90" />
                  </button>
                  <div className="relative group cursor-pointer">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-white/10 transition-transform">
                      <AvatarImage
                        src={
                          // Prefer targetData if we are creating a new conversation
                          (typeof selectedConvId === "number" &&
                            selectedConvId < 0 &&
                            targetData?.profile_image) ||
                          selectedConv.other_participant?.profile_image ||
                          selectedConv.other_participant?.avatar ||
                          (selectedConv.other_participant as any)?.logo ||
                          (selectedConv.other_participant as any)?.scout_logo ||
                          (selectedConv.other_participant as any)?.club_logo ||
                          (selectedConv.other_participant as any)?.image ||
                          targetData?.profile_image || // Fallback to targetData
                          undefined
                        }
                        className="object-cover rounded-2xl"
                      />
                      <AvatarFallback className="bg-[#1A2049] font-bold text-lg rounded-2xl">
                        {(targetData?.name ||
                          selectedConv.other_participant?.name ||
                          "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-400 border-2 border-[#161C39] rounded-full shadow-[0_0_8px_theme(colors.green.400)]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-[17px] tracking-tight leading-tight">
                      {targetData?.name || selectedConv.other_participant?.name}
                    </h2>
                    {(targetData?.email ||
                      selectedConv.other_participant?.email) && (
                      <p className="text-[11px] text-white/40 mb-1 font-medium italic lowercase">
                        {targetData?.email ||
                          selectedConv.other_participant.email}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                      Active now
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    title="Options"
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-teal-400 hover:bg-teal-400/10 transition-all"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-transparent">
                {!loadingMessages && messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50 space-y-4">
                    <div className="w-24 h-24 rounded-[32px] bg-[#2A3560]/40 flex items-center justify-center border border-white/10 shadow-inner">
                      <MessageCircle className="h-10 w-10 text-teal-400/40" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        Zero Transmissions
                      </h3>
                      <p className="text-xs text-white/40 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                        Initiate a secure channel to begin data exchange with
                        this asset.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {messages.map((msg, idx) => {
                      const isOwn =
                        msg.is_sender === true ||
                        msg.is_own === true ||
                        (msg as any).isOwn === true ||
                        (msg.senderId &&
                          currentUser?.id &&
                          normalizeUserId(msg.senderId) ===
                            normalizeUserId(currentUser.id)) ||
                        (msg.sender &&
                          currentUser?.id &&
                          normalizeUserId(msg.sender) ===
                            normalizeUserId(currentUser.id));

                      return (
                        <div
                          key={msg.id || idx}
                          className={cn(
                            "flex flex-col gap-1",
                            isOwn ? "items-end" : "items-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] px-5 py-3.5 leading-relaxed text-[15px]",
                              isOwn
                                ? "bg-linear-to-r from-fuchsia-600 to-purple-600 text-white rounded-[20px] rounded-tr-[4px] shadow-[0_4px_15px_rgba(147,51,234,0.15)]"
                                : "bg-[#1F2752] text-white/90 rounded-[20px] rounded-tl-[4px] border border-white/5 shadow-[0_4px_15px_rgba(0,0,0,0.2)]",
                            )}
                          >
                            <p>{msg.text || msg.content || msg.message}</p>
                          </div>
                          <span
                            className={cn(
                              "text-[11px] text-white/40 mt-1 font-medium",
                              isOwn ? "mr-1" : "ml-1",
                            )}
                          >
                            {new Date(msg.created_at || "").toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      );
                    })}

                    {loadingMessages && (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                      </div>
                    )}
                    <div ref={messagesEndRef} className="h-2" />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="shrink-0 p-4 md:p-6 border-t border-white/5 bg-transparent">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                  <div className="relative flex-1 group">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="w-full bg-[#0E1129]/60 border border-white/5 text-white placeholder:text-white/30 rounded-2xl h-14 px-6 shadow-inner text-[15px] focus-visible:ring-1 focus-visible:ring-teal-400/50 focus-visible:border-teal-400/50 transition-all outline-none"
                      disabled={isSending || isCreating}
                    />
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending || isCreating}
                    className={cn(
                      "h-14 w-14 flex items-center justify-center rounded-2xl transition-all relative overflow-hidden group/btn shadow-md",
                      !inputValue.trim() || isSending || isCreating
                        ? "bg-white/5 text-white/20"
                        : "bg-teal-400 text-teal-950 hover:bg-teal-300 hover:scale-[1.05] active:scale-95 shadow-[0_0_15px_rgba(45,212,191,0.3)]",
                    )}
                  >
                    {isSending || isCreating ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Send className="h-6 w-6 fill-current" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-transparent relative overflow-hidden h-full">
              <div className="relative z-10 flex flex-col items-center space-y-8 max-w-md text-center opacity-60">
                <div className="w-40 h-40 rounded-[50px] bg-linear-to-tr from-[#1A2049] to-[#2A3560] flex items-center justify-center border-2 border-white/5 shadow-2xl transition-transform duration-700 hover:scale-105">
                  <MessageSquare className="h-16 w-16 text-teal-400/20" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-white uppercase tracking-widest bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">
                    Transmission Ready
                  </h2>
                  <p className="text-sm text-white/40 font-bold leading-relaxed px-8">
                    Initialize a secure frequency by selecting a scouted asset
                    from your repository. All communications are logged and
                    encrypted.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(42, 53, 96, 0.8);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 212, 191, 0.4);
        }
      `}</style>
    </div>
  );
};

const ScoutMessagingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#0E1129]">
          <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
        </div>
      }
    >
      <MessagingContent />
    </Suspense>
  );
};

export default ScoutMessagingPage;
