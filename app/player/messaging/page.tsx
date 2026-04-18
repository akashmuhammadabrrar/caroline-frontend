/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import {
  Search,
  Send,
  Loader2,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendReplyMutation,
  useCreateConversationMutation,
} from "@/redux/features/chat/chatApi";
import { useGetPlayerByIdQuery } from "@/redux/features/scout/playerDiscoverApi";
import { useGetClubQuery } from "@/redux/features/scout/clubDireactoryApi";
import { useGetScoutProfileByIdQuery } from "@/redux/features/scout/scoutDirectoryApi";
import { Conversation, ChatMessage } from "@/types/chat/chatType";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAppSelector } from "@/redux/hooks";

const MessagingContent = () => {
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId");
  const targetConvId = searchParams.get("id");

  const [selectedConvId, setSelectedConvId] = useState<number | string | null>(
    null,
  );
  const [targetUserId, setTargetUserId] = useState<string | null>(urlUserId);

  useEffect(() => {
    // FIX: Use sessionStorage to avoid stale cache across tab sessions.
    const saved =
      typeof window !== "undefined"
        ? sessionStorage.getItem("player_lastMessagingState")
        : null;
    const parsed = saved ? JSON.parse(saved) : null;

    if (urlUserId || targetConvId) {
      if (targetConvId) setSelectedConvId(Number(targetConvId));
      else if (urlUserId) setTargetUserId(urlUserId);
    } else if (parsed?.selectedConvId) {
      // FIX: Only rely on selectedConvId from persistence, don't fallback to stale targetUserId
      setSelectedConvId(parsed.selectedConvId);
    }
  }, [urlUserId, targetConvId]);

  useEffect(() => {
    if (selectedConvId && typeof window !== "undefined") {
      sessionStorage.setItem(
        "player_lastMessagingState",
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

  const {
    data: convsData,
    isLoading: loadingConvs,
    refetch,
  } = useGetConversationsQuery(undefined, {
    pollingInterval: 5000,
  });

  const [createConversation, { isLoading: isCreating }] =
    useCreateConversationMutation();

  const urlRole = searchParams.get("role");
  const urlPlayerId = searchParams.get("playerId");

  const rawConversations: Conversation[] = useMemo(() => {
    if (Array.isArray(convsData)) return convsData;
    if (convsData?.conversations) return convsData.conversations;
    if ((convsData as any)?.results) return (convsData as any).results;
    return [];
  }, [convsData]);

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
    // Otherwise, fallback to targetUserId
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
      Number(urlPlayerId) ||
        Number(String(effectiveUserId).replace("USR-", "")) ||
        0,
      {
        skip: effectiveRole !== "PLAYER" || (!urlPlayerId && !effectiveUserId),
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
      pollingInterval: 3000,
    });
  const [sendReply, { isLoading: isSending }] = useSendReplyMutation();

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

  // FIX: Separate strict matching logic for users
  const normalizeUserId = useCallback(
    (id: string | number | undefined | null) => {
      if (!id) return "";
      return String(id).replace("USR-", "").replace(/^0+/, "");
    },
    [],
  );

  // Logic for Virtual Conversation
  const conversations = useMemo(() => {
    const list = [...rawConversations];
    if (
      targetUserId &&
      targetData &&
      !list.some((c) => {
        const cid = normalizeUserId(c.other_participant?.id);
        const tid = normalizeUserId(targetUserId);
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
          id: targetData.id || targetUserId,
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

  // FIX: Strictly compare Conversation IDs to avoid collisions
  const selectedConv = useMemo(
    () =>
      conversations.find(
        (c) =>
          selectedConvId !== null && String(c.id) === String(selectedConvId),
      ),
    [conversations, selectedConvId],
  );

  // Reset URL params once a selection is made to avoid stale data
  useEffect(() => {
    if (
      selectedConvId &&
      typeof selectedConvId === "number" &&
      selectedConvId > 0 &&
      (targetUserId || urlPlayerId)
    ) {
      setTargetUserId(null);
      // Optional: Update URL to remove search params without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("userId");
      url.searchParams.delete("playerId");
      url.searchParams.delete("role");
      window.history.replaceState({}, "", url.toString());
    }
  }, [selectedConvId, targetUserId, urlPlayerId]);

  const filteredConvs = useMemo(
    () =>
      conversations.filter((conv) =>
        (conv.other_participant?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [conversations, search],
  );

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

      if (nextId === null && !targetConvId && !targetUserId) {
        nextId = conversations[0].id;
      }

      if (nextId !== null) {
        setSelectedConvId(nextId);
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

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedConv) return;
    try {
      if (
        typeof selectedConv.id === "number" &&
        selectedConv.id < 0 &&
        (targetData || targetUserId)
      ) {
        const response = await createConversation({
          receiver_id: targetData?.id || targetUserId,
          message: inputValue.trim(),
        }).unwrap();
        const newConvId = response.conversationId || (response as any).id;
        if (newConvId) {
          setSelectedConvId(newConvId);
        }
        refetch();
      } else {
        // Find receiver ID from other_participant OR by looking at messages
          let receiverId: string | number | undefined = selectedConv?.other_participant?.id;
        
        if (!receiverId && messages.length > 0) {
          // Find the first message not sent by the current user
          const otherMsg = messages.find((m) => {
            const s = m.sender || m.senderId;
            return s && normalizeUserId(s) !== normalizeUserId(currentUser?.id);
          });
          receiverId = otherMsg?.sender || (otherMsg?.senderId as number);
        }

        if (!receiverId) {
          toast.error("Cannot identify recipient");
          return;
        }

        await sendReply({
          conversation_id: selectedConv.id as number,
          message: inputValue.trim(),
          receiver_id: receiverId as string | number,
        }).unwrap();
      }
      setInputValue("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full overflow-hidden relative bg-[#0E1129] p-4 md:p-6 font-inter text-white">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight bg-linear-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent px-2">
        Messaging
      </h1>

      <div className="flex flex-1 overflow-hidden bg-[#161C39]/80 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative">
        {/* Left Sidebar - Chat List */}
        <div
          className={cn(
            "flex flex-col border-r border-white/5 shrink-0 transition-all bg-[#0E1129]/30",
            "w-full md:w-80 lg:w-[380px]",
            selectedConvId && "hidden md:flex",
          )}
        >
          <div className="p-5 border-b border-white/5">
            <h2 className="text-xl font-bold text-white mb-4">Conversations</h2>
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within/search:text-white" />
              <Input
                placeholder="Search messages..."
                className="pl-11 bg-[#080B1A]/60 border-white/5 text-white placeholder:text-white/30 rounded-2xl h-12 focus:border-teal-400/50 shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingConvs ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2A3560] text-gray-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  No Active Channels
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-3">
                {filteredConvs.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 cursor-pointer transition-all duration-300 rounded-xl relative overflow-hidden",
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
                          className="object-cover rounded-full"
                        />
                        <AvatarFallback className="bg-[#1A2049] text-white font-bold text-xl rounded-full">
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
                        {conv.other_participant?.email && (
                          <p className="text-[10px] text-white/40 truncate italic lowercase">
                            {conv.other_participant.email}
                          </p>
                        )}
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
                        {conv.last_message?.content || "Message open"}
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
        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-[#161C39]/90 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
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
                        className="object-cover rounded-full"
                      />
                      <AvatarFallback className="bg-[#1A2049] font-bold text-lg rounded-full">
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
                <button
                  onClick={() => setSelectedConvId(null)}
                  className="md:hidden text-white/50 p-2"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-transparent">
                {!loadingMessages && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-50">
                    <div className="h-20 w-20 bg-[#2A3560]/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <MessageSquare className="h-10 w-10 text-white/60" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Message Channel Open
                    </h3>
                  </div>
                ) : (
                  <div className="mx-auto space-y-6 pb-4">
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
                            <p>{msg.content || msg.text || msg.message}</p>
                          </div>
                          <span
                            className={cn(
                              "text-[11px] text-white/40 mt-1 font-medium",
                              isOwn ? "mr-1" : "ml-1",
                            )}
                          >
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : ""}
                          </span>
                        </div>
                      );
                    })}
                    {loadingMessages && (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                      </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
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
                      disabled={isSending}
                    />
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending}
                    className={cn(
                      "h-14 w-14 flex items-center justify-center rounded-2xl transition-all relative overflow-hidden group/btn shadow-md",
                      !inputValue.trim() || isSending
                        ? "bg-white/5 text-white/20"
                        : "bg-teal-400 text-teal-950 hover:bg-teal-300 hover:scale-[1.05] active:scale-95 shadow-[0_0_15px_rgba(45,212,191,0.3)]",
                    )}
                  >
                    {isSending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Send className="h-6 w-6 fill-current" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-6">
              <div className="h-32 w-32 rounded-full bg-[#1A2049]/50 border-2 border-[#2A3560]/30 flex items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-tr from-teal-400/5 to-transparent animate-pulse" />
                <MessageSquare className="h-12 w-12 text-teal-400/30" />
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-white/40 tracking-tighter uppercase mb-2">
                  Terminal Standby
                </p>
                <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">
                  Select Active Channel to Monitor
                </p>
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

const PlayerMessagingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#0E1129]">
          <Loader2 className="animate-spin h-10 w-10 text-teal-400" />
        </div>
      }
    >
      <MessagingContent />
    </Suspense>
  );
};

export default PlayerMessagingPage;