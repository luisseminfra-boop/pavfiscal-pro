# 🛣️ PavFiscal Pro - Sistema de Fiscalização de Pavimentação

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0-blue.svg)](https://github.com/luisseminfra-boop/pavfiscal-pro)
[![Status](https://img.shields.io/badge/Status-Active-green.svg)](https://github.com/luisseminfra-boop/pavfiscal-pro)

Sistema web moderno para gerenciamento de fiscalizações de pavimentação com fotos, relatórios e análise de conformidades.

[Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Uso](#-uso) • [Licença](#-licença)

</div>

---

## 🎯 Funcionalidades

### ✨ Principais
- 📋 **Dashboard Interativo** - Resumo gráfico com KPIs
- 🛠️ **Formulário Completo** - Captura de dados com checklist
- 📸 **Galeria de Fotos** - Organização com filtros
- ⚠️ **Não Conformidades** - Registro com severidade
- 📊 **Progresso Real-time** - Acompanhamento por etapa
- 📄 **Múltiplos Relatórios** - PDF, CSV, por etapa e período

### 🔧 Avançados
- 🌐 Sincronização nuvem (pronto para integração)
- 🔔 Sistema de notificações
- 🌙 Modo escuro
- 💾 Backup automático JSON
- 📱 Design responsivo
- ⚡ Dados em localStorage

---

## 📦 Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Grid e Flexbox responsivos
- **JavaScript** - Lógica vanilla
- **localStorage** - Persistência
- **jsPDF** - Relatórios PDF
- **html2canvas** - Captura de tela

---

## ⚙️ Instalação

```bash
# Clone o repositório
git clone https://github.com/luisseminfra-boop/pavfiscal-pro.git
cd pavfiscal-pro

# Abra em servidor local
python -m http.server 8000
# ou
http-server
```

---

## 🚀 Uso

### 1. Nova Fiscalização
1. **📋 Nova Fiscalização** → Preencha dados obrigatórios
2. Selecione checklist e severidade
3. Adicione fotos (máx. 10x5MB)
4. Salve

### 2. Galeria de Fotos
- **📸 Fotos** → Visualize com filtros
- Clique para ampliar

### 3. Não Conformidades
- **⚠️ Não Conformidades** → Filtre por severidade

### 4. Progresso
- **📊 Progresso** → Barras de cada etapa

### 5. Relatórios
- **📄 Relatórios** → PDF, CSV, por Etapa ou Período

---

## 📁 Estrutura

```
├── index.html       # Interface
├── styles.css       # Estilos
├── app.js           # Lógica
├── README.md        # Docs
└── .gitignore       # Git
```

---

## 🎨 Design

- **Cores**: Azul (#2563eb), Verde (#10b981), Vermelho (#ef4444)
- **Layout**: Sidebar fixa + conteúdo responsivo
- **Componentes**: Cards, formulários, tabelas, gráficos

---

## 📱 Responsividade

| Dispositivo | Adaptação |
|-----------|-----------|
| 📱 Mobile | 1 col, sidebar vertical |
| 📱 Tablet | 2 cols |
| 💻 Desktop | 3-4 cols, sidebar fixa |

---

## 💾 Dados

- **Armazenamento**: localStorage
- **Limite**: 5-10MB por domínio
- **Backup**: Export JSON
- **Limpeza**: Dupla confirmação requerida

---

## 🔐 Segurança

- ✅ Validação de campos
- ✅ Limite de imagem (5MB)
- ✅ Dupla confirmação crítica
- ✅ Dados locais (sem servidor)
- ✅ HTTPS recomendado

---

## 🤝 Contribuindo

1. Fork
2. `git checkout -b feature/nova`
3. `git commit -m 'Add nova'`
4. `git push origin feature/nova`
5. Pull Request

---

## 📝 Licença

MIT License

---

## 👨‍💻 Autor

**Luiz Felipe** - [@luisseminfra-boop](https://github.com/luisseminfra-boop)

---

<div align="center">

**Desenvolvido com ❤️**

</div>
