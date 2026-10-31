// Supabase 대시보드에서 Project URL과 Publishable key를 복사해 넣으세요.
const SUPABASE_URL = "https://tfucjqvlwfhzxpumftow.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LLEXXHKfxtXVKqdDanjGOQ_8EaN8RT3";

// 게시판 이미지 파일을 저장할 Storage 버킷 이름입니다.
const NOTICE_IMAGE_BUCKET = "notice-images";

// 브라우저에서 사용할 Supabase 클라이언트입니다.
const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
