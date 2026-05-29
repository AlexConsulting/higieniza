# 🚀 Higieniza Aí — Guia de Instalação

Sistema completo de agendamento e orçamento para higienização de estofados.

## 📁 Arquivos do Sistema

| Arquivo | Função |
|---|---|
| `index.html` | Landing page + formulário de orçamento |
| `admin.html` | Painel administrativo + dashboard financeiro |
| `agendar.html` | Página de agendamento do cliente |
| `style.css` | Estilos (tema claro/escuro) |
| `app.js` | Lógica do site público |
| `admin.js` | Lógica do painel admin |
| `manifest.json` | Configuração PWA (instalável no celular) |

---

## 🔥 PASSO 1 — Criar o Realtime Database

> Usamos o **Realtime Database** (não o Firestore) porque ele é **100% gratuito e não pede cartão de crédito**.

1. Acesse https://console.firebase.google.com e abra seu projeto `higieniza-ai`.
2. No menu lateral, vá em **Build → Realtime Database → Criar banco de dados**.
3. Escolha a região (pode deixar **Estados Unidos** — a padrão).
4. Selecione **"Iniciar no modo de teste"**.
5. Vai aparecer uma URL parecida com:
   `https://higieniza-ai-default-rtdb.firebaseio.com` — **guarde essa URL**, você vai precisar dela.

### Estrutura de dados (criada automaticamente)

Você não precisa criar nada manualmente. O sistema cria estes "nós" sozinho:

```
orcamentos/        → cada pedido (numero, nome, whatsapp, cep, endereco,
                      servicos[], status, valorFinal, cupom, criadoEm)
agendamentos/      → datas/horários confirmados (data, hora, cliente...)
cupons/            → cupons de desconto (codigo, desconto, ativo...)
```

---

## 🔑 PASSO 2 — Pegar as credenciais

1. No Firebase, clique no ícone de engrenagem ⚙️ → **Configurações do projeto**.
2. Role até **"Seus aplicativos"** e clique no ícone **</>** (Web).
3. Registre o app com o nome `Higieniza Web`.
4. Copie o objeto `firebaseConfig` que aparecer. Será algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "higieniza-ai.firebaseapp.com",
  projectId: "higieniza-ai",
  storageBucket: "higieniza-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. **Cole essas credenciais nos 3 arquivos**, substituindo o trecho `firebaseConfig`:
   - `index.html` (perto do final, no `<script type="module">`)
   - `admin.html`
   - `agendar.html`

> ⚠️ **MUITO IMPORTANTE:** o Realtime Database exige o campo `databaseURL`. Confira que ele está preenchido com a URL que você guardou no Passo 1:
> ```javascript
> databaseURL: "https://higieniza-ai-default-rtdb.firebaseio.com",
> ```
> Sem esse campo, o banco não conecta.

---

## 🔒 PASSO 3 — Regras de Segurança do Realtime Database

No Firebase → Realtime Database → aba **"Regras"**, cole:

```json
{
  "rules": {
    "orcamentos": {
      ".read": true,
      ".write": true,
      ".indexOn": ["criadoEm"]
    },
    "agendamentos": {
      ".read": true,
      ".write": true,
      ".indexOn": ["data"]
    },
    "cupons": {
      ".read": true,
      ".write": true,
      ".indexOn": ["codigo"]
    }
  }
}
```

> ⚠️ Essas regras são abertas para facilitar o início. Os campos `.indexOn` deixam as buscas mais rápidas. Quando o sistema estiver no ar, recomendo proteger a escrita do admin com **Firebase Authentication**.

---

## 📱 PASSO 4 — Configurar seus números de WhatsApp

Procure por `5511999999999` e substitua pelo número real (formato: 55 + DDD + número, sem espaços) nestes arquivos:
- `app.js` → variável `adminWhats` (recebe novos pedidos)
- `admin.js` → na seção de configurações já é editável pelo painel
- `agendar.html` → variável `adminWhats`

> 💡 **Melhor ainda:** depois de subir o site, edite tudo isso direto no painel **Admin → Configurações**, sem mexer no código.

---

## 🌐 PASSO 5 — Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `higieniza-ai`).
2. Suba todos os arquivos da pasta (pode arrastar pela interface web do GitHub).
3. Vá em **Settings → Pages**.
4. Em "Source", selecione a branch `main` e a pasta `/root`.
5. Salve. Em 1-2 minutos o site estará em:
   `https://SEU_USUARIO.github.io/higieniza-ai/`

> ⚠️ No Firebase, vá em **Configurações → Domínios autorizados** e adicione `SEU_USUARIO.github.io` para o banco funcionar.

---

## ⚙️ PASSO 6 — Configurar a Precificação

Acesse `admin.html` → **Configurações** e ajuste:
- **Preços base** de cada serviço (veículo, sofá, colchão, cadeira)
- **Preço de gasolina/etanol** e consumo do carro (já vem 9 km/L)
- **Adicionais por distância** (5% até 10km, 10% até 30km, 15% acima)
- **Adicionais por cidade** (Santo André +5%, São Caetano +10%)
- **Meta mensal** e horários de atendimento

Tudo fica salvo no navegador e é aplicado automaticamente no cálculo.

---

## 🎟️ Como funcionam os Cupons

No painel **Admin → Cupons**, clique em 5%, 7% ou 10% (ou digite um valor), dê um código (ex: `VERAO10`) e clique em criar. O cliente digita o código no formulário e o desconto é aplicado.

---

## 🧪 Testar antes do Firebase

O sistema funciona em **modo demonstração** mesmo sem configurar o Firebase — o dashboard mostra dados de exemplo e os cupons `DEMO5`, `DEMO7`, `DEMO10` funcionam. Assim você pode ver tudo funcionando antes de conectar o banco.

---

## 💡 Cálculo de Distância — Importante

A versão atual **estima** a distância pela diferença entre os CEPs (funciona, mas é aproximado). Para distância **real e precisa**, recomendo ativar a **Google Maps Distance Matrix API**:

1. Ative em https://console.cloud.google.com (mesma conta do Firebase).
2. No `admin.js`, substitua a função `calcularDistanciaKm()` por uma chamada à API.
3. Posso gerar esse código para você quando quiser — é grátis até 40.000 consultas/mês.

---

## 🔐 Próximos Passos Recomendados

1. **Proteger o admin com senha** (Firebase Authentication) — para ninguém acessar `admin.html` sem login.
2. **Google Maps API** para distância real.
3. **Notificações automáticas** via WhatsApp Business API (em vez de abrir o wa.me manualmente).
4. **EmailJS** como backup de notificação por e-mail.

Quer que eu implemente algum desses? É só pedir! 🚀
