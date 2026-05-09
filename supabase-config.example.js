// 이 파일을 복사해서 supabase-config.js 로 저장하고 실제 키를 입력하세요
// supabase-config.js 는 .gitignore 에 포함되어 있어 GitHub에 올라가지 않습니다

const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
