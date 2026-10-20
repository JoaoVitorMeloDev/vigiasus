# Arquitetura do VigiaSUS

## Objetivo

Protótipo educacional para explorar IA aplicada à saúde pública por meio de recuperação documental (RAG), explicabilidade e consulta interoperável via MCP. Não é produto oficial nem sistema de decisão clínica ou epidemiológica.

## Componentes implementados

```text
Navegador (index.html) ── demo web autônoma com dados sintéticos

Expo Go / React Native
       │ HTTP / JSON
       ▼
FastAPI (backend/app/main.py)
       ├── domínio demonstrativo (backend/app/domain.py)
       └── RAG TF-IDF (backend/app/rag.py)
                ├── documentos Markdown locais
                └── Ollama opcional, execução local

Cliente MCP ── stdio ── FastMCP (backend/app/mcp_server.py)
                           ├── ferramentas de consulta demonstrativa
                           └── ferramenta de recuperação documental
```

### Aplicação móvel

O app Expo consulta `GET /api/areas` e `POST /api/ask`. Para Expo Go em um celular físico, configure `EXPO_PUBLIC_API_URL` com o endereço LAN do computador que executa a API; `localhost` no celular aponta para o próprio celular.

### API e índice

FastAPI valida parâmetros, serve áreas demonstrativas e expõe documentação OpenAPI em `/docs`. O índice soma notificações fictícias (40%), chuva simulada (35%) e condição ambiental fictícia (25%). É uma regra transparente para demo, não um algoritmo de machine learning treinado ou validado.

### RAG e modelo local

O retriever divide arquivos Markdown da pasta `backend/knowledge`, vetoriza pergunta e trechos com TF-IDF e retorna fontes. Sem Ollama, mostra trechos relevantes sem gerar texto novo. Para geração opcional, configure `OLLAMA_URL` e `OLLAMA_MODEL`; o modelo recebe somente trechos recuperados, e a resposta continua sujeita a erros. A base atual fala do escopo e uso responsável do protótipo, não de orientação clínica.

### MCP

O servidor FastMCP publica `list_area_risks`, `get_area_risk` e `search_vigiasus_knowledge` para clientes MCP compatíveis. O transporte padrão é stdio; mantenha-o como processo local do cliente MCP e não o exponha diretamente à internet.

## Tecnologias

- **Node.js/npm/npx:** gerenciamento e execução do cliente Expo.
- **Expo Go / React Native:** demo móvel em `mobile/`.
- **Python:** API, domínio demonstrativo, retriever RAG e servidor MCP.
- **MCP:** interface padronizada para ferramentas do projeto.
- **Ollama:** opção de geração local; não é requisito para executar a busca RAG.
- **Java, C# e Rust:** alternativas futuras para reimplementar serviços; não fazem parte deste MVP para evitar serviços redundantes e múltiplas fontes de verdade.
- **MegaBrain:** não é uma dependência deste repositório; qualquer integração futura precisa identificar qual produto/serviço e contrato de API são pretendidos.

## Subir localmente

### Backend Python

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0
```

API no computador: `http://127.0.0.1:8000`; documentação: `http://127.0.0.1:8000/docs`. O host `0.0.0.0` permite o acesso pela rede local do celular; use apenas em uma rede confiável e ajuste o firewall quando necessário.

### MCP local

Em outro terminal, na pasta `backend`, com as dependências instaladas:

```powershell
python -m app.mcp_server
```

Configure o cliente MCP para iniciar esse comando com `backend` como diretório de trabalho. Não compartilhe dados pessoais com ferramentas.

### Expo Go

Em `mobile/`, instale dependências e inicie o Expo:

```powershell
npm install
npx expo start
```

Use o QR code no Expo Go. Para aparelho físico, copie `mobile/.env.example` para `mobile/.env`, substitua o endereço pelo IP LAN do computador e mantenha computador e celular na mesma rede. Não inclua `.env` no Git. Expo Go precisa ser compatível com a versão do SDK Expo declarada em `mobile/package.json`.

### Ollama opcional

Com Ollama instalado e um modelo já disponível localmente, defina `OLLAMA_URL` e `OLLAMA_MODEL` no ambiente do processo da API. Sem essas variáveis, RAG continua em modo de recuperação de trechos. Um serviço Ollama configurado, mas indisponível, retorna erro explícito em vez de fingir uma resposta gerada.

## Limites e segurança

- Todos os bairros, contagens, notificações e sinais ambientais são artificiais.
- Não conectar a dados identificáveis de pacientes nem publicar informações pessoais.
- Não usar o índice para diagnóstico, atendimento, alocação de recursos ou ações sanitárias reais.
- Dados oficiais, validação temporal, análise de vieses, revisão ética e validação por profissionais seriam pré-requisitos de pesquisa, não promessas deste MVP.
- CORS aberto é apenas conveniência de demonstração local; restrinja origens e adicione controles antes de qualquer implantação.
