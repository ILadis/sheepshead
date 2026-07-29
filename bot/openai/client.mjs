
export function CopilotCLI() {
  this.file = 'copilot.exe';
}

async function exec(file, args) {
  const proc = await import('node:child_process');

  return new Promise((resolve, reject) => proc.execFile(file, args, (error, output) => {
    if (error) {
      reject(error);
    } else {
      resolve(output);
    }
  }));
}

CopilotCLI.prototype.prompt = async function(prompt) {
  let output = await exec(this.file, ['--model', 'claude-sonnet-4.6', '--reasoning-effort', 'medium', '--prompt', prompt, '--output-format', 'json', '--enable-reasoning-summaries']);
  let events = output.split(/\r?\n/).map(output => output.trim()).filter(output => output.length > 0).map(JSON.parse);

  for (let event of events) {
    switch (event.type) {
    case 'assistant.message':
      var result = event?.data?.content;
      break;
    case 'assistant.reasoning':
      var reasoning = event?.data?.content;
      break;
    }
  }

  return { result, reasoning };
};

export function OpenAIClient(token, endpoint = 'https://models.github.ai/inference') {
  this.token = token;
  this.endpoint = endpoint;
}

OpenAIClient.prototype.prompt = async function(content) {
  let prompt = {
    model: 'openai/gpt-4.1-mini',
    messages: [
      { role: 'system', content: '' },
      { role: 'user', content },
    ]
  };

  let request = new Request(`${this.endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(prompt),
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }
  
  let completion = await response.json();
  let result = completion?.choices?.[0]?.message?.content?.trim();

  return { result };
};

