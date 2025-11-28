# Introdução ao Web Scraping

O **Web Scraping** é uma técnica utilizada para extrair dados de páginas da web de forma automatizada.  
Ele é muito útil para coletar informações de sites que não possuem API disponível, permitindo transformar páginas HTML em dados estruturados.

Neste documento, vamos explicar as bases do Web Scraping em **Python** utilizando as bibliotecas `requests` e `BeautifulSoup`, e também como lidar com páginas que utilizam **JavaScript** para carregar conteúdo.

---

## Conceitos Básicos

- **HTTP Requests**: Para acessar uma página, precisamos fazer uma requisição ao servidor. Em Python, isso pode ser feito com a biblioteca `requests`.  
- **HTML Parsing**: Depois de obter o conteúdo HTML, precisamos processá-lo para extrair as informações desejadas. Para isso, usamos o `BeautifulSoup`.  
- **Seletores**: O `BeautifulSoup` permite selecionar elementos da página através de tags, classes, atributos e até funções personalizadas.

---

## Exemplo de Código em Páginas Estáticas

```python
# web scraping
import requests
from bs4 import BeautifulSoup

pagina = requests.get('https://quotes.toscrape.com/')  # busca o conteúdo html da página

# BeautifulSoup vai transformar o conteúdo da página em um objeto Python
# o parser é a forma como isso será feito
dados_pagina = BeautifulSoup(pagina.text, 'html.parser')

# vamos buscar todas as div com classe "quote" e span com classe "text"
todas_frases = dados_pagina.find_all('div', class_="quote")

for div in todas_frases:
    texto = div.find('span', class_="text").text  # .text pega apenas o texto dentro da tag
    print(texto)
```

---

## Outros Métodos de Seleção

Além de buscar por classes, também é possível filtrar por atributos ou até criar filtros personalizados.

### 1. Seleção por Atributo
```python
todas_frases_2 = dados_pagina.find_all('span', itemprop="text")
for div in todas_frases_2:
    print("Segundo método", div.text)
```

### 2. Seleção por Função de Filtro
```python
def filtro(classe_css):
    return classe_css is not None and len(classe_css) == 5

todas_frases_3 = dados_pagina.find_all('div', class_=filtro)
for div in todas_frases_3:
    print("Terceiro método", div["class"])
```

---

## Funções Úteis do BeautifulSoup

- `find(tag, atributos)`: Retorna o primeiro elemento encontrado.  
- `find_all(tag, atributos)`: Retorna todos os elementos que correspondem ao filtro.  
- `.text`: Extrai apenas o texto do elemento HTML.  
- `.prettify()`: Retorna o HTML formatado com indentação.  

---

## Web Scraping em Páginas com JavaScript

Muitas páginas modernas carregam dados dinamicamente com **JavaScript**, o que torna o scraping um pouco mais complexo. O conteúdo pode não estar presente no HTML inicial da requisição.

### Diferença entre páginas
- **Página estática**: o conteúdo já está no HTML quando usamos `requests.get()`.  
- **Página dinâmica**: o conteúdo é carregado via JavaScript, normalmente por chamadas AJAX.  

### Métodos para lidar com JS

#### 1. Encontrar a API interna
Muitas vezes os dados são carregados via JSON por uma requisição de API.

```python
import requests

url = "https://exemplo.com/api/dados"
res = requests.get(url).json()

print(res)
```

#### 2. Usar Selenium (simula um navegador)
```python
from selenium import webdriver
from bs4 import BeautifulSoup
import time

driver = webdriver.Chrome()
driver.get("https://quotes.toscrape.com/js")  # versão com JS

time.sleep(3)  # espera o JS carregar
html = driver.page_source

soup = BeautifulSoup(html, "html.parser")
frases = soup.find_all("span", class_="text")

for f in frases:
    print(f.text)

driver.quit()
```

#### 3. Usar requests_html (renderiza JS de forma simplificada)
```python
from requests_html import HTMLSession

session = HTMLSession()
r = session.get("https://quotes.toscrape.com/js")

r.html.render(timeout=20)  # renderiza o JS
frases = r.html.find("span.text")

for f in frases:
    print(f.text)
```

---

## Boas Práticas

- Respeite o arquivo **robots.txt** do site, que define as regras para raspagem de dados.  
- Não sobrecarregue o servidor com muitas requisições em pouco tempo.  
- Sempre verifique se a coleta de dados está de acordo com os **termos de uso** do site.  

---

## Conclusão

O **Web Scraping** é uma ferramenta poderosa para coletar dados, mas deve ser usada de forma ética e responsável.  

- Com **Python**, `requests` e `BeautifulSoup`, é possível implementar raspadores simples para páginas estáticas.  
- Para páginas dinâmicas, podemos usar **APIs internas, Selenium ou requests_html** para lidar com o conteúdo carregado por JavaScript.  
