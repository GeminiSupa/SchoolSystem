import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentName, attendance, grades, mood } = await req.json()
    const groqKey = process.env.GROQ_API_KEY
    
    // Fallback Mock if no real key provided
    if (!groqKey || groqKey === 'your_groq_api_key_here') {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const reports = [
        `${studentName} had a fantastic day today! Their performance in class was exceptional. They showed great enthusiasm and was a positive influence on their peers.`,
        `It was a productive day for ${studentName}. Although they were slightly late for the first period, they quickly caught up and excelled in the science lab activity.`,
      ]
      return NextResponse.json({ report: reports[Math.floor(Math.random() * reports.length)] })
    }

    // Real Groq Integration
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'You are an encouraging and professional school teacher writing a daily progress report for a parent.' },
          { role: 'user', content: `Summarize the day for student ${studentName}. Mention they were present and doing well in academics. Keep it under 60 words.` }
        ]
      })
    })

    const data = await response.json()
    return NextResponse.json({ report: data.choices[0].message.content })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
