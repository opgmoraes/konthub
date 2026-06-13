# 🚀 Kont Hub - Plataforma de Gestão Contábil

O **Kont Hub** é um MicroSaaS desenvolvido para centralizar, organizar e otimizar a operação diária de escritórios de contabilidade.

Este projeto ainda é um MVP, mas está sendo desenvolvido a parte da ideia de um aluno do curso de contabilidade (Steve meu amigo) e em breve a meta é se tornar um microsaas

## 🧪 Acesso para Avaliação (Professor)

Para navegar e testar todas as funcionalidades do sistema, utilize as credenciais abaixo, testa ai professor depois quero feedback:

- **Link de Acesso:** [https://konthub-mvp.vercel.app/]
- **E-mail de Teste:** `professor@konthub.com`
- **CPF (Esse foi gerado com gerador para testes):** `028.132.100-05`

## 🛠️ Tecnologias Utilizadas

- **Front-end:** React + Vite
- **Estilização UI/UX:** Tailwind CSS (Padrão Glassmorphism & Monochrome Glow)
- **Banco de Dados (NoSQL):** Firebase Firestore (Tempo real)
- **Autenticação de Usuários:** Firebase Auth
- **Armazenamento em Nuvem (Object Storage):** Cloudflare R2 via Workers Serverless
- **Hospedagem & CI/CD:** Vercel

## 🎯 O que já foi desenvolvido (Fases 1 a 5 - 100% Concluídas)

- **🔐 Segurança e Rotas:** Sistema de login seguro protegido por rotas privadas.
- **🏢 Gestão de Clientes:** CRUD completo de empresas (Cadastro, Leitura, Atualização e Exclusão) salvo no Firestore.
- **📋 Quadro Operacional:** Gestão de tarefas em modelo Kanban.
- **💰 Controle Financeiro:** Registro e listagem de receitas e despesas do escritório.
- **📂 Módulo de Documentos:** Infraestrutura real de nuvem conectada ao Cloudflare R2, permitindo upload, listagem e download de PDFs e guias sem onerar o banco de dados.
- **👥 Gestão de Equipe:** Tela de administração com CRUD de membros e controle hierárquico.

## 🔄 Fase Atual (Fase 6 - Em Andamento)

Estamos na etapa de **Polimento e Implementação de Comunicação Interna**:

- Criação de um Hub de Comunicação Interna (Chat em tempo real com auto-expiração).
- Conexão dos gráficos do Dashboard com os dados dinâmicos do banco.
- Refinamento da responsividade Mobile.

## 🚀 Evolução Futura (Roadmap Pós-MVP)

- **Fase 7 (SaaS e Multitenancy):** Isolamento de dados por arquitetura de múltiplos inquilinos (Multitenant), preparando o sistema para comercialização B2B, para evitar que um escritorio tenha acesso a dados do outro.
- **Fase 8 (Automações Externas):** Disparo de avisos automáticos de vencimento de guias via APIs do WhatsApp e e-mails transacionais.
- **Fase 9 (Inteligência de Dados):** Geração e exportação de relatórios avançados consolidados em PDF e planilhas estruturadas.
