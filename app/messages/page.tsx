'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  memo,
} from 'react'
import { Send, Search, ArrowLeft, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useSearchParams } from 'next/navigation'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: any
  read: boolean
}

interface Conversation {
  id: string
  participants: string[]
  participantNames?: Record<string, string>
  participantImages?: Record<string, string>
  lastMessage: string
  lastSenderId?: string
  updatedAt: any
}

const API = process.env.NEXT_PUBLIC_API_URL
const getToken = () => localStorage.getItem('token')

const Avatar = memo(function Avatar({
  name,
  imageUrl,
  size = 40,
}: {
  name: string
  imageUrl?: string
  size?: number
}) {
  const [imgError, setImgError] = useState(false)

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const palettes: [string, string][] = [
    ['#C9A96E', '#2A1F0E'],
    ['#7EB8A4', '#0E2420'],
    ['#C47A7A', '#2A0E0E'],
    ['#8A7EC9', '#0E0E2A'],
    ['#C9B87E', '#2A1F0E'],
    ['#7EA8C9', '#0E1A2A'],
    ['#B87EAA', '#2A0E20'],
  ]
  const [bg, fg] = palettes[name.charCodeAt(0) % palettes.length]

  if (imageUrl && !imgError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          flexShrink: 0,
          overflow: 'hidden',
          boxShadow: '0 0 0 1.5px rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${bg}EE, ${bg}88)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: fg,
        fontWeight: 700,
        fontSize: size * 0.36,
        flexShrink: 0,
        userSelect: 'none',
        boxShadow: `0 0 0 1.5px ${bg}44, 0 4px 12px rgba(0,0,0,0.3)`,
        letterSpacing: '0.03em',
      }}
    >
      {initials}
    </div>
  )
})

function parseTime(t: any): Date | null {
  if (!t) return null
  if (t?.toDate && typeof t.toDate === 'function') return t.toDate()
  if (t?.seconds !== undefined) return new Date(t.seconds * 1000)
  const d = new Date(t)
  return isNaN(d.getTime()) ? null : d
}
function formatConvTime(t: any) {
  const d = parseTime(t)
  if (!d) return ''
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' })
}
function formatMsgTime(t: any) {
  const d = parseTime(t)
  if (!d) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const ConvItem = memo(function ConvItem({
  conv,
  isActive,
  currentUserId,
  onSelect,
}: {
  conv: Conversation
  isActive: boolean
  currentUserId: string
  onSelect: (conv: Conversation) => void
}) {
  const [hovered, setHovered] = useState(false)

  const otherId = conv.participants.find((p) => p !== currentUserId)
  const name = (otherId && conv.participantNames?.[otherId]) || 'Unknown User'
  const image = otherId ? conv.participantImages?.[otherId] : undefined

  return (
    <div
      onClick={() => onSelect(conv)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        borderRadius: 12,
        cursor: 'pointer',
        marginBottom: 3,
        background: isActive
          ? 'rgba(255,255,255,0.07)'
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        transition: 'background 0.15s',
        borderLeft: `3px solid ${isActive ? 'var(--color-text-primary)' : 'transparent'}`,
      }}
    >
      <div style={{ position: 'relative' }}>
        <Avatar name={name} imageUrl={image} size={42} />
        <div
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#4ADE80',
            border: '2px solid var(--color-background-primary)',
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            {formatConvTime(conv.updatedAt)}
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: isActive
              ? 'var(--color-text-secondary)'
              : 'var(--color-text-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {conv.lastMessage || 'Start a conversation...'}
        </p>
      </div>
    </div>
  )
})

