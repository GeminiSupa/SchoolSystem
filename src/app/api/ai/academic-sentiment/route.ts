import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentName, grades } = await req.json()
    const groqKey = process.env.GROQ_API_KEY
    
    // Fallback Mock
    if (!groqKey || groqKey === 'your_groq_api_key_here') {
      await new Promise(resolve => setTimeout(resolve, 2000))
      return NextResponse.json({ 
        trajectory: `${studentName} has demonstrated a marked improvement in analytical thinking. Their steady rise in STEM subjects suggests a strong aptitude for logical problem-solving.` 
      })
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
          { 
            role: 'system', 
            content: 'You are an expert academic advisor. Based on a student\'s grades, write a single, professional, and encouraging sentence describing their academic trajectory and core strengths. Keep it under 25 words.' 
          },
          { 
            role: 'user', 
            content: `Student: ${studentName}. Grades: ${JSON.stringify(grades)}. Write the trajectory sentence.` 
          }
        ]
      })
    })

    const data = await response.json()
    return NextResponse.json({ trajectory: data.choices[0].message.content })
  } catch (error) {
    console.error("AI Sentiment Error:", error)
    return NextResponse.json({ error: 'Failed to generate sentiment' }, { status: 500 })
  }
}
