// Supabase 服务端测试脚本
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// 读取 .env 文件
function loadEnvFile() {
  try {
    const envPath = path.resolve('.env')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=')
        if (key && value) {
          envVars[key.trim()] = value.trim()
        }
      }
    })
    
    return envVars
  } catch (err) {
    console.log('未找到 .env 文件或读取失败:', err.message)
    return {}
  }
}

// 加载环境变量
const envVars = loadEnvFile()

// 测试配置 - 直接从环境变量读取
const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('检查环境变量:')
console.log('VITE_SUPABASE_URL:', supabaseUrl !== 'https://your-project.supabase.co' ? `${supabaseUrl.substring(0, 30)}...` : '未设置或使用默认值')
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey !== 'your-anon-key' ? `${supabaseKey.substring(0, 10)}...` : '未设置或使用默认值')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('\n🧪 测试数据库连接...')
  
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      if (error.message.includes('Invalid API key')) {
        console.log('🔑 API密钥无效，请检查 VITE_SUPABASE_ANON_KEY 配置')
      } else if (error.message.includes('Could not find project')) {
        console.log('🌐 项目URL无效，请检查 VITE_SUPABASE_URL 配置')
      }
      return false
    }
    
    console.log('✅ 数据库连接成功')
    if (data && data.length > 0) {
      console.log('📚 示例诗词:', data[0].title)
    } else {
      console.log('⚠️  数据库连接成功但无数据')
    }
    return true
  } catch (err) {
    console.error('❌ 测试异常:', err.message)
    return false
  }
}

async function testEnvironment() {
  console.log('\n🧪 测试环境变量配置...')
  
  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
    console.log('❌ VITE_SUPABASE_URL 未配置或使用默认值')
    return false
  }
  
  if (!supabaseKey || supabaseKey === 'your-anon-key') {
    console.log('❌ VITE_SUPABASE_ANON_KEY 未配置或使用默认值')
    return false
  }
  
  console.log('✅ 环境变量配置正确')
  return true
}

// 运行测试
async function runAllTests() {
  console.log('🚀 开始Supabase配置测试\n')
  
  const envTestPassed = await testEnvironment()
  if (!envTestPassed) {
    console.log('\n❌ 环境变量配置不正确，请检查 .env 文件')
    return false
  }
  
  const dbTestPassed = await testDatabaseConnection()
  if (!dbTestPassed) {
    console.log('\n❌ 数据库连接测试失败')
    return false
  }
  
  console.log('\n🎉 所有测试通过！服务端配置正确。')
  return true
}

runAllTests().catch(console.error)