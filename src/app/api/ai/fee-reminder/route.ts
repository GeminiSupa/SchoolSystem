import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentName, amount, dueDate, schoolName } = await req.json()
    
    const groqKey = process.env.GROQ_API_KEY

    // Fallback Mock if no real key provided
    if (!groqKey || groqKey === 'your_groq_api_key_here') {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockReminder = `Dear Parent, this is a friendly reminder from ${schoolName} regarding the outstanding tuition fee of Rs. ${amount} for ${studentName}. The due date is ${dueDate}. Please ensure timely payment to avoid late fees. Thank you!`
      return NextResponse.json({ reminder: mockReminder })
    }

    // Real Groq Integration (Simplified Fetch)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'You are a professional school administrator. Draft a polite but firm fee reminder message.' },
          { role: 'user', content: `Draft a reminder for student ${studentName}, amount Rs. ${amount}, due date ${dueDate} for school ${schoolName}. Keep it under 50 words.` }
        ]
      })
    })

    const data = await response.json()
    return NextResponse.json({ reminder: data.choices[0].message.content })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate reminder' }, { status: 500 })
  }
}
