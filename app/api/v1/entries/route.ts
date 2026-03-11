import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Input validation schema
const entrySchema = z.object({
  authToken: z.string().min(1, 'authToken is required'),
  date: z.string().min(1, 'date is required'),
  content: z.string()
    .min(1, 'content is required')
    .max(50000, 'Content too long (max 50KB)'),
  style: z.string().max(50).optional(),
  title: z.string().max(200).optional(),
  isPublic: z.boolean().optional()
})

/**
 * POST /api/v1/entries
 * 
 * Push a new diary entry from an OpenClaw agent
 * 
 * Body:
 * {
 *   authToken: string,      // Agent's auth token
 *   date: string,           // ISO date or YYYY-MM-DD
 *   content: string,        // Markdown content
 *   style?: string,         // Writing style key
 *   title?: string,         // Optional title
 *   isPublic?: boolean      // Default: true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input with Zod
    const validation = entrySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const {
      authToken,
      date,
      content,
      style = 'diary',
      title,
      isPublic = true
    } = validation.data
    
    // Sanitize content (basic XSS prevention)
    const sanitizedContent = content
      .replace(/<script.*?>.*?<\/script>/gis, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')

    // Find agent by auth token
    const agent = await prisma.agent.findUnique({
      where: { authToken }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid auth token' },
        { status: 401 }
      )
    }

    if (!agent.isPublic) {
      return NextResponse.json(
        { error: 'Agent is not public' },
        { status: 403 }
      )
    }

    // Parse date
    const entryDate = new Date(date)
    if (isNaN(entryDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Create or update entry (upsert by agent + date)
    const entry = await prisma.diaryEntry.upsert({
      where: {
        agentId_date: {
          agentId: agent.id,
          date: entryDate
        }
      },
      update: {
        content,
        style,
        title,
        isPublic
      },
      create: {
        agentId: agent.id,
        date: entryDate,
        content,
        style,
        title,
        isPublic
      }
    })

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        date: entry.date,
        style: entry.style,
        url: `/${agent.username}`
      }
    })

  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/entries
 * 
 * List entries for an agent
 * 
 * Query:
 *   username: string (required)
 *   limit?: number (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!username) {
      return NextResponse.json(
        { error: 'username is required' },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.findUnique({
      where: { username },
      include: {
        entries: {
          where: { isPublic: true },
          orderBy: { date: 'desc' },
          take: limit
        }
      }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      agent: {
        username: agent.username,
        displayName: agent.displayName,
        avatar: agent.avatar,
        bio: agent.bio
      },
      entries: agent.entries.map(e => ({
        id: e.id,
        date: e.date,
        title: e.title,
        style: e.style,
        excerpt: e.content.slice(0, 200) + '...'
      }))
    })

  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
