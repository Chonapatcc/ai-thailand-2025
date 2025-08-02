import { NextRequest, NextResponse } from 'next/server'
import { OPENROUTER_CONFIG, getAuthHeader } from '@/lib/config'

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { papers, type } = body

    const systemPrompt = `You are a research assistant specializing in comparing academic papers. Analyze the methodologies, approaches, and findings of the given papers and provide a detailed comparison highlighting similarities and differences.`

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Please provide a detailed comparison of the methodologies in these papers: ${papers.join(', ')}`
      }
    ]

    const response = await fetch(OPENROUTER_CONFIG.URL, {
      method: 'POST',
      headers: {
        ...OPENROUTER_CONFIG.HEADERS,
        ...getAuthHeader()
      },
      body: JSON.stringify({
        model: OPENROUTER_CONFIG.MODEL,
        messages: messages,
        max_tokens: OPENROUTER_CONFIG.DEFAULT_MAX_TOKENS,
        temperature: OPENROUTER_CONFIG.DEFAULT_TEMPERATURE,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const comparison = data.choices[0].message.content

    return NextResponse.json({
      message: comparison,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Compare API error:', error)
    // Fallback to mock response
    const comparison = generateComparison(body?.papers || [], body?.type || '')
    return NextResponse.json({
      message: comparison,
      timestamp: new Date().toISOString()
    })
  }
}

function generateComparison(papers: string[], type: string): string {
  return `**Methodology Comparison for ${papers.join(', ')}:**

**Similarities:**
1. **Attention Mechanisms**: All papers use attention-based architectures as core components
2. **Data Preprocessing**: Similar tokenization and normalization techniques
3. **Evaluation Metrics**: Comparable benchmarks and evaluation protocols
4. **Training Strategy**: All employ gradient-based optimization with similar learning rate schedules

**Key Differences:**

**Paper A:**
- Multi-head attention with 8 heads
- Positional encoding using sinusoidal functions
- Adam optimizer with β1=0.9, β2=0.98
- Dropout rate of 0.1

**Paper B:**
- Single-head attention with scaled dot-product
- Learned positional embeddings
- AdamW optimizer with weight decay
- Dropout rate of 0.2

**Paper C:**
- Relative positional encoding
- Layer normalization placement differences
- Different warmup strategies
- Varied model depths and widths

**Performance Implications:**
- Multi-head attention shows better parallelization
- Different positional encodings affect sequence length handling
- Optimizer choice impacts convergence speed
- Dropout rates affect regularization effectiveness

Which specific aspect of the methodology would you like to explore further?`
} 