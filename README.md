# Digital Product Passport (DPP) Frontend

Esta é uma aplicação Next.js (React) que serve de Interface Gráfica para o **Hyperledger Cacti DPP Plugin**. Permite acompanhar o ciclo de vida e submeter transações de origem (Minting), transporte e receção de produtos de forma visual.

## 🚀 Arquitetura do Sistema

O frontend comunica com a rede blockchain **através da API REST do Cacti**.
Isto significa que os consumidores ou empresas não interagem diretamente usando as suas carteiras (ex: MetaMask), mas enviam os dados preenchidos nos formulários para o Backend Cacti (que corre localmente na porta `3000`), e o Cacti, usando o plugin `EVMDPPLeaf` que configurámos, atua como um "proxy fidedigno" e traduz o pedido REST numa transação inteligente (`createDPP`, `updateTransportData`, etc.).

## 📦 Funcionalidades Baseadas em Funções (Role-Based)

Dependendo do utilizador ativo, diferentes ações estão disponíveis:
* **Consumidor:** Pode apenas visualizar a rastreabilidade e submeter *Reviews* (guardadas Off-Chain).
* **Agricultor (`FARMER_ROLE`):** Permissão exclusiva para gerar (Mint) novos Passaportes de Origem.
* **Processador (`PROCESSOR_ROLE`):** Pode agregar produtos ou juntar Certificações.
* **Transportador (`TRANSPORTER_ROLE`):** Acesso único para atualizar a telemetria em tempo real (GPS, Temperatura).
* **Retalhista (`RETAILER_ROLE`):** Acesso para receber o Lote no armazém.
* **Admin:** Gestor absoluto que controla fluxos *Cross-Chain* SATP (Lock/Burn para mover ativos para outra Blockchain).

## 🛠️ Como Iniciar o Projeto (Passo a Passo)

Para teres as camadas todas a funcionar em simultâneo no teu computador, segue esta ordem:

### Passo 1: Ligar a Blockchain Local (EVM)
Abre um terminal e navega para o backend do Cacti onde tens o ficheiro dos Smart Contracts.
```bash
cd /Users/edsondaveiga/Desktop/Desertação/code/cacti-edson-fork/packages/cactus-plugin-dpp
anvil
```
*(Mantém este terminal aberto. O Anvil vai gerar as 10 contas de teste na porta 8545).*

### Passo 2: Compilar, Fazer Deploy e Iniciar a API do Hyperledger Cacti
O nosso script avançado trata de tudo automaticamente! Noutro terminal, na mesma pasta do plugin Cacti, corre o orquestrador. Ele irá:
1. Compilar o `DigitalProductPassport.sol`.
2. Fazer Deploy nativo para a tua instância local do Anvil.
3. Injetar o novo endereço e arrancar a API.
```bash
cd /Users/edsondaveiga/Desktop/Desertação/code/cacti-edson-fork/packages/cactus-plugin-dpp
npx ts-node scripts/launch-api.ts
```
*(A API fica pronta a receber pedidos REST em `http://127.0.0.1:3000`).*

### Passo 3: Iniciar o Frontend
No terminal deste projeto (o teu repositório de frontend), instala as dependências (caso não o tenhas feito) e arranca o servidor Next.js.
```bash
npm install
npm run dev
```

Abre o browser em [http://localhost:3001](http://localhost:3001).
Os cliques nos botões deste Dashboard vão agora efetuar chamadas Reais via `Axios` ao Gateway Cacti, assinando transações Blockchain automaticamente na tua rede local de demonstração!

## Variáveis de Ambiente
Cria um ficheiro `.env.local` na raiz deste projeto com:
```env
NEXT_PUBLIC_CACTI_API_URL=http://localhost:3000
```
Se o teu servidor Cacti estiver noutra porta, ajusta aqui.