const MsgBubble = memo(function MsgBubble({
  m,
  prevM,
  currentUserId,
}: {
  m: Message
  prevM?: Message
  currentUserId: string
}) {
  const isMe = m.senderId === currentUserId
  const showTime =
    !prevM ||
    (parseTime(m.createdAt)?.getTime() || 0) -
      (parseTime(prevM.createdAt)?.getTime() || 0) >
      5 * 60 * 1000

  return (
    <>
      {showTime && (
        <div
          style={{
            textAlign: 'center',
            margin: '12px 0 8px',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
          }}
        >
          {formatMsgTime(m.createdAt)}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
          marginBottom: 4,
        }}
      >
        <div
          style={{
            maxWidth: '65%',
            padding: '10px 14px',
            fontSize: 14,
            lineHeight: 1.55,
            wordBreak: 'break-word',
            background: isMe
              ? 'var(--color-text-primary)'
              : 'rgba(255,255,255,0.06)',
            color: isMe
              ? 'var(--color-background-primary)'
              : 'var(--color-text-primary)',
            borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
            border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: isMe
              ? '0 4px 16px rgba(0,0,0,0.25)'
              : '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {m.content}
        </div>
      </div>
    </>
  )
})

const InputBar = memo(function InputBar({
  inputRef,
  value,
  onChange,
  onSend,
  sending,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  value: string
  onChange: (v: string) => void
  onSend: () => void
  sending: boolean
}) {
  const [focused, setFocused] = useState(false)

  const containsContact = (text: string): boolean => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const phoneRegex = /(\+92|0092|0)?[\s.-]?[0-9]{10,11}|(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
    return emailRegex.test(text) || phoneRegex.test(text)
  }

  const isBlocked = containsContact(value)
  const canSend = value.trim().length > 0 && !sending && !isBlocked

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '12px 20px 16px',
        background: 'rgba(0,0,0,0.08)',
        borderTop: '2px solid rgba(46,42,42,0.1)',
        flexShrink: 0,
        backdropFilter: 'blur(8px)',
      }}
    >
      {isBlocked && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 8,
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.25)',
        }}>
          <span style={{ fontSize: 14 }}>🚫</span>
          <p style={{ fontSize: 12, color: '#F87171', margin: 0, lineHeight: 1.4 }}>
            Email addresses and phone numbers are not allowed in this chat.
          </p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write a message..."
          autoComplete="off"
          style={{
            flex: 1,
            padding: '11px 18px',
            borderRadius: 24,
            border: isBlocked
              ? '1.5px solid rgba(239,68,68,0.5)'
              : focused
              ? '1.5px solid rgba(33,31,31,0.35)'
              : '1.5px solid rgba(255,255,255,0.12)',
            background: isBlocked
              ? 'rgba(239,68,68,0.06)'
              : focused
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(255,255,255,0.05)',
            fontSize: 14,
            color: 'var(--color-text-primary)',
            outline: 'none',
            transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
            lineHeight: 1.4,
            boxSizing: 'border-box' as const,
            boxShadow: isBlocked
              ? '0 0 0 3px rgba(239,68,68,0.08)'
              : focused
              ? '0 0 0 3px rgba(255,255,255,0.05)'
              : 'none',
            fontFamily: 'inherit',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSend) onSend()
            }
          }}
        />
        <button
          type="button"
          disabled={!canSend}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { if (canSend) onSend() }}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            flexShrink: 0,
            background: canSend ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            transform: canSend ? 'scale(1)' : 'scale(0.93)',
            opacity: canSend ? 1 : 0.45,
          }}
        >
          <Send
            size={15}
            style={{
              color: canSend ? 'var(--color-background-primary)' : 'var(--color-text-tertiary)',
              marginLeft: 1,
            }}
          />
        </button>
      </div>
    </div>
  )
})

const ChatHeader = memo(function ChatHeader({
  name,
  imageUrl,
  onBack,
  showBack = false,
}: {
  name: string
  imageUrl?: string
  onBack?: () => void
  showBack?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: showBack ? 10 : 14,
        padding: showBack ? '12px 16px' : '14px 24px',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        minHeight: 66,
        flexShrink: 0,
      }}
    >
      {showBack && onBack && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            display: 'flex',
            padding: 6,
            borderRadius: 8,
          }}
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <Avatar name={name} imageUrl={imageUrl} size={showBack ? 34 : 38} />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
            fontFamily: "'Georgia', serif",
          }}
        >
          {name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ fontSize: 11, color: '#4ADE80', fontWeight: 500 }}>Online</span>
        </div>
      </div>
    </div>
  )
})

