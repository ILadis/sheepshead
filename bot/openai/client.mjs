
export function CopilotCLI() {
  this.file = 'copilot';
}

async function exec(file, args) {
  const proc = await import('child_process');

  return new Promise((resolve, reject) => proc.execFile(file, args, (error, output) => {
    if (error) {
      reject(error);
    } else {
      resolve(output);
    }
  }));
}

CopilotCLI.prototype.prompt = async function(prompt, model) {
  let options = [
    '--prompt', prompt,
    '--enable-reasoning-summaries',
    '--output-format', 'json',
  ];

  if (model?.length > 0) {
    options.push('--model', model, '--reasoning-effort', 'medium');
  }

  let output = await exec(this.file, options);

  let events = output.split(/\r?\n/)
      .map(output => output.trim())
      .filter(output => output.length > 0)
      .map(JSON.parse);

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

OpenAIClient.prototype.prompt = async function(content, model = 'openai/gpt-4.1-mini') {
  let prompt = {
    model, messages: [
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

