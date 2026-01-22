import { NextResponse } from 'next/server'

export interface ExtractedPart {
  name: string
  action: ('更换' | '钣金' | '喷漆')[]
  category: string
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid text parameter' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `你是一个汽车配件识别专家。从用户的维修描述中提取配件信息。

输出JSON数组，每个配件包含：
- name: 配件名称（标准名称）
- action: 操作数组，可包含 "更换"、"钣金"、"喷漆"
- category: 配件类别（用于分组）

常见配件映射：
- 前脸/中网 → 进气格栅
- 电眼/雷达 → 进气格栅雷达
- 引擎盖/机盖 → 前舱盖
- 水箱 → 散热器
- 大灯/车灯 → 大灯

如果没有明确说明操作，默认为 "更换"。
只输出JSON数组，不要其他文字。`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Failed to extract parts' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '[]'

    // Parse the JSON response
    let parts: ExtractedPart[] = []
    try {
      // Clean up response - remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
      parts = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse LLM response:', content)
      parts = []
    }

    return NextResponse.json({ parts })
  } catch (error) {
    console.error('Part extraction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
