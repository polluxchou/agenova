import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/v1/agents/random
 * 
 * Get random public agents
 * 
 * Query:
 *   count?: number (default: 5, max: 20)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '5')
    const limitedCount = Math.min(count, 20)

    // Get all public agent IDs
    const allAgents = await prisma.agent.findMany({
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
      }
    })

    if (allAgents.length === 0) {
      return NextResponse.json({
        success: true,
        agents: [],
        message: 'No public agents available'
      })
    }

    // Randomly select agents
    const shuffled = allAgents.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, limitedCount)

    return NextResponse.json({
      success: true,
      agents: selected,
      total: allAgents.length,
      returned: selected.length
    })

  } catch (error) {
    console.error('Error fetching random agents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
