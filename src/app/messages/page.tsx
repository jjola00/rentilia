'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Send, Paperclip, MessageSquare } from 'lucide-react';
import type { User } from '@/lib/types';

type Conversation = {
    user: User;
    lastMessage: string;
    time: string;
    unread: number;
    active: boolean;
}

export default function MessagesPage() {
  // This will be replaced by data fetched from Supabase
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">No messages yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
            When you start a conversation with a renter or owner, it will appear here.
        </p>
    </div>
  );
  
  const ChatEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageSquare className="h-24 w-24 text-muted-foreground/20" />
        <h3 className="mt-4 text-2xl font-semibold">Select a conversation</h3>
        <p className="mt-2 text-md text-muted-foreground">
            Choose a conversation from the left to start chatting.
        </p>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-0 py-0 md:px-4 md:py-12">
        <div className="flex h-[calc(100dvh-4rem)] md:h-[calc(100dvh-10rem)] border md:rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
            <h1 className="text-2xl font-headline font-bold">Messages</h1>
            <div className="relative mt-4">
                <Input placeholder="Search messages..." className="pl-9" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            </div>
            <ScrollArea className="flex-1">
            {conversations.length > 0 ? conversations.map((convo, index) => (
                <div key={index} className={cn(
                    "flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50",
                    convo.active ? 'bg-primary/10' : ''
                )} onClick={() => setSelectedConversation(convo)}>
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={convo.user.avatarUrl} alt={convo.user.name} />
                    <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between">
                    <p className="font-semibold">{convo.user.name}</p>
                    <p className="text-xs text-muted-foreground">{convo.time}</p>
                    </div>
                    <div className="flex justify-between mt-1">
                        <p className="text-sm text-muted-foreground line-clamp-1">{convo.lastMessage}</p>
                        {convo.unread > 0 && (
                            <div className="h-5 w-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                            {convo.unread}
                            </div>
                        )}
                    </div>
                </div>
                </div>
            )) : <EmptyState />}
            </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex w-2/3 flex-col">
            {selectedConversation ? (
                <>
                    <div className="p-4 border-b flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedConversation.user.avatarUrl} alt={selectedConversation.user.name} />
                            <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{selectedConversation.user.name}</p>
                            <p className="text-xs text-muted-foreground">Renting: High-Powered Electric Drill</p>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 p-6 space-y-6">
                        {/* Messages will be populated here */}
                        <div className="flex justify-center">
                            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Today</div>
                        </div>
                        <div className="flex items-end gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedConversation.user.avatarUrl} />
                                <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="p-3 bg-muted rounded-lg rounded-bl-none max-w-md">
                                <p className="text-sm">{selectedConversation.lastMessage}</p>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-background">
                        <div className="relative">
                            <Input placeholder="Type your message..." className="pr-24 h-12" />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <Button variant="ghost" size="icon">
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                </Button>
                                <Button size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90">
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
