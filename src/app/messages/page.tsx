import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Send, Paperclip } from 'lucide-react';
import { userJane, userJohn } from '@/lib/placeholder-data';

export default function MessagesPage() {
  const conversations = [
    { user: userJane, lastMessage: 'Sounds good! See you then.', time: '10:42 AM', unread: 0, active: true },
    { user: userJohn, lastMessage: 'Is the camera available next weekend?', time: 'Yesterday', unread: 2, active: false },
  ];

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
            {conversations.map((convo, index) => (
                <div key={index} className={cn(
                    "flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50",
                    convo.active ? 'bg-primary/10' : ''
                )}>
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
            ))}
            </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex w-2/3 flex-col">
            <div className="p-4 border-b flex items-center gap-4">
            <Avatar className="h-10 w-10">
                <AvatarImage src={userJane.avatarUrl} alt={userJane.name} />
                <AvatarFallback>{userJane.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{userJane.name}</p>
                <p className="text-xs text-muted-foreground">Renting: High-Powered Electric Drill</p>
            </div>
            </div>
            <ScrollArea className="flex-1 p-6 space-y-6">
                {/* Messages */}
                <div className="flex justify-center">
                    <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Today</div>
                </div>
                <div className="flex items-end gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={userJane.avatarUrl} />
                        <AvatarFallback>{userJane.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="p-3 bg-muted rounded-lg rounded-bl-none max-w-md">
                        <p className="text-sm">Hey! Just wanted to confirm I can pick up the drill around 2 PM tomorrow. Does that work for you?</p>
                    </div>
                </div>
                <div className="flex items-end gap-3 justify-end">
                    <div className="p-3 bg-primary text-primary-foreground rounded-lg rounded-br-none max-w-md">
                        <p className="text-sm">Yep, 2 PM is perfect. I'll have it ready for you.</p>
                    </div>
                    <Avatar className="h-8 w-8">
                        {/* Current User Avatar */}
                    </Avatar>
                </div>
                <div className="flex items-end gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={userJane.avatarUrl} />
                        <AvatarFallback>{userJane.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="p-3 bg-muted rounded-lg rounded-bl-none max-w-md">
                        <p className="text-sm">Sounds good! See you then.</p>
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
        </div>
        </div>
    </div>
  );
}