// ✅ MsgList — apna khud ka scrollRef, messages pe scroll
function MsgList({
  messages,
  currentUserId,
}: {
  messages: Message[]
  currentUserId: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || messages.length === 0) return
    // ✅ Instant jump to bottom — har baar messages badlein
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="chat-scroll"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '24px 24px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Spacer — messages ko neeche push karta hai */}
      <div style={{ flex: 1 }} />

      {messages.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            No messages yet — say hello 👋
          </p>
        </div>
      ) : (
        messages.map((m, i) => (
          <MsgBubble
            key={m.id}
            m={m}
            prevM={messages[i - 1]}
            currentUserId={currentUserId}
          />
        ))
      )}
    </div>
  )
}

function MessagesContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const receiverId = searchParams.get('receiverId')
  const receiverName = searchParams.get('name')
  const receiverImage = searchParams.get('image') ?? undefined

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  const inputRef = useRef<HTMLInputElement | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const selectedConvRef = useRef<Conversation | null>(null)
  const convsRef = useRef<Conversation[]>([])

  selectedConvRef.current = selectedConv
  convsRef.current = conversations

  const loadConversations = useCallback(async (initial = false) => {
    try {
      const res = await fetch(`${API}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      const incoming: Conversation[] = data.conversations || []
      if (initial) {
        setConversations(incoming)
        setLoading(false)
        return
      }
      if (JSON.stringify(incoming) !== JSON.stringify(convsRef.current))
        setConversations(incoming)
    } catch (err) {
      console.error(err)
    } finally {
      if (initial) setLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (convId: string) => {
    if (!convId || convId === 'new') return
    try {
      const res = await fetch(`${API}/api/messages/${convId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => { loadConversations(true) }, [loadConversations])

  useEffect(() => {
    if (!receiverId || !user) return
    setSelectedConv({
      id: 'new',
      participants: [user.id, receiverId],
      participantNames: { [user.id]: user.name, [receiverId]: receiverName || 'User' },
      participantImages: receiverImage ? { [receiverId]: receiverImage } : {},
      lastMessage: '',
      updatedAt: new Date().toISOString(),
    })
    setMobileView('chat')
  }, [receiverId, user, receiverName, receiverImage])

  useEffect(() => {
    if (!selectedConv || selectedConv.id === 'new') return
    setMessages([])
    loadMessages(selectedConv.id)
  }, [selectedConv?.id, loadMessages])

  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(() => {
      loadConversations(false)
      const id = selectedConvRef.current?.id
      if (id && id !== 'new') loadMessages(id)
    }, 4000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [loadConversations, loadMessages])

  const handleSend = useCallback(async () => {
    const text = newMessage.trim()
    if (!text || !user || sending) return

    const receiver =
      selectedConvRef.current?.id === 'new'
        ? receiverId || ''
        : selectedConvRef.current?.participants.find((p) => p !== user.id) || ''
    if (!receiver) return

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: receiver,
      content: text,
      createdAt: new Date().toISOString(),
      read: false,
    }

    setMessages((prev) => [...prev, tempMsg])
    setNewMessage('')
    setSending(true)

    try {
      const res = await fetch(`${API}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ receiverId: receiver, content: text }),
      })
      const data = await res.json()
      if (data.conversationId) {
        if (selectedConvRef.current?.id === 'new') {
          setSelectedConv((prev) =>
            prev ? { ...prev, id: data.conversationId } : null
          )
          loadConversations(true)
        }
        await loadMessages(data.conversationId)
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')))
    } finally {
      setSending(false)
    }
  }, [newMessage, user, sending, receiverId, loadConversations, loadMessages])

  const getOtherParticipantId = (conv: Conversation) =>
    conv.participants.find((p) => p !== user?.id) ?? null

  const getOtherName = useCallback(
    (conv: Conversation) => {
      const id = getOtherParticipantId(conv)
      return (id && conv.participantNames?.[id]) || 'Unknown User'
    },
    [user?.id]
  )

  const getOtherImage = useCallback(
    (conv: Conversation): string | undefined => {
      const id = getOtherParticipantId(conv)
      return id ? conv.participantImages?.[id] : undefined
    },
    [user?.id]
  )

  const handleSelectConv = useCallback((conv: Conversation) => {
    if (selectedConvRef.current?.id === conv.id) return
    setSelectedConv(conv)
    setMessages([])
    setMobileView('chat')
    setTimeout(() => inputRef.current?.focus(), 80)
    if (conv.id && conv.id !== 'new') {
      fetch(`${API}/api/messages/${conv.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      }).catch(() => {})
    }
  }, [])

  const filtered = conversations.filter((c) =>
    getOtherName(c).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedOtherName = selectedConv ? getOtherName(selectedConv) : ''
  const selectedOtherImage = selectedConv ? getOtherImage(selectedConv) : undefined

  const sidebarContent = (
    <>
      <div
        style={{
          padding: '22px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            color: 'var(--color-text-primary)',
            marginBottom: 14,
            fontFamily: "'Georgia', serif",
          }}
        >
          Messages
        </p>
        <div style={{ position: 'relative' }}>
          <Search
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-tertiary)',
              width: 14,
              height: 14,
              pointerEvents: 'none',
            }}
          />
          <input
            style={{
              width: '100%',
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              borderRadius: 10,
              border: '2px solid rgba(12,11,11,0.1)',
              background: 'rgba(255,255,255,0.05)',
              fontSize: 13,
              color: 'var(--color-text-primary)',
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div
        className="sidebar-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 10px' }}
      >
        {loading ? (
          <div style={{ padding: '24px 12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, opacity: 1 - i * 0.2 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.04)', width: '85%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConvItem
              key={conv.id}
              conv={conv}
              isActive={selectedConv?.id === conv.id}
              currentUserId={user?.id || ''}
              onSelect={handleSelectConv}
            />
          ))
        )}
      </div>
    </>
  )

  const chatContent = selectedConv ? (
    <>
      <ChatHeader name={selectedOtherName} imageUrl={selectedOtherImage} />
      <MsgList
        messages={messages}
        currentUserId={user?.id || ''}
      />
      <InputBar
        inputRef={inputRef}
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSend}
        sending={sending}
      />
    </>
  ) : (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MessageSquare size={34} strokeWidth={1} style={{ color: 'var(--color-text-tertiary)' }} />
      </div>
      <div style={{ textAlign: 'center', maxWidth: 260 }}>
        <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8, fontFamily: "'Georgia', serif" }}>
          Your conversations
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
          Select a conversation to start chatting
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '20px 16px', maxWidth: 1280, margin: '0 auto' }}>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(180,160,120,0.35); border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(180,160,120,0.60); }

        .chat-scroll::-webkit-scrollbar { width: 5px; }
        .chat-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(129,182,235,0.4); border-radius: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,160,220,0.70); }
      `}</style>

      {/* DESKTOP */}
      <div
        className="hidden md:flex"
        style={{
          height: 'calc(100vh - 100px)',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
          background: 'var(--color-background-primary)',
        }}
      >
        <div
          style={{
            width: 310,
            minWidth: 310,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(209,204,204,0.15)',
            minHeight: 0,
          }}
        >
          {sidebarContent}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            background: 'var(--color-background-secondary)',
          }}
        >
          {chatContent}
        </div>
      </div>

      {/* MOBILE */}
      <div
        className="flex flex-col md:hidden"
        style={{
          height: 'calc(100vh - 90px)',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {mobileView === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'rgba(0,0,0,0.15)' }}>
            {sidebarContent}
          </div>
        )}

        {mobileView === 'chat' && selectedConv && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--color-background-secondary)' }}>
            <ChatHeader
              name={selectedOtherName}
              imageUrl={selectedOtherImage}
              showBack
              onBack={() => setMobileView('list')}
            />
            <MsgList
              messages={messages}
              currentUserId={user?.id || ''}
            />
            <InputBar
              inputRef={inputRef}
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSend}
              sending={sending}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading...</p>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  )
}