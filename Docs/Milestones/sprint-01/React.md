# React

## Primeiro Estudo de React

Primeiro passo: 

- Instalar nvm;
- instalar versão do Node desejada;
- Criar projeto React com comando: `npx create-react-app nome-do-seu-projeto` ;

## Passo 1 — Instalar Node.js e npm

O React precisa do **Node.js** (que já vem com o npm).

No Ubuntu, rode no terminal:

- `sudo apt update;`
- `sudo apt install nodejs npm -y;`

Depois, confirme a instalação:

- `node -v;`
- `npm -v;`

## Passo 2 — Criar um novo projeto React

No terminal, escolha a pasta onde vai criar o projeto e rode:

```jsx
`npx create-react-app meu-projeto;`
```

Entre na pasta criada:

- `cd meu-projeto;`

## Passo 3 — Iniciar o servidor de desenvolvimento

Ainda dentro da pasta do projeto:

- `npm start;`

# PASSO 4 — Criar e entender um **componente funcional**

## o que é

Um componente funcional é **uma função JS** (nome em PascalCase) que **recebe props** e **retorna JSX**.

## estrutura mínima

`function MeuComponente(props) {
return <div>algo aqui</div>;
}
export default MeuComponente;`

### regras importantes

- O nome começa com **letra maiúscula** (PascalCase).
- **Retorna um único elemento “pai”** (pode ser um fragmento `<>...</>`).
- Recebe dados pelas **props**.
- Você pode **exportar default** (importa sem chaves) ou **exportar nomeado** (importa com chaves).
1. **Abrir o projeto**
- Abra o terminal na pasta do projeto:

`cd meu-projeto`;
`code .`;

- (ou abra no editor que preferir)
1. **Limpar o App inicial (opcional, mas recomendado)**
- Abra `src/App.js` e substitua pelo básico abaixo:
    
    `// src/App.js
    function App() {
    return (
    <main style={{ padding: 24 }}>
    <h1>Meu App React</h1>
    <p>Base limpa e pronta pra começar ✨</p>
    </main>
    );
    }
    export default App;`
    
    1. **Criar uma pasta de componentes**
    - Crie a pasta `src/components/`.
    1. **Criar seu primeiro componente funcional**
    - Crie o arquivo `src/components/Hello.jsx` com:
        
        `// src/components/Hello.jsx
        function Hello() {
        return <h2>Olá, React! 🚀</h2>;
        }
        export default Hello;`
        
        1. **Usar o componente no App**
        - Edite `src/App.js` para importar e renderizar:
            
            `import Hello from "./components/Hello";
            function App() {
            return (
            <main style={{ padding: 24 }}>
            <h1>Meu App React</h1>
            <Hello />
            </main>
            );
            }
            export default App;`
            
            ### checklist de verificação (passo 4)
            
            - O dev server (`npm start`) recompila sem erros.
            - No navegador, você vê **“Olá, React! 🚀”** logo abaixo de “Meu App React”.

             

# Passo 5: Props vs State

## Conceito Rápido:

- Props: Dados de fora do componente (pai → filho). Imutáveis dentro do componente.
- State: Dados internos do componente, que mudam ao longo do tempo. usamos: `useState` .

## Props na prática:

1. crie `src/components/Saudacao.jsx`:

`// src/components/Saudacao.jsx
function Saudacao({ nome = "Visitante" }) {
return <p>Olá, {nome}! Seja bem-vindo(a) 😄</p>;
}
export default Saudacao;`

1. Use no `App.js`(Duas formas para ver a diferença):

`import Hello from "./components/Hello";
import Saudacao from "./components/Saudacao";`

`function App() {
return (
<main style={{ padding: 24 }}>
<h1>Meu App React</h1>
<Hello />
<Saudacao nome="João" />
<Saudacao /> {/* usa valor padrão "Visitante" */}
</main>
);
}
export default App;`

Extras úteis de Props:

- `children`: conteúdo passado entre `<components>…</components>`;
- `rest/spread`: repassar props para elementos internos `(…rest)`.

Exemplo:

`// src/components/Card.jsx
function Card({ title, children, ...rest }) {
return (
<section
style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 16 }}
{...rest}
>
<h3>{title}</h3>
<div>{children}</div>
</section>
);
}
export default Card;`

Uso:

`import Card from "./components/Card"`;

`<Card title="Sobre mim" id="card-sobre">
<p>Estudando React com foco total! 💪</p>
</Card>`

## state na prática (com `useState`)

