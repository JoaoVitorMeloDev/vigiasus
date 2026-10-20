# VigiaSUS

**Tema: Inteligência Artificial aplicada à Saúde Pública.**

VigiaSUS é um protótipo acadêmico para demonstrar como recuperação aumentada por busca (RAG), explicabilidade e ferramentas MCP podem ser exploradas em um cenário de vigilância territorial da dengue no Recife. Inclui demo web, app Expo Go, API Python, busca documental e servidor MCP.

> **Aviso:** todos os dados são fictícios. O índice mostrado é uma soma ponderada didática; não é modelo treinado, previsão epidemiológica validada, diagnóstico, orientação clínica ou ferramenta oficial do SUS. Não use para decisões reais.

## O que tem neste repositório

- `index.html`: demonstração web independente, sem backend.
- `mobile/`: app Expo/React Native que consome a API.
- `backend/`: API FastAPI, lógica demonstrativa, RAG local e servidor MCP.
- `backend/knowledge/`: documentos Markdown usados na recuperação.
- `ARCHITECTURE.md`: componentes, tecnologias e instruções de execução.

## Tecnologias

Python, FastAPI, scikit-learn (TF-IDF), MCP Python SDK/FastMCP, Node.js, npm/npx, Expo Go e React Native. Ollama é opcional para geração local; sem ele, o RAG só recupera e apresenta trechos com fontes. Java, C# e Rust não são dependências do MVP; estão documentados como alternativas futuras. MegaBrain não foi adicionado como dependência, pois o produto/API pretendido não foi especificado.

## Início rápido

As instruções completas para API, cliente MCP, app Expo Go e configuração opcional do Ollama estão em [ARCHITECTURE.md](./ARCHITECTURE.md).

Para ver somente a demo web, abra `index.html` no navegador. Para app/API integrados, inicie o backend e o Expo conforme a arquitetura; no Expo Go em aparelho físico, configure o IP LAN do computador em `EXPO_PUBLIC_API_URL`. O app Expo usa SDK 54; confirme a compatibilidade com a versão do Expo Go instalada.

## Limites do protótipo

O índice demonstrativo usa notificações simuladas (40%), chuva simulada (35%) e condição ambiental simulada (25%). O RAG atual pesquisa apenas documentos locais sobre escopo e uso responsável do projeto; não contém protocolo clínico. As ferramentas MCP consultam os mesmos dados artificiais.

Uma versão de pesquisa exigiria dados oficiais com licença adequada, agregação/anônimização, governança, validação temporal, análise de vieses e avaliação com profissionais de vigilância e comunidades. Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes técnicos e próximos passos.
