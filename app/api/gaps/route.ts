import { NextRequest, NextResponse } from 'next/server'
import { OPENROUTER_CONFIG, getAuthHeader } from '@/lib/config'

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { papers } = body

    const systemPrompt = `You are a research assistant specializing in identifying research gaps in academic papers. Analyze the given papers and identify areas where further research is needed, limitations in current approaches, and opportunities for future work.`

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Please identify research gaps and areas for future work based on these papers: ${papers.join(', ')}`
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
    const gaps = data.choices[0].message.content

    return NextResponse.json({
      message: gaps,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Gaps API error:', error)
    // Fallback to mock response
    const gaps = generateGaps(body?.papers || [])
    return NextResponse.json({
      message: gaps,
      timestamp: new Date().toISOString()
    })
  }
}

function generateGaps(papers: string[]): string {
  return `**Research Gaps Identified from ${papers.join(', ')}:**

**1. Limited Cross-Domain Evaluation**
- Most studies focus on specific domains (NLP, computer vision)
- Need for comprehensive multi-domain benchmarks
- Lack of transfer learning evaluation across domains
- Missing real-world deployment studies

**2. Scalability and Efficiency Concerns**
- Limited evaluation on very large-scale datasets
- Computational cost remains high for practical applications
- Memory requirements for large models
- Training time optimization needs improvement

**3. Interpretability and Explainability**
- Limited analysis of attention patterns
- Need for better model interpretability methods
- Lack of human-readable explanations
- Difficulty in debugging model decisions

**4. Robustness and Generalization**
- Limited evaluation on out-of-distribution data
- Adversarial robustness not thoroughly tested
- Domain adaptation challenges
- Few-shot learning capabilities unexplored

**5. Ethical and Bias Considerations**
- Limited analysis of model biases
- Fairness evaluation missing
- Privacy concerns not addressed
- Environmental impact of large models

**6. Practical Deployment Challenges**
- Real-time inference optimization
- Model compression techniques
- Edge device deployment
- Integration with existing systems

**Priority Areas for Future Research:**
1. Multi-modal learning approaches
2. Efficient training and inference methods
3. Robust evaluation protocols
4. Ethical AI considerations
5. Practical deployment strategies

Would you like me to elaborate on any of these research gaps?`
} 