/**
 * API 响应格式测试工具
 * 用于调试不同 AI API 的返回格式
 */

// 模拟你收到的响应
const mockResponse = {
  id: 'gen-1765896327-QThRRi0iTC7Ryh2lNv09',
  provider: 'Google',
  model: 'google/gemini-3-pro-image-preview',
  object: 'chat.completion',
  created: 1765896328,
  choices: [
    {
      logprobs: null,
      finish_reason: 'stop',
      native_finish_reason: 'STOP',
      index: 0,
      message: {
        role: 'assistant',
        content: '这是 AI 生成的内容...'  // 假设的内容
      }
    }
  ],
  usage: {
    prompt_tokens: 830,
    completion_tokens: 2184,
    total_tokens: 3014,
    cost: 0.14733972,
    is_byok: false,
    prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0, video_tokens: 0 },
    cost_details: {
      upstream_inference_cost: null,
      upstream_inference_prompt_cost: 0.00166,
      upstream_inference_completions_cost: 0.147168
    },
    completion_tokens_details: { reasoning_tokens: 1064, image_tokens: 1120 }
  }
};

console.log('=== API 响应格式分析 ===\n');

// 分析响应结构
console.log('1. 完整响应:');
console.log(JSON.stringify(mockResponse, null, 2));
console.log('\n');

console.log('2. choices 数组:');
console.log('  - choices 存在:', !!mockResponse.choices);
console.log('  - choices 长度:', mockResponse.choices?.length);
console.log('\n');

console.log('3. message 对象:');
const message = mockResponse.choices?.[0]?.message;
if (message) {
  console.log('  - message 存在: ✅');
  console.log('  - message 类型:', typeof message);
  console.log('  - message 键:', Object.keys(message));
  console.log('  - message 内容:');
  console.log(JSON.stringify(message, null, 4));
} else {
  console.log('  - message 存在: ❌');
}
console.log('\n');

console.log('4. 内容提取测试:');
const extractMethods = [
  { path: 'choices[0].message.content', value: mockResponse.choices?.[0]?.message?.content },
  { path: 'choices[0].message.text', value: mockResponse.choices?.[0]?.message?.text },
  { path: 'choices[0].text', value: mockResponse.choices?.[0]?.text },
  { path: 'candidates[0].content.parts[0].text', value: mockResponse.candidates?.[0]?.content?.parts?.[0]?.text }
];

extractMethods.forEach(method => {
  const status = method.value ? '✅' : '❌';
  console.log(`  ${status} ${method.path}:`, method.value || 'undefined');
});
console.log('\n');

console.log('5. 建议:');
const content = mockResponse.choices?.[0]?.message?.content;
if (content) {
  console.log('  ✅ 响应格式正确，使用 choices[0].message.content 提取内容');
  console.log('  📝 提取到的内容:', content);
} else {
  console.log('  ⚠️ 无法从标准路径提取内容');
  console.log('  💡 请检查 message 对象的实际结构');
  console.log('  💡 可能需要根据实际响应调整解析逻辑');
}
