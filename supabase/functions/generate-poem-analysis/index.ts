import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// AI服务接口定义
interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// 请求体类型定义
interface AnalysisRequest {
  poem_id: number;
  poem_content: string;
  title: string;
  author: string;
  question?: string;
}

Deno.serve(async (req: Request) => {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    // 验证请求方法
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: '仅支持POST请求' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 解析请求体
    const requestBody: AnalysisRequest = await req.json();
    const { poem_id, poem_content, title, author, question } = requestBody;

    // 验证必要参数
    if (!poem_id || !poem_content || !title || !author) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取Supabase客户端（用于数据库操作）
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase环境变量未配置');
    }

    // 检查是否已有缓存
    const cacheCheckResponse = await fetch(
      `${supabaseUrl}/rest/v1/ai_analyses?poem_id=eq.${poem_id}&ai_model=eq.gpt-4&select=analysis_content`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (cacheCheckResponse.ok) {
      const cachedData = await cacheCheckResponse.json();
      if (cachedData && cachedData.length > 0) {
        // 返回缓存结果
        return new Response(
          JSON.stringify({ 
            analysis: cachedData[0].analysis_content,
            cached: true 
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    // 获取AI配置
    const configResponse = await fetch(
      `${supabaseUrl}/rest/v1/configs?key=in.(openai_api_key,ai_model)&select=key,value`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!configResponse.ok) {
      throw new Error('获取AI配置失败');
    }

    const configs = await configResponse.json();
    const apiKey = configs.find((c: any) => c.key === 'openai_api_key')?.value;
    const aiModel = configs.find((c: any) => c.key === 'ai_model')?.value || 'gpt-4';

    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return new Response(
        JSON.stringify({ error: 'AI服务未配置，请联系管理员设置API密钥' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 构造AI请求
    const prompt = question 
      ? `请基于古诗《${title}》（作者：${author}）的内容回答以下问题：
诗歌内容：${poem_content}

问题：${question}

请用中文回答，回答要专业、准确，体现诗歌的意境和情感。`
      : `请对古诗《${title}》进行专业赏析：
作者：${author}
诗歌内容：${poem_content}

请从诗歌的意境、情感表达、艺术特色、历史背景等方面进行详细分析，用中文回答。`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的古诗词鉴赏专家，擅长从文学、历史、艺术等多个角度分析诗歌。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI服务调用失败: ${aiResponse.status} ${errorText}`);
    }

    const aiData: AIResponse = await aiResponse.json();
    const analysisContent = aiData.choices[0]?.message?.content || '未能生成赏析内容';

    // 缓存结果到数据库（仅对赏析请求缓存，问答不缓存）
    if (!question) {
      await fetch(`${supabaseUrl}/rest/v1/ai_analyses`, {
        method: 'POST',
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          poem_id,
          analysis_content: analysisContent,
          ai_model: aiModel,
        }),
      });
    }

    // 返回结果
    const responseData = question 
      ? { answer: analysisContent }
      : { analysis: analysisContent };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Edge Function错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});