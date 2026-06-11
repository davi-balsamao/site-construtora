# Arquivo: hero-coracoes.md
# Prompt de Implementação: Hero Section Híbrida (Matter.js + CSS Nativo)

**Contexto Geral:**
Preciso implementar uma Hero Section interativa em React com um comportamento visual de "corações flutuantes/explodindo". A prioridade máxima é a **performance no client-side**, exigindo uma separação estrita de arquitetura entre Desktop e Mobile baseada em renderização condicional.

## 📐 Especificações Arquiteturais

A solução final deve ser composta por um **Componente Pai (Gerenciador)** e dois componentes filhos especialistas. O componente que não for acionado pela resolução da tela **não deve** ser instanciado na memória.

### 1. Componente Pai (Viewport Controller)
* Crie um hook ou lógica `useEffect` que detecte `window.innerWidth`.
* **Breakpoint:** Larguras maiores que `768px` renderizam o componente Desktop. Menores ou iguais renderizam o componente Mobile.
* Deve conter um *listener* de `resize` que atualize o estado para lidar com rotação de tela em tablets.

### 2. Componente Mobile (`<MobileExplosionHearts />`)
* **Tecnologia:** React + CSS Keyframes Puro (Acelerado por GPU). **Proibido instanciar Matter.js neste componente.**
* **Efeito Visual:** Uma explosão (*burst*) de cerca de 30 a 40 corações saindo exatamente do centro da tela (`top: 50%, left: 50%`) e espalhando para direções aleatórias.
* **Mecânica de Implementação:**
    * No `mount`, o React deve calcular um array de objetos contendo valores aleatórios de: translação X, translação Y, rotação, escala e *delay* (atraso de início).
    * Injetar esses valores matemáticos como **CSS Custom Properties (Variáveis)** no atributo `style` de cada coração (`style={{ '--tx': '120px', '--delay': '0.2s' }}`).
    * O CSS deve realizar a animação usando `@keyframes` modificando apenas a propriedade `transform` (para evitar *reflow* do DOM).
    * Usar curva de aceleração `cubic-bezier(0.25, 1, 0.5, 1)` para simular o estouro inicial rápido e a desaceleração. Os corações devem desaparecer (`opacity: 0`) no final.

### 3. Componente Desktop (`<DesktopPhysicsHearts />`)
* **Tecnologia:** React + `Matter.js` (Canvas API).
* **Efeito Visual:** ~150 balões com formato de coração subindo como se estivessem cheios de hélio, quicando uns nos outros e parando no topo do container.
* **Física:**
    * **Gravidade Invertida:** Configurar `engine.world.gravity.y = -0.3`.
    * **Corpos Rígidos:** Círculos (`Bodies.circle`), mas com atrito do ar ajustado (`frictionAir: 0.05`) para um movimento flutuante suave.
    * **Limites do Mundo:** Criar retângulos estáticos (`isStatic: true`) nas laterais e, principalmente, no **teto** (para os balões não fugirem do Canvas).
* **Textura (Sprite):**
    * **Não use imagens externas para evitar problemas de CORS.**
    * Converta um SVG limpo e minimalista de coração (cor vermelha `#ef4444`) para **Data URI (Base64)** e injete diretamente na propriedade `render.sprite.texture` de cada corpo rígido.
    * Aplique a escala (`xScale`, `yScale`) necessária para casar a imagem com o raio de colisão do corpo físico.
* **Memory Management (Crítico):** O bloco de *cleanup* do `useEffect` deve, obrigatoriamente, invocar `Matter.Render.stop`, `Matter.Runner.stop`, `Matter.Engine.clear` e limpar o DOM do canvas para evitar *memory leaks*.

## 🛠️ Diretrizes de Entrega para a IA
* **Ação:** Gere o código completo pronto para copiar e colar.
* **Padrão:** Código limpo e componentizado. Se houver CSS, forneça no formato puro ou module o estilo conforme as boas práticas do React.
* **Explicações:** Não me ensine sintaxe de React ou CSS básico. Comente o código **apenas nas linhas que envolvam a matemática dos limites da tela ou lógica de instância do motor físico**.