1. Crie `src/components/Contador.jsx`:

`// src/components/Contador.jsx
import { useState } from "react";`

`function Contador() {
const [numero, setNumero] = useState(0)`;

`const incrementar = () => {
// forma correta quando depende do valor anterior:
setNumero((n) => n + 1);
};`

`const decrementar = () => {
setNumero((n) => n - 1);
};`

`const zerar = () => setNumero(0);`

`return (
<div style={{ marginTop: 16 }}>
<p>Você clicou {numero} vezes</p>
<button onClick={incrementar}>+1</button>{" "}
<button onClick={decrementar}>-1</button>{" "}
<button onClick={zerar}>Zerar</button>
</div>
);
}
export default Contador;`

1. Use no `App.js`:

`import Hello from "./components/Hello";
import Saudacao from "./components/Saudacao";
import Card from "./components/Card";
import Contador from "./components/Contador";`

`function App() {
return (
<main style={{ padding: 24 }}>
<h1>Meu App React</h1>
<Hello />
<Saudacao nome="João" />
<Saudacao />`

`<Card title="Interação">` 

    `<Contador />`  

 `</Card>` 

`</main>`

`);
}
export default App;`

### checklist de verificação (passo 5)

- Clicar em **+1/-1** muda o número na tela **sem recarregar a página**.
- Você entende que **props** vêm do pai e **state** é interno do componente.

 

# PASSO 6 — Hooks **useState** e **useEffect** (detalhado)

Você já usou `useState`. Agora vamos ao **`useEffect`**, usado para **efeitos colaterais**:

- disparar código **após renderizar** (ex.: buscar dados, configurar timers, atualizar `document.title`, assinar eventos).
- **dependências** controlam quando o efeito roda.
- retornar uma **função de limpeza** para desfazer o efeito (ex.: limpar intervalos, remover listeners).

## padrões de uso do `useEffect`

1. **Sem array de dependências** → roda **após toda renderização**.
2. **Array vazio `[]`** → roda **uma vez** (montagem).
3. **Com dependências `[a, b]`** → roda quando **a ou b mudarem**.

## exemplos práticos

### A) Relógio com intervalo (timer + cleanup)

1. Crie `src/components/Relogio.jsx`:

`// src/components/Relogio.jsx
import { useState, useEffect } from "react";`

`function Relogio() {
const [hora, setHora] = useState(new Date().toLocaleTimeString());`

`useEffect(() => {
const id = setInterval(() => {
setHora(new Date().toLocaleTimeString());
}, 1000);`

```
// limpeza: evita vazamento de memória quando o componente sai da tela
return () => clearInterval(id);

```

`}, []); // roda só uma vez ao montar`

`return <p>Agora são {hora}</p>;
}`

`export default Relogio;`

1. Use no `App.js`:

`import Relogio from "./components/Relogio";
// ...
<Card title="Relógio">
<Relogio />
</Card>`

## B) Efeito dependente do estado (atualizar título da aba)

`// src/components/TituloDinamico.jsx
import { useState, useEffect } from "react";`

`function TituloDinamico() {
const [qtde, setQtde] = useState(0);`

`useEffect(() => {
document.title = Itens: ${qtde};
}, [qtde]); // roda toda vez que qtde mudar`

`return (
<div style={{ marginTop: 16 }}>
<p>Itens: {qtde}</p>
<button onClick={() => setQtde((n) => n + 1)}>Adicionar item</button>
</div>
);
}
export default TituloDinamico;`

### C) Buscando dados (com cleanup via AbortController)

> Dica: usar a API pública `https://jsonplaceholder.typicode.com/posts?_limit=5` quando quiser testar.
> 

`// src/components/Posts.jsx
import { useEffect, useState } from "react";`

`function Posts() {
const [posts, setPosts] = useState([]);
const [erro, setErro] = useState(null);
const [carregando, setCarregando] = useState(true);`

`useEffect(() => {
const ctrl = new AbortController();`

`async function carregar() {   try {     setCarregando(true);     setErro(null);     const resp = await fetch(       "<https://jsonplaceholder.typicode.com/posts?_limit=5>",       { signal: ctrl.signal }     );     if (!resp.ok) throw new Error(`HTTP ${resp.status}`);     const json = await resp.json();     setPosts(json);   } catch (e) {     if (e.name !== "AbortError") setErro(e.message);   } finally {     setCarregando(false);   } }`

`carregar(); return () => ctrl.abort(); // cleanup cancela a requisição se o comp. desmontar`

