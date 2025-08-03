// Test multimodal scripts (text, image, voice)
const { AIFTStandalone } = require('./lib/aift-standalone.ts')

async function testMultimodalScripts() {
  try {
    console.log('Testing multimodal Python scripts...\n')
    
    // Test 1: Text QA
    console.log('Test 1: Text QA')
    const textResponse = await AIFTStandalone.textqa('What is artificial intelligence?', {
      sessionid: 'multimodal-test',
      temperature: 0.5,
      return_json: false
    })
    console.log('Text Response:', textResponse)
    console.log('---\n')
    
    // Test 2: Chat
    console.log('Test 2: Chat')
    const chatResponse = await AIFTStandalone.chat('สวัสดีครับ', {
      sessionid: 'multimodal-test',
      temperature: 0.7,
      return_json: false
    })
    console.log('Chat Response:', chatResponse)
    console.log('---\n')
    
    // Test 3: Image QA (mock test)
    console.log('Test 3: Image QA (mock test)')
    try {
      // Create a mock image file for testing
      const mockImageFile = new File(['mock image data'], 'test.jpg', { type: 'image/jpeg' })
      
      const imageResponse = await AIFTStandalone.imageqa(mockImageFile, 'What do you see in this image?', {
        sessionid: 'multimodal-test',
        temperature: 0.3,
        return_json: false
      })
      console.log('Image Response:', imageResponse)
    } catch (error) {
      console.log('Image test error (expected for mock data):', error.message)
    }
    console.log('---\n')
    
    // Test 4: Voice QA (mock test)
    console.log('Test 4: Voice QA (mock test)')
    try {
      // Create a mock audio file for testing
      const mockAudioFile = new File(['mock audio data'], 'test.mp3', { type: 'audio/mpeg' })
      
      const voiceResponse = await AIFTStandalone.voiceqa(mockAudioFile, 'What is being said in this audio?', {
        sessionid: 'multimodal-test',
        temperature: 0.3,
        return_json: false
      })
      console.log('Voice Response:', voiceResponse)
    } catch (error) {
      console.log('Voice test error (expected for mock data):', error.message)
    }
    console.log('---\n')
    
    console.log('All multimodal tests completed!')
    
  } catch (error) {
    console.error('Multimodal test failed:', error)
  }
}

testMultimodalScripts() 