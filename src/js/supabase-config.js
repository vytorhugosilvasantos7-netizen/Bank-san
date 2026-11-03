// Bank-San | Conexão com o Supabase
// Antes deste arquivo, a página precisa carregar a biblioteca:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//
// Cole aqui a URL do projeto e a chave PUBLISHABLE (começa com sb_publishable_).
// Essa chave pode ficar no site: quem protege os dados são as regras do schema.sql.
// NUNCA cole aqui a chave "secret" (sb_secret_...) nem a "service_role".
const SUPABASE_URL = 'https://ffrzrcnedyekgzjfjfgi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_j3V46QtlqyvRdRyulLI1qA_sBPa8IGL';

if (window.supabase) {
  window.bankSanDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.bankSanConfigurado = Boolean(
    SUPABASE_URL &&
    SUPABASE_KEY &&
    !SUPABASE_URL.includes('SEU_PROJETO') &&
    SUPABASE_URL.startsWith('http')
  );
} else {
  window.bankSanDb = null;
  window.bankSanConfigurado = false;
}
