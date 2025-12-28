'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Send, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  booking_id: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type Conversation = {
  user: Profile;
  messages: MessageRow[];
  unread: number;
};

export default function MessagesPageClient() {
  const supabase = createClient();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const preselectUserId = searchParams.get('userId');

  useEffect(() => {
    if (!user) return;
    loadMessages();
  }, [user?.id]);

  const ensureProfile = async (userId: string) => {
    if (!userId || profiles[userId]) {
      setSelectedUserId(userId);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id,full_name,avatar_url')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        throw new Error('Profile not found');
      }

      setProfiles((prev) => ({ ...prev, [profile.id]: profile }));
      setSelectedUserId(profile.id);
    } catch (err) {
      console.error('Error loading profile:', err);
      toast({
        title: 'Unable to start chat',
        description: 'Could not load that user profile.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!user || !preselectUserId) return;
    if (preselectUserId === user.id) return;
    ensureProfile(preselectUserId);
  }, [preselectUserId, user?.id]);

  const loadMessages = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id,sender_id,recipient_id,content,booking_id,created_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);

      const counterparties = Array.from(
        new Set(
          (data || [])
            .map((m) => (m.sender_id === user.id ? m.recipient_id : m.sender_id))
            .filter(Boolean)
        )
      );

      if (counterparties.length) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id,full_name,avatar_url')
          .in('id', counterparties);

        if (profileError) throw profileError;

        const profileMap: Record<string, Profile> = {};
        (profileRows || []).forEach((p) => {
          profileMap[p.id] = p;
        });
        setProfiles(profileMap);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !session?.access_token) return;
    supabase.realtime.setAuth(session.access_token);
    const channel = supabase
      .channel(`user:${user.id}:messages`, { config: { private: true } })
      .on('broadcast', { event: '*' }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, session?.access_token]);

  const conversations: Conversation[] = useMemo(() => {
    const grouped: Record<string, MessageRow[]> = {};
    messages.forEach((m) => {
      const otherId = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
      if (!otherId) return;
      if (!grouped[otherId]) grouped[otherId] = [];
      grouped[otherId].push(m);
    });

    const list = Object.entries(grouped).map(([otherId, msgs]) => ({
      user: profiles[otherId] || { id: otherId, full_name: 'User', avatar_url: null },
      messages: msgs.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
      unread: msgs.filter((m) => m.recipient_id === user?.id).length,
    }));

    if (selectedUserId && !list.some((c) => c.user.id === selectedUserId)) {
      const fallbackUser = profiles[selectedUserId] || {
        id: selectedUserId,
        full_name: 'User',
        avatar_url: null,
      };
      list.unshift({ user: fallbackUser, messages: [], unread: 0 });
    }

    return list;
  }, [messages, profiles, user?.id, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId && conversations.length > 0) {
      setSelectedUserId(conversations[0].user.id);
    }
  }, [conversations, selectedUserId]);

  const selectedConversation = conversations.find((c) => c.user.id === selectedUserId) || null;

  const startNewConversation = async () => {
    if (!newRecipientEmail || !user) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('email', newRecipientEmail)
        .single();

      if (error || !profile) {
        throw new Error('User not found');
      }

      setProfiles((prev) => ({ ...prev, [profile.id]: profile }));
      setSelectedUserId(profile.id);
      setNewRecipientEmail('');
    } catch (err: any) {
      toast({
        title: 'User not found',
        description: err.message || 'Could not find a user with that email',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedUserId || !messageInput.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedUserId,
          content: messageInput.trim(),
        });

      if (error) throw error;

      setMessageInput('');
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <MessageSquare className="h-16 w-16 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold">No messages yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Start a new conversation by entering an email.
      </p>
    </div>
  );

  const ChatEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <MessageSquare className="h-24 w-24 text-muted-foreground/20" />
      <h3 className="mt-4 text-2xl font-semibold">Select a conversation</h3>
      <p className="mt-2 text-md text-muted-foreground">
        Choose a conversation from the left or start a new one.
      </p>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-0 py-0 md:px-4 md:py-12">
      <div className="flex h-[calc(100dvh-4rem)] md:h-[calc(100dvh-10rem)] border md:rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 border-r flex flex-col">
          <div className="p-4 border-b space-y-3">
            <h1 className="text-2xl font-headline font-bold">Messages</h1>
            <div className="relative">
              <Input
                placeholder="Start new via email"
                className="pl-3"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startNewConversation()}
              />
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={startNewConversation}
                disabled={!newRecipientEmail}
              >
                Start conversation
              </Button>
            </div>
            <div className="relative">
              <Input placeholder="Search messages..." className="pl-9" disabled />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : conversations.length > 0 ? (
              conversations.map((convo) => (
                <div
                  key={convo.user.id}
                  className={cn(
                    'flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50',
                    selectedUserId === convo.user.id ? 'bg-primary/10' : ''
                  )}
                  onClick={() => setSelectedUserId(convo.user.id)}
                >
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={convo.user.avatar_url || undefined} alt={convo.user.full_name || 'User'} />
                    <AvatarFallback>{(convo.user.full_name || 'U').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold">{convo.user.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {convo.messages.length
                          ? new Date(convo.messages[convo.messages.length - 1].created_at).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {convo.messages.length
                          ? convo.messages[convo.messages.length - 1].content
                          : 'No messages yet'}
                      </p>
                      {convo.unread > 0 && (
                        <div className="h-5 w-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                          {convo.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex w-2/3 flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedConversation.user.avatar_url || undefined}
                    alt={selectedConversation.user.full_name || 'User'}
                  />
                  <AvatarFallback>
                    {(selectedConversation.user.full_name || 'U').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConversation.user.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">Conversation</p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {selectedConversation.messages.map((m) => {
                    const isMine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={cn('flex items-end gap-3', isMine ? 'justify-end' : 'justify-start')}>
                        {!isMine && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedConversation.user.avatar_url || undefined} />
                            <AvatarFallback>
                              {(selectedConversation.user.full_name || 'U').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'p-3 rounded-lg max-w-md',
                            isMine ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="p-4 border-t bg-background">
                <div className="relative">
                  <Input
                    placeholder="Type your message..."
                    className="pr-24 h-12"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      size="icon"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={sendMessage}
                      disabled={sending || !messageInput.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <ChatEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
