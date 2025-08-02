import { NextRequest, NextResponse } from 'next/server'
import { OPENROUTER_CONFIG, getAuthHeader } from '@/lib/config'

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { papers } = body

    const systemPrompt = `You are a research assistant specializing in suggesting future research directions based on academic papers. Analyze the given papers and provide specific, actionable suggestions for future research work, including potential methodologies, research questions, and areas of investigation.`

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Based on these papers: ${papers.join(', ')}, please suggest future research directions and opportunities for further investigation.`
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
    const suggestions = data.choices[0].message.content

    return NextResponse.json({
      message: suggestions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Suggest API error:', error)
    // Fallback to mock response
    const suggestions = generateSuggestions(body?.papers || [])
    return NextResponse.json({
      message: suggestions,
      timestamp: new Date().toISOString()
    })
  }
}

function generateSuggestions(papers: string[]): string {
  return `**Future Research Directions Based on ${papers.join(', ')}:**

**1. Multi-modal Learning Integration**
- Combine text with visual, audio, and structured data
- Develop unified architectures for heterogeneous data types
- Explore cross-modal attention mechanisms
- Investigate multi-modal pre-training strategies

**2. Efficiency and Scalability Improvements**
- Develop more efficient attention mechanisms
- Explore sparse attention patterns
- Investigate model compression techniques
- Research dynamic computation allocation

**3. Robustness and Generalization**
- Develop better evaluation protocols for out-of-distribution data
- Investigate domain adaptation techniques
- Explore few-shot and zero-shot learning capabilities
- Research adversarial training methods

**4. Interpretability and Explainability**
- Develop attention visualization tools
- Create human-readable explanation methods
- Investigate model debugging techniques
- Research feature attribution methods

**5. Ethical AI and Fairness**
- Develop bias detection and mitigation techniques
- Investigate fairness-aware training methods
- Research privacy-preserving approaches
- Explore environmentally conscious model design

**6. Practical Applications**
- Real-time inference optimization
- Edge device deployment strategies
- Integration with existing systems
- Domain-specific adaptations

**7. Novel Architectures**
- Explore alternative attention mechanisms
- Investigate hierarchical architectures
- Research dynamic network structures
- Develop task-specific model designs

**8. Training and Optimization**
- Develop more efficient training strategies
- Investigate curriculum learning approaches
- Research meta-learning techniques
- Explore automated hyperparameter optimization

**Priority Recommendations:**
1. **Immediate (6 months)**: Focus on efficiency improvements and practical deployment
2. **Short-term (1 year)**: Develop multi-modal capabilities and robustness methods
3. **Long-term (2+ years)**: Advance interpretability and ethical AI research

Which of these directions aligns with your research interests?`
} 