// Test web integration with Python scripts
const { AIFTStandalone } = require('./lib/aift-standalone.ts')

async function testWebIntegration() {
  try {
    console.log('Testing web integration with Python scripts...\n')
    
    // Test 1: Simple chat message
    console.log('Test 1: Simple chat message')
    const response1 = await AIFTStandalone.chat('สวัสดีครับ', {
      sessionid: 'web-test',
      temperature: 0.7,
      return_json: false
    })
    console.log('Response:', response1)
    console.log('---\n')
    
    // Test 2: TextQA with context
    console.log('Test 2: TextQA with context')
    const response2 = await AIFTStandalone.textqa('ซื้อขนมไป 20 เหลือเงินเท่าไหร่', {
      sessionid: 'web-test',
      context: 'มีเงิน 100 บาท',
      temperature: 0.2,
      return_json: false
    })
    console.log('Response:', response2)
    console.log('---\n')
    
    // Test 3: English question
    console.log('Test 3: English question')
    const response3 = await AIFTStandalone.textqa('What is machine learning?', {
      sessionid: 'web-test',
      temperature: 0.5,
      return_json: false
    })
    console.log('Response:', response3)
    console.log('---\n')
    
    console.log('All web integration tests completed successfully!')
    
  } catch (error) {
    console.error('Web integration test failed:', error)
  }
}

testWebIntegration() 