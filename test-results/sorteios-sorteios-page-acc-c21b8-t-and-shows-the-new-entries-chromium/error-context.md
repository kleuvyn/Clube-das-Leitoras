# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sorteios.spec.ts >> sorteios page accepts the full participant list and shows the new entries
- Location: tests/playwright/sorteios.spec.ts:41:5

# Error details

```
TimeoutError: apiRequestContext.post: Timeout 10000ms exceeded.
Call log:
  - → POST http://localhost:3000/api/sorteios
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.15 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 82

```

# Test source

```ts
  158 |     'Andréia Almeida',
  159 |     'Raquel Barros',
  160 |     'Karina Lebre',
  161 |     'Verônica Prometeu',
  162 |     'Fabiana Rocha Machado de Almeida',
  163 |     'Lisys Carvalho Castilho',
  164 |     'Rita de Cássia',
  165 |     'Elaine Brito',
  166 |     'Lory Caldas',
  167 |     'Rejane Melo',
  168 |     'Vivianne Eilers',
  169 |     'Fabiana Almeida',
  170 |     'Duanne Mendes',
  171 |     'Giselle Santos',
  172 |     'Thaís de Souza Abreu',
  173 |     'Beatriz Garcia',
  174 |     'Andrea Suzana Grings',
  175 |     'Fabiany Glaura',
  176 |     'Ana Cecília',
  177 |     'Ayde Guedes',
  178 |     'Luciana Vieira',
  179 |     'Ana Elisa De F Souza',
  180 |     'Thaiane Sena',
  181 |     'Gleicianne Fernandes',
  182 |     'Thaiane Mayara',
  183 |     'Andreia Castro',
  184 |     'Luciana Dutra',
  185 |     'Mônica Maia',
  186 |     'Tarciana Fortaleza',
  187 |     'Maria Irani',
  188 |     'Daniela dos Santos',
  189 |     'Vitória Ramos',
  190 |     'Cristiane Lemos',
  191 |     'Giselle Gomes',
  192 |     'Ana Júlia Rodrigues',
  193 |     'Flávia Paiva',
  194 |     'Loiany Galeno',
  195 |     'Maria Carolina Costa',
  196 |     'Fernanda Tkatsch',
  197 |     'Renata Siqueira Reis',
  198 |     'Lívia Viana',
  199 |     'Lívia Barros',
  200 |     'Luciana Bezerra',
  201 |     'Luana Gomes',
  202 |     'Flavia Silva',
  203 |     'Larissa C. Oliveira',
  204 |     'Auristela Andrade',
  205 |     'Grasiele Lima',
  206 |     'Danielle Paiva',
  207 |     'Karoline Silva',
  208 |     'Cristiane Ferreira',
  209 |     'Natasha Fazolo',
  210 |     'Barbara Vania',
  211 |     'Heloísa Lange',
  212 |     'Milena Oliveira',
  213 |     'Kate Elen Silvério',
  214 |     'Ana Luiza de Melo Souza',
  215 |     'Amanda Marto',
  216 |     'Andréia Lima',
  217 |     'Bethyzabel',
  218 |     'Maria Elisabete Szervinsk',
  219 |     'Gerliane',
  220 |     'Kelly Melo',
  221 |     'Ingrid Moura',
  222 |     'Karina Lima',
  223 |     'Yoná',
  224 |     'Mariana Menezes Souza',
  225 |     'Rizia de Lima',
  226 |     'Lissandra Martins Souza',
  227 |     'Daniella Gama',
  228 |     'Lindalva Matos',
  229 |     'Vanessa Eilers',
  230 |     'Kênia Cardoso',
  231 |     'Nathália Oliveira',
  232 |     'Gabriela Reis',
  233 |     'Giulia Fernandes',
  234 |     'Luciana Nascimento',
  235 |     'Juliana Koetz',
  236 |     'Maria Antônia Barbosa',
  237 |     'Flávia Serrano Belo',
  238 |     'Julianna Curado',
  239 |     'Paula monteiro de castro nessimian',
  240 |     'Luinny',
  241 |     'Natalia Cavallieri',
  242 |     'Clarice Andrade',
  243 |     'Helia Lemos',
  244 |     'Cíntia Ferraz',
  245 |     'Fabíola da Conceição Ferreira',
  246 |     'Ana Carolina Macedo Lübcke',
  247 |     'Diana Carvalho',
  248 |     'Alessandra Avila Correia',
  249 |     'Nícia Morgado Clerot',
  250 |   ];
  251 | 
  252 |   const mesBase = new Date().toISOString().slice(0, 7);
  253 | 
  254 |   const chunkSize = 5;
  255 |   for (let i = 0; i < nomes.length; i += chunkSize) {
  256 |     const chunk = nomes.slice(i, i + chunkSize);
  257 |     await Promise.all(chunk.map(async (nome) => {
> 258 |       const response = await request.post('/api/sorteios', {
      |                                      ^ TimeoutError: apiRequestContext.post: Timeout 10000ms exceeded.
  259 |         data: {
  260 |           action: 'addParticipante',
  261 |           payload: { nome, mesBase },
  262 |         },
  263 |       });
  264 |       expect(response.ok()).toBeTruthy();
  265 |     }));
  266 |   }
  267 | 
  268 |   await page.goto('/sorteios');
  269 |   await expect(page.locator('text=Livea Chefer').first()).toBeVisible({ timeout: 15000 });
  270 |   await expect(page.locator('text=Nícia Morgado Clerot').first()).toBeVisible({ timeout: 15000 });
  271 |   await expect(page.locator('text=Bianca Arruda').first()).toBeVisible({ timeout: 15000 });
  272 | });
  273 | 
```