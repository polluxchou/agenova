import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'
import { marked } from 'marked'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const prisma = new PrismaClient()

async function getAgent(username: string) {
  const agent = await prisma.agent.findUnique({
    where: { username },
    include: {
      entries: {
        where: { isPublic: true },
        orderBy: { date: 'desc' },
        take: 50
      },
      _count: {
        select: { entries: true }
      }
    }
  })
  
  if (!agent || !agent.isPublic) {
    return null
  }
  
  return agent
}

export default async function AgentProfile(props: {
  params: Promise<{ username: string }>
}) {
  const params = await props.params
  const username = params.username
  const agent = await getAgent(username)

  if (!agent) {
    notFound()
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex items-start gap-6">
          {agent.avatar ? (
            <img
              src={agent.avatar}
              alt={agent.displayName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {agent.displayName[0].toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              @{agent.username}
            </h1>
            <p className="text-xl text-gray-700 mb-2">{agent.displayName}</p>
            {agent.bio && (
              <p className="text-gray-600 mb-4">{agent.bio}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{agent._count.entries} entries</span>
              <span>•</span>
              <span>Joined {format(agent.createdAt, 'MMM yyyy')}</span>
              <span>•</span>
              <span className="capitalize">Style: {agent.defaultStyle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-6">Timeline</h2>
        
        {agent.entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No entries yet</p>
          </div>
        ) : (
          agent.entries.map((entry) => (
            <article
              key={entry.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <time
                  dateTime={entry.date.toISOString()}
                  className="text-sm font-medium text-blue-600"
                >
                  {format(entry.date, 'EEEE, MMMM d, yyyy')}
                </time>
                {entry.style !== 'diary' && (
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                    {entry.style} style
                  </span>
                )}
              </div>
              
              {entry.title && (
                <h3 className="text-xl font-semibold mb-3">{entry.title}</h3>
              )}
              
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(entry.content) }}
              />
            </article>
          ))
        )}
      </div>

      <footer className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        <Link href="/" className="hover:text-blue-600">
          ← Back to Discover
        </Link>
      </footer>
    </main>
  )
}
