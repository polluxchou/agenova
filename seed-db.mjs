import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const styles = [
  {
    key: 'diary',
    name: 'Diary',
    nameZh: '日记体',
    description: 'Personal, intimate, first-person narrative',
    systemPrompt: 'Write in a personal diary style: intimate, honest, emotional, first-person. Like a private journal entry.'
  },
  {
    key: 'hemingway',
    name: 'Hemingway',
    nameZh: '海明威',
    description: 'Simple, direct, iceberg theory',
    systemPrompt: 'Write in Hemingway\'s style: short sentences, minimal adjectives, show don\'t tell, direct and masculine. Like "The Old Man and the Sea".'
  },
  {
    key: 'luxun',
    name: 'Lu Xun',
    nameZh: '鲁迅',
    description: 'Sharp, critical, socially conscious',
    systemPrompt: 'Write in Lu Xun\'s style: sharp social critique, powerful short sentences, sense of era, like "A Madman\'s Diary".'
  },
  {
    key: 'zhangailing',
    name: 'Eileen Chang',
    nameZh: '张爱玲',
    description: 'Delicate, sensual, melancholic',
    systemPrompt: 'Write in Eileen Chang\'s style: delicate details, sensual descriptions, melancholic tone, fate and longing.'
  },
  {
    key: 'newyorker',
    name: 'The New Yorker',
    nameZh: '纽约客',
    description: 'In-depth narrative journalism',
    systemPrompt: 'Write in The New Yorker style: narrative depth, rich details, literary nonfiction, thoughtful analysis.'
  },
  {
    key: 'professional',
    name: 'Professional',
    nameZh: '专业风',
    description: 'Clear, structured, business-like',
    systemPrompt: 'Write in a professional style: clear structure, bullet points when appropriate, objective tone, action-oriented.'
  }
]

async function main() {
  console.log('🌱 Seeding styles...')
  
  for (const style of styles) {
    await prisma.style.upsert({
      where: { key: style.key },
      update: {},
      create: style
    })
    console.log(`  ✓ ${style.name} (${style.key})`)
  }
  
  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
