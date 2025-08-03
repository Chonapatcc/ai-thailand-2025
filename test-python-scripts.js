// Simple test script for Python scripts
const { spawn } = require('child_process')
const path = require('path')

async function testPythonScripts() {
  try {
    console.log('Testing Python scripts...\n')
    
    // Test 1: TextQA script
    console.log('Test 1: TextQA script')
    const textqaProcess = spawn('python', [
      path.join(__dirname, 'python', 'aift_textqa.py'),
      'ซื้อขนมไป 20 เหลือเงินเท่าไหร่',
      'TEST_SESSION',
      'มีเงิน 100 บาท',
      '0.2',
      'false'
    ])
    
    let textqaResponse = ''
    let textqaError = ''
    
    textqaProcess.stdout.on('data', (data) => {
      textqaResponse += data.toString()
    })
    
    textqaProcess.stderr.on('data', (data) => {
      textqaError += data.toString()
    })
    
    await new Promise((resolve, reject) => {
      textqaProcess.on('close', (code) => {
        if (code === 0) {
          console.log('TextQA Response:', textqaResponse.trim())
        } else {
          console.log('TextQA Error:', textqaError)
        }
        resolve()
      })
    })
    
    console.log('---\n')
    
    // Test 2: Chat script
    console.log('Test 2: Chat script')
    const chatProcess = spawn('python', [
      path.join(__dirname, 'python', 'aift_chat.py'),
      'สวัสดีครับ',
      'TEST_SESSION',
      '',
      '0.2',
      'false'
    ])
    
    let chatResponse = ''
    let chatError = ''
    
    chatProcess.stdout.on('data', (data) => {
      chatResponse += data.toString()
    })
    
    chatProcess.stderr.on('data', (data) => {
      chatError += data.toString()
    })
    
    await new Promise((resolve, reject) => {
      chatProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Chat Response:', chatResponse.trim())
        } else {
          console.log('Chat Error:', chatError)
        }
        resolve()
      })
    })
    
    console.log('\nAll tests completed!')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testPythonScripts() 