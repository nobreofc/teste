# Pizza House Nova Cruz – Netlify
Site + painel ADM (/admin) rodando 100% no Netlify (Functions + Netlify Blobs). Sem servidor para manter.

## Publicar (recomendado: GitHub)
1. Suba esta pasta para um repositório no GitHub.
2. Netlify → Add new site → Import from Git → escolha o repositório (nenhum comando de build é necessário).
3. Antes do deploy: Site configuration → Environment variables → crie (marque como "secret"):
   - `ADMIN_PASSWORD` = senha forte do painel (mínimo 10 caracteres)
   - `SESSION_SECRET` = texto aleatório longo (mínimo 32 caracteres)
   - `ADMIN_USER` = (opcional) usuário, padrão `admin`
4. Deploy. Painel em `https://SEU-SITE.netlify.app/admin`.
Alternativa: `npm install` e `npx netlify-cli deploy --prod` (o upload manual por arrastar pasta não instala dependências).

## Segurança
Sem SQL (dados em Netlify Blobs, nunca montados em consulta); senha e chave só em variáveis de ambiente; sessão assinada (HMAC) em cookie HttpOnly+Secure+SameSite=Strict; token CSRF; limite de 5 logins/15 min e 8 pedidos/min por IP; CSP restrita; validação total no servidor; preços recalculados no servidor; o código do painel só é entregue após login.
Para trocar a senha, mude `ADMIN_PASSWORD` e `SESSION_SECRET` (isso derruba todas as sessões) e faça novo deploy.
