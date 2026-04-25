import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { students } = await req.json()
    const groqKey = process.env.GROQ_API_KEY
    
    // Fallback Mock if no real key provided
    if (!groqKey || groqKey === 'your_groq_api_key_here') {
      await new Promise(resolve => setTimeout(resolve, 3000))
      return NextResponse.json({ 
        alerts: [
          { studentId: students[0]?.id, name: students[0]?.full_name, riskLevel: 'High', reason: 'Declining grades in Math and 3 consecutive absences.' },
          { studentId: students[1]?.id, name: students[1]?.full_name, riskLevel: 'Medium', reason: 'Performance drop in English; suggests potential language barrier issues.' }
        ] 
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
            content: 'You are a school counselor and data analyst. Analyze student data and flag those at risk of failing or dropout. Return a JSON array of objects with: name, riskLevel (High/Medium/Low), and reason.' 
          },
          { 
            role: 'user', 
            content: `Analyze these students: ${JSON.stringify(students)}. Return only the JSON array.` 
          }
        ],
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    return NextResponse.json({ alerts: content.alerts || content })
  } catch (error) {
    console.error("AI Analysis Error:", error)
    return NextResponse.json({ error: 'Failed to analyze risk' }, { status: 500 })
  }
}