`}, []);`

`if (carregando) return <p>Carregando...</p>;
if (erro) return <p>Erro: {erro}</p>;`

`return (
<ul>
{posts.map((p) => (
<li key={[p.id](http://p.id/)}><strong>{[p.id](http://p.id/)}.</strong> {p.title}</li>
))}
</ul>
);
}
export default Posts;`

Uso:

`import Posts from "./components/Posts";
// ...
<Card title="Posts (fetch com useEffect)">
<Posts />
</Card>`

### pontos de atenção do `useEffect`

- **Nunca** chame hooks dentro de condições/loops; sempre no **topo** do componente.
- Cuidado com **dependências**: se você usa uma variável dentro do efeito, normalmente ela vai na lista de deps.
- Em modo dev com **React.StrictMode**, os efeitos podem rodar duas vezes (monta/desmonta) para te ajudar a encontrar efeitos sem cleanup. Isso é esperado no dev.

### checklist de verificação (passo 6)

- Relógio atualiza **a cada segundo**.
- O título da aba muda conforme você clica em “Adicionar item”.
- A lista de posts aparece (ou “Carregando...” e depois os itens).

# PASSO 7 — **JSX** a fundo

## o que é

JSX = sintaxe que parece HTML **dentro do JavaScript**. O build transforma JSX em chamadas de `React.createElement`.

## regras principais

- **Um elemento pai** no retorno (use `<>...</>` se não quiser uma `<div>` extra).
- Use `className` (não `class`), `htmlFor` (não `for`), eventos em **camelCase** (`onClick`).
- Expressões JS entre **chaves `{}`**.
- **Atributo `style`** recebe um **objeto** JS (camelCase nas propriedades).

## exemplos essenciais

### expressões e condicionais

`const nome = "React";
const online = true;`

`return (
<>
<h1>Bem-vindo ao {nome}</h1>
{online ? <p>Status: Online ✔️</p> : <p>Status: Offline ❌</p>}
{online && <p>Isso só aparece se online for true</p>}
</>
);`

listas com `map` e `key`

`const linguagens = ["JS", "TS", "Python"];`

`<ul>
{linguagens.map((lang) => (
<li key={lang}>{lang}</li>
))}
</ul>`

classes e estilos

`<div className="caixa destaque">Texto</div>`

`<div style={{ backgroundColor: "#f5f5f5", padding: 12 }}>
Com estilo inline
</div>`

fragmentos

`return (
<>
<h2>Título</h2>
<p>Sem div extra</p>
</>
);`

eventos

`<button onClick={() => alert("clicou!")}>Clique</button>`

componentes controlados (inputs)

`import { useState } from "react";`

`function CampoNome() {
const [nome, setNome] = useState("");`

`return (
<div>
<label htmlFor="nome">Nome:</label>
<input
id="nome"
value={nome}
onChange={(e) => setNome(e.target.value)}
placeholder="Digite seu nome"
/>
<p>Você digitou: {nome || "—"}</p>
</div>
);
}
export default CampoNome;`

Uso:

`import CampoNome from "./components/CampoNome";
// ...
<Card title="Formulário controlado">
<CampoNome />
</Card>`

### Checklist de verificação (passo 7)

- Você consegue **mapear arrays** em listas com `key`.
- Consegue usar condicionais (`? :` e `&&`) para mostrar/ocultar coisas.
- Consegue controlar inputs com `value` + `onChange`.

## App consolidado (colagem rápida)

Se quiser ver tudo junto funcionando, seu `src/App.js` pode ficar assim:

`import Hello from "./components/Hello";
import Saudacao from "./components/Saudacao";
import Card from "./components/Card";
import Contador from "./components/Contador";
import Relogio from "./components/Relogio";
import TituloDinamico from "./components/TituloDinamico";
import Posts from "./components/Posts";
import CampoNome from "./components/CampoNome";`

`function App() {
return (
<main style={{ padding: 24, maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
<h1>Meu App React</h1>`

`<Hello />   <Saudacao nome="João" />   <Saudacao />`

`<Card title="Interação (State)">     <Contador />   </Card>`

`<Card title="Relógio (useEffect + cleanup)">     <Relogio />   </Card>`

`<Card title="Título da aba (dependências do useEffect)">     <TituloDinamico />   </Card>`

`<Card title="Posts (fetch)">
<Posts />
</Card>`

`<Card title="Formulário controlado (JSX)">     <CampoNome />   </Card> </main>`

`);
}
export default App;`
