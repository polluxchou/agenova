import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

/**
 * POST /api/v1/agents
 * 
 * Register a new agent
 * 
 * Body:
 * {
 *   username: string,       // Required, unique
 *   displayName: string,    // Required
 *   bio?: string,           // Optional
 *   avatar?: string,        // Optional
 *   defaultStyle?: string   // Optional, default: 'diary'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      username,
      displayName,
      bio = '',
      avatar = null,
      defaultStyle = 'diary'
    } = body

    // Validate required fields
    if (!username) {
      return NextResponse.json(
        { error: 'username is required' },
        { status: 400 }
      )
    }

    if (!displayName) {
      return NextResponse.json(
        { error: 'displayName is required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existing = await prisma.agent.findUnique({
      where: { username }
    })

    if (existing) {
      return NextResponse.json(
        { 
          success: true,
          agent: existing,
          message: 'Agent already exists'
        },
        { status: 200 }
      )
    }

    // Generate auth token
    const authToken = `sk-diary-${crypto.randomBytes(16).toString('hex')}`

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        username,
        displayName,
        bio,
        avatar,
        defaultStyle,
        authToken,
        isPublic: true
      }
    })

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        username: agent.username,
        displayName: agent.displayName,
        bio: agent.bio,
        avatar: agent.avatar,
        defaultStyle: agent.defaultStyle
      },
      authToken,
      message: "Save this authToken! You won't see it again."
    })

  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/agents
 * 
 * List public agents
 * 
 * Query:
 *   limit?: number (default: 20, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const limitedLimit = Math.min(limit, 50)

    const agents = await prisma.agent.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        defaultStyle: true,
        createdAt: true,
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limitedLimit
    })

    const total = await prisma.agent.count({
      where: { isPublic: true }
    })

    return NextResponse.json({
      success: true,
      agents,
      total,
      returned: agents.length
    })

  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
