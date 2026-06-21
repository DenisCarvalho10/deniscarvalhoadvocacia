# Denis Carvalho Advocacia — Site Institucional

Site institucional estático (HTML, CSS e JavaScript puros — sem dependências).
Identidade visual baseada no logo: **azul-marinho (#0E2A47) + dourado (#C9A24B)**.

## Como visualizar
Basta abrir o arquivo **`index.html`** em qualquer navegador (duplo clique).
Tudo funciona offline; o WhatsApp e as redes sociais abrem em nova aba.

## Estrutura dos arquivos
| Arquivo | Descrição |
|---|---|
| `index.html` | Página principal (hero, sobre, áreas, LGPD, especialidades, processo, blog, FAQ, contato) |
| `blog.html` | Listagem de artigos do blog |
| `artigo-negativa-plano.html` | Artigo: negativa de plano de saúde |
| `artigo-lgpd-saude.html` | Artigo: LGPD na saúde |
| `artigo-notificacao-crm.html` | Artigo: notificação do CRM |
| `privacidade.html` | Política de Privacidade e Cookies (LGPD) |
| `assets/css/styles.css` | Todo o estilo do site |
| `assets/js/main.js` | Menu, FAQ, formulários, pop-ups, cookies |
| `assets/img/` | Logo (`logo.png`), foto (`denis-carvalho.jpg`) |

## Recursos já incluídos
- ✅ **Botão flutuante de WhatsApp** (canto inferior, acompanha a rolagem, mensagem pré-definida)
- ✅ **Botão de Emergência / Plantão** ("Casos Urgentes", em vermelho, com mensagem de urgência)
- ✅ **Captura de leads** — aba lateral "E-book grátis" que desliza (slide-in)
- ✅ **Blog / Notícias** com 3 artigos completos + listagem
- ✅ **FAQ inteligente** (acordeão) na página inicial
- ✅ **Destaque LGPD** para hospitais, clínicas e consultórios odontológicos
- ✅ **Banner de consentimento de cookies** (aceitar/rejeitar)
- ✅ Links para **Instagram** (@deniscarvalho.advogado) e **LinkedIn**
- ✅ Telefone estático **(64) 99945-2151** no rodapé
- ✅ WhatsApp **(62) 99258-6422** em todos os botões/links
- ✅ Responsivo (celular, tablet e desktop) e otimizado para SEO

## Telefones / contatos usados
- WhatsApp principal (todos os botões): **(62) 99258-6422** → `wa.me/5562992586422`
- Telefone do escritório (rodapé): **(64) 99945-2151**
- E-mail: **contato@deniscarvalhoadvocacia.com.br**
- OAB/GO **53.904**

## Personalizações sugeridas (opcional)
1. **E-book real:** hoje o formulário do e-book e o de contato abrem o WhatsApp já com a
   mensagem preenchida (não exigem servidor). Para entregar um PDF automático ou capturar
   e-mails em uma lista, integre um serviço como Mailchimp, RD Station ou Formspree no
   `assets/js/main.js` (funções `leadForm` e `contactForm`).
2. **Trocar a foto/logo:** substitua os arquivos em `assets/img/` mantendo os mesmos nomes.
3. **Novos artigos:** duplique um arquivo `artigo-*.html`, troque o conteúdo e adicione o
   card correspondente em `blog.html` e na seção de blog do `index.html`.
4. **Domínio:** publique o conteúdo da pasta em qualquer hospedagem (Hostinger, Vercel,
   Netlify, GitHub Pages etc.). Por ser estático, não exige banco de dados.

## Observação jurídica
O rodapé e os artigos já trazem aviso de caráter informativo, em conformidade com o
Código de Ética e Disciplina da OAB e o Provimento nº 205/2021 (evitando captação de
clientela e promessa de resultados).
