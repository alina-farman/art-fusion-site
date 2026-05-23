'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Users, Palette, Globe, Star, Shield, Zap, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// ── Stats ────────────────────────────────────
const stats = [
  { value: '10K+',  label: 'Artworks',      icon: Palette },
  { value: '500+',  label: 'Artists',        icon: Users   },
  { value: '50K+',  label: 'Collectors',     icon: Heart   },
  { value: '2.5M',  label: 'Total Sales',    icon: Globe   },
]

// ── Values ────────────────────────────────────
const values = [
  {
    icon: Heart,
    title: 'Artist Empowerment',
    desc: 'We believe every artist deserves a platform to showcase their unique talent and reach a global audience without compromise.',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Globe,
    title: 'Global Marketplace',
    desc: 'Connecting collectors and artists worldwide, breaking down geographical barriers to create a truly international art community.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Quality First',
    desc: 'Every artwork is vetted to ensure the highest standards, protecting both artists and collectors from day one.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Zap,
    title: 'Innovation',
    desc: 'We continuously improve our platform with cutting-edge technology to deliver the best experience possible.',
    color: 'bg-purple-100 text-purple-600',
  },
]


// ── Why choose us ─────────────────────────────
const reasons = [
  {
    title: 'Artist-First Platform',
    desc:  'We prioritize artist interests. Better commissions, full control over pricing and inventory.',
    emoji: '🎨',
  },
  {
    title: 'Global Reach',
    desc:  'Access collectors worldwide. Your art is showcased to a diverse, international audience.',
    emoji: '🌍',
  },
  {
    title: 'Complete Support',
    desc:  'From uploading to selling, we handle logistics. Focus on creating amazing art.',
    emoji: '🤝',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-accent/10">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Star className="mr-1 h-3 w-3 fill-accent text-accent" />
                Our Story
              </Badge>
              <h1
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                About{' '}
                <span className="text-accent">Art Fusion</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground text-pretty max-w-xl">
                We're building the world's most artist-friendly marketplace for contemporary art.
                Our mission is to empower creators and connect them with collectors who truly value their work.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/gallery">
                    Browse Artworks <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/?auth=register">Become an Artist</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-lg aspect-[3/4]">
                  <Image
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop"
                    alt="Artist at work"
                    width={400} height={500}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="overflow-hidden rounded-2xl shadow-lg aspect-[3/4]">
                  <Image
                    src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=500&fit=crop"
                    alt="Art collection"
                    width={400} height={500}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold lg:text-4xl mb-6"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Our Story
          </h2>
          <p className="text-lg text-muted-foreground mb-6 text-pretty">
            Art Fusion was born from a simple observation: talented artists were struggling to reach buyers,
            while collectors had nowhere to discover authentic, original work.
          </p>
          <p className="text-lg text-muted-foreground mb-6 text-pretty">
            In 2023, our founder Sarah Chen left her gallery position to create a platform where artists
            could maintain creative control and collectors could access genuine, curated artworks directly.
          </p>
          <p className="text-lg text-muted-foreground text-pretty">
            Today, Art Fusion hosts over 10,000 artworks from 500+ artists across 50+ countries,
            with a community of 50,000+ passionate collectors.
          </p>
        </div>
      </section>


      {/* ── Values ───────────────────────────── */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold lg:text-4xl"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Our Values
            </h2>
            <p className="mt-3 text-muted-foreground">What drives us every day</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(v => {
              const Icon = v.icon
              return (
                <Card key={v.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${v.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{v.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>


      {/* ── Mission ──────────────────────────── */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold lg:text-4xl mb-6"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Our Mission
          </h2>
          <p className="text-xl text-muted-foreground text-pretty mb-4">
            To democratize the art market by providing artists with the tools, community, and audience
            they deserve—while giving collectors access to authentic, beautifully curated original artwork
            directly from the creators who made it.
          </p>
          <p className="text-lg font-semibold text-accent italic">
            "Every artist deserves a studio and a stage."
          </p>
        </div>
      </section>

      {/* ── Why choose us ────────────────────── */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold lg:text-4xl"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Why Artists Choose Us
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reasons.map(r => (
              <Card key={r.title} className="border-0 shadow-md text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <span className="text-4xl mb-4 block">{r.emoji}</span>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{r.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold lg:text-4xl mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Whether you're an artist looking to showcase your work or a collector seeking original artwork,
            Art Fusion is your destination.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/gallery">Browse Artworks</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/?auth=register">Become an Artist</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